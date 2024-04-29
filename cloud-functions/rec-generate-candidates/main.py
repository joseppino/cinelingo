import functions_framework
import os
import requests
import csv
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import pandas as pd
from google.cloud import storage
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

TMDB_API_KEY = os.environ.get("TMDB_API_KEY", 'Specified environment variable is not set.')

@functions_framework.http
def entry(request):
  request_json = request.get_json(silent=True)
  request_args = request.args

  locale_arg = ""
  if request_args and "locale" in request.args:
    locale_arg = request_args.get("locale")
  elif request_json and "locale" in request_json:
    locale_arg = request_json["locale"]

  sa_file = write_auth_json()
  fbv = set_firebase_vars(sa_file)
  cred = fbv[0]
  app = fbv[1]
  db = fbv[2]

  statuses = []
  locales = []
  # check condition if locale is specified as a parameter,
  # else get all supported locales from Firestore
  if locale_arg:
    locales = [locale_arg]
  else:
    locales = get_locales(db)
    subset_locales = locales[:len(locales)//2] # split locales list for cross-cloud-function processing
  for locale in subset_locales:
    # generate candidates for both movie and tv media types
    statuses.append(generate_candidates("movie", locale))
    statuses.append(generate_candidates("tv", locale))

  for status in statuses:
    if status != "success":
      return "500: At least one stage of candidate generation failed - see logs."
    
  return "200: Candidate generation complete."
    
def generate_candidates(content_type, locale):
  try:
    # create request for content with adequate score and vote count - to filter low quality results
    req = ""
    if content_type == "movie":
      req = f"https://api.themoviedb.org/3/discover/{content_type}?include_adult=false&language=en-US&api_key={TMDB_API_KEY}&vote_average.gte=6&with_original_language={locale}&vote_count.gte=50"
    else: # if content type is TV, use lower vote threshold
      req = f"https://api.themoviedb.org/3/discover/{content_type}?include_adult=false&language=en-US&api_key={TMDB_API_KEY}&vote_average.gte=6&with_original_language={locale}&vote_count.gte=30"
    res_json = requests.get(req).json()
    total_pages = res_json["total_pages"] # fetch total number of pages to iterate through
    if total_pages > 100:
      total_pages = 100 # cap the number of pages if too many are returned
    genre_map = create_genre_map(content_type)
    qualified_items = []
    for page_num in range(1, total_pages+1):
      page_req = req + f"&page={page_num}"
      page = requests.get(page_req).json()
      # iterate over each item returned within the page
      for item in page["results"]:
        refined_item = extract_valuable_data(item, content_type, genre_map)
        qualified_items.append(refined_item)
      # break
    fileref = f"{content_type}-candidates-{locale}"
    write_candidates_csv(qualified_items, fileref)
    generate_embeddings(fileref)
    # upload files to gcp object storage
    upload_blob("cinelingo-recommendation", f"{fileref}.csv", f"{fileref}.csv") # upload candidates in plaintext csv
    upload_blob("cinelingo-recommendation", f"{fileref}-embeddings.npy", f"{fileref}-embeddings.npy") # upload candidate embeddings
    return "success"
  except Exception as e:
    raise e

# uploads a file to gcp object storage
def upload_blob(bucket_name, source_file_name, destination_blob_name):
  try:
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)
    print(
        f"File {source_file_name} uploaded to {destination_blob_name}."
    )
  except Exception as e:
    raise e

# generate embeddings from csv file, 
# write embeddings as numpy array for later reference 
def generate_embeddings(fileref):
  data = pd.read_csv(f"{fileref}.csv")
  X = np.array(data.Tags)
  tag_data = X
  # encode tags using NLP model into embedding space
  model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2') 
  embeddings_x = model.encode(tag_data, show_progress_bar=True)
  X = np.array(embeddings_x)
  # write numpy array out to file
  with open(f"{fileref}-embeddings.npy", 'wb') as f:
    np.save(f, embeddings_x)

# fetch genres from tmdb api and create genre map dictionary
def create_genre_map(content_type):
  try:
    req = f"https://api.themoviedb.org/3/genre/{content_type}/list?api_key={TMDB_API_KEY}&language=en-US"
    res_json = requests.get(req).json()
    genres = res_json["genres"]
    genre_map = {}
    for genre in genres:
      genre_map[genre["id"]] = genre["name"] # map genre id to genre name
    return genre_map
  except Exception as e:
    raise e  

def extract_valuable_data(obj, content_type, genre_map):
  movie = {} # using generic "movie" term to refer to both films and tv here
  try:
    if content_type == "movie":
      movie["Title"] = obj["title"]
      movie["Release_Date"] = obj["release_date"]
    else: # clause for TV
      movie["Title"] = obj["name"]
      movie["Release_Date"] = obj["first_air_date"]
  except KeyError as k_err:
    print(k_err)
  genres_string = ""
  for genre_id in obj["genre_ids"]:
    try:
      genres_string += f"{[genre_map[genre_id]][0]}," # add each genre to genre string via dictionary lookup
    except KeyError as k_err:
      print(k_err)
  if genres_string:
    genres_string = genres_string[0:-1] # cut off trailing comma
    movie["Genres"] = genres_string
  movie["Popularity"] = obj["popularity"]
  movie["TMDb_ID"] = obj["id"]
  movie["Average_Score"] = obj["vote_average"]
  movie["Overview"] = obj["overview"]
  if not movie["Overview"]: # check if overview is missing
    imdb_id = fetch_imdb_id(movie["TMDb_ID"], content_type) # fetch imdb id
    if imdb_id: # check not null
      movie["Overview"] = fetch_missing_overview(imdb_id)
  movie["Tags"] = generate_tags(movie["TMDb_ID"], movie["Title"], movie["Overview"], content_type) # add tags to the title entry
  return movie

def fetch_imdb_id(tmdb_id, content_type):
  try:
    # call TMDb movie details endpoint
    req = f"https://api.themoviedb.org/3/{content_type}/{tmdb_id}?api_key={TMDB_API_KEY}&language=en-US"
    details = requests.get(req).json()
    try:
      if details["imdb_id"]:
        return details["imdb_id"]
      else:
        return None
    except KeyError as ke:
      return None
  except Exception as e:
    raise e

# patch missing movie overview by fetching it from IMDb instead of TMDb
def fetch_missing_overview(imdb_id):
  try:
    # call self-made endpoint for web-scraped IMDb content description
    req = f"https://fetch-imdb-description1-ic5gbb3a2q-nw.a.run.app/?imdbId={imdb_id}"
    overview = requests.get(req).text
    return overview
  except Exception as e:
    raise e

def write_candidates_csv(candidates, fileref):
  print("Writing csv...")
  with open(f"{fileref}.csv", 'w', newline='') as candidates_csv:
    fieldnames = candidates[0].keys()
    writer = csv.DictWriter(candidates_csv, fieldnames=fieldnames)
    writer.writeheader()
    for candidate in candidates:
      writer.writerow(candidate)

# generate a string of tags to add as a property for a title,
# this can be used later for similarity processing
def generate_tags(tmdb_id, title, overview, content_type):
  tags = title + " " + overview + " " # start tags off with title and overview
  try:
    # fetch keywords for title
    req = f"https://api.themoviedb.org/3/{content_type}/{tmdb_id}/keywords?api_key={TMDB_API_KEY}"
    keywords = requests.get(req).json()["keywords"]
    for keyword in keywords:
      tags += keyword["name"] + ' ' # append keywords as tags

    # fetch credits for title
    req = f"https://api.themoviedb.org/3/{content_type}/{tmdb_id}/credits?api_key={TMDB_API_KEY}&language=en-US"
    res = requests.get(req).json()

    cast = res["cast"]
    stopIndex = 0
    if len(cast) > 5:
      stopIndex = 5
    elif len(cast) > 0 and len(cast) <= 5:
      stopIndex = len(cast)
    if(stopIndex > 0):
      for i in range(0, stopIndex):
        tags += cast[i]["name"] + ' ' # append important cast members' name as tags

    crew = res["crew"]
    for crew_member in crew:
      # if listed, add director's name as a tag
      if crew_member["job"] == "Director":
        tags += crew_member["name"] + ' '
      elif crew_member["job"] == "Executive Producer": # equivalent for TV shows
        tags += crew_member["name"] + ' '
      
  except Exception as e:
    print(e)
  return tags

def write_auth_json():
  service_account_dict = json.loads(os.environ.get('firestore_service_account', 'Specified environment variable is not set.'))
  filename = "firestore_service_account.json"
  with open(filename, 'w', encoding='utf-8') as f:
    json.dump(service_account_dict, f, ensure_ascii=False, indent=4)
  return filename

def set_firebase_vars(filename):
  cred = credentials.Certificate(filename)
  app = firebase_admin.initialize_app(cred)
  db = firestore.client()
  return (cred, app, db)

def get_locales(db):
  locales = []
  docs = db.collection(u'languages').stream()
  for doc in docs:
    doc_dict = doc.to_dict()
    locale_ref = doc_dict["reference"].lower()
    locales.append(locale_ref)
  return locales