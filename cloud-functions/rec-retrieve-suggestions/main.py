import functions_framework
import os
import requests
import json
from google.cloud import storage
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

TMDB_API_KEY = os.environ.get('TMDB_API_KEY', 'Specified environment variable is not set.')

@functions_framework.http
def entry(request):
  request_json = request.get_json(silent=True)
  request_args = request.args

  tmdb_id = ""
  content_type = ""
  locale = ""
  if request_json and all(x in request_json for x in ['tmdb_id', 'content_type', 'locale']):
    tmdb_id = request_json['tmdb_id']
    content_type = request_json['content_type']
    locale = request_json['locale']
  elif request_args and all(x in request_args for x in ['tmdb_id', 'content_type', 'locale']):
    tmdb_id = request_args['tmdb_id']
    content_type = request_args['content_type']
    locale = request_args['locale']
  else:
      return "400: Bad Request"
  similar_titles = fetch_similar_titles(tmdb_id, content_type, locale)
  if similar_titles:
    return similar_titles
  else:
    return "500: Internal Server Error"

# returns a json containing at most 5 recommended titles based on the title it is given
def fetch_similar_titles(tmdb_id, content_type, locale):
  locale = locale.lower()
  storage_client = storage.Client()
  # define gcp bucket from which to retrieve candidates
  bucket = storage_client.bucket("cinelingo-recommendation")

  # download candidates csv file
  cand_fn = f"{content_type}-candidates-{locale}.csv"
  blob = bucket.blob(cand_fn)
  blob.download_to_filename(cand_fn)

  # download candidate embeddings numpy array dump
  embedding_fn = f"{content_type}-candidates-{locale}-embeddings.npy"
  blob = bucket.blob(embedding_fn)
  blob.download_to_filename(embedding_fn)

  # load data as variables
  candidates = pd.read_csv(cand_fn)
  candidates_embedding = np.load(embedding_fn)

  # query for similar titles
  similar_titles_ids = query(tmdb_id, content_type, candidates, candidates_embedding)
  return json.dumps({"results": similar_titles_ids})
  
def query(tmdb_id, content_type, candidates, candidates_embedding):
  #  1. generate tags for query item
  #  2. generate embedding for query item's tags
  #  3. compare query embedding with dataset embeddings
  #  4. find nearest embeddings via cosine calculation
  #  5. return nearest neighbours as most similar items
  
  try:
    # fetch details of title from TMDb
    title = get_title_object(tmdb_id, content_type)
    query_tags = generate_tags(tmdb_id, title["Title"], title["Overview"], content_type)

    # generate embedding of query title
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    query_embedding = model.encode(query_tags, show_progress_bar=True)
    query_embed_array = np.array(query_embedding).reshape(1, -1)

    # calculate cosine similarity of candidate embeddings with query embedding
    csim = pd.DataFrame(cosine_similarity(candidates_embedding, query_embed_array))
    cosine_dict = {}
    for i in range(0,len(csim)):
      cosine_dict[f"{i}"] = csim[0][i]
    cdict_sorted = sorted(cosine_dict.items(), key=lambda item: item[1], reverse=True)
    stop_idx = 0
    if len(cdict_sorted) > 5:
      stop_idx = 5
    else:
      stop_idx = len(cdict_sorted)
    similar_titles = []
    for i in range(0,stop_idx):
      sim_idx = int(cdict_sorted[i][0]) # get index of similar item in dataset
      # append corresponding tmdb id to list of similar items
      similar_titles.append(str(candidates["TMDb_ID"].loc[sim_idx]))
    return similar_titles
  except Exception as e:
    raise e

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

# generate a string of tags to add as a property for a title,
# this can be used later for similarity processing
def get_title_object(tmdb_id, content_type):
  req = f"https://api.themoviedb.org/3/{content_type}/{tmdb_id}?api_key={TMDB_API_KEY}&language=en-US"
  details = requests.get(req).json()
  movie = {} # using generic "movie" term to refer to both films and tv here
  if content_type == "movie":
    movie["Title"] = details["title"]
  else: # clause for TV
    movie["Title"] = details["name"]
  genres_string = ""
  movie["Overview"] = details["overview"]
  if not movie["Overview"]: # check if overview is missing
    imdb_id = fetch_imdb_id(tmdb_id, content_type) # fetch imdb id
    if imdb_id: # check not null
      movie["Overview"] = fetch_missing_overview(imdb_id)
  movie["Tags"] = generate_tags(tmdb_id, movie["Title"], movie["Overview"], content_type) # add tags to the title entry
  return movie

def generate_tags(tmdb_id, title, overview, content_type):
  tags = title + " " + overview + " " # start tags off with title and overview
  try:
    # fetch keywords for title
    req = f"https://api.themoviedb.org/3/{content_type}/{tmdb_id}/keywords?api_key={TMDB_API_KEY}"
    res_json = requests.get(req).json()
    try:
      keywords = res_json["keywords"]
      for keyword in keywords:
        tags += keyword["name"] + ' ' # append keywords as tags
    except KeyError as ke:
      pass
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
      
  except Exception:
    pass
  return tags
