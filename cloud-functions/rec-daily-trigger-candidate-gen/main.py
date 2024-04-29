import functions_framework
import os
import json
import requests
import google.auth
import google.auth.transport.requests as r
import google.oauth2.id_token
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

@functions_framework.http
def entry(request):
  try:
    request_json = request.get_json(silent=True)
    request_args = request.args
    sa_file = write_auth_json()
    fbv = set_firebase_vars(sa_file)

    cred = fbv[0]
    app = fbv[1]
    db = fbv[2]

    locales = get_locales(db)
    id_token = get_id_token()
    for locale in locales:
      invoke_candidate_gen(locale, id_token)
    return ("200: Candidate generation successfully invoked")
  except Exception as e:
    return (f"Error 404 - {e}")

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

# fetches an auth token to authenticate a service-service request
def get_id_token():
  audience = "https://rec-daily-trigger-candidate-gen-ic5gbb3a2q-nw.a.run.app"
  auth_req = r.Request()
  id_token = google.oauth2.id_token.fetch_id_token(auth_req, audience)
  return id_token

# triggers the candidate generation cloud function for a locale
# for both movie & tv media types
def invoke_candidate_gen(locale, id_token):
  # credentials, _ = google.auth.default()
  content_types = ("movie", "tv")
  responses = []
  for ct in content_types:
    target_function_url = f"https://rec-generate-candidates-ic5gbb3a2q-nw.a.run.app?content_type={ct}&locale={locale}"
    headers = {"Authorization": f"Bearer {id_token}"}
    requests.get(target_function_url, headers=headers) # send request and do not await response
    # response = requests.get(target_function_url, headers=headers)
    # responses.append((target_function_url, response))
  return responses