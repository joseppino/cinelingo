import functions_framework
import requests
from bs4 import BeautifulSoup

@functions_framework.http
def entry(request):
  # Set CORS headers for the preflight request
  if request.method == 'OPTIONS':
      # Allows GET requests from any origin with the Content-Type
      # header and caches preflight response for an 3600s
      headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600'
      }

      return ('', 204, headers)

  # Set CORS headers for the main request
  headers = {
      'Access-Control-Allow-Origin': '*'
  }


  request_json = request.get_json(silent=True)
  request_args = request.args

  imdb_id = ""

  if request_json and 'imdbId' in request_json:
      imdb_id = request_json['imdbId']
  elif request_args and 'imdbId' in request_args:
      imdb_id = request_args['imdbId']
  else:
      return "Error 400 - Bad Request"
  
  content_description = scrape_imdb_description(imdb_id)
  if(content_description):
    return (content_description, 200, headers)
  else:
    return "Error 500 - Internal Server Error"

def scrape_imdb_description(imdb_id):
  # add request headers to circumvent web scraping blocker
  headers = {
      'accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36 Edg/101.0.1210.53',
      'Accept-Language': 'en-US,en;q=0.9,it;q=0.8,es;q=0.7',
      'referer': 'https://www.google.com/',
      'cookie': 'DSID=AAO-7r4OSkS76zbHUkiOpnI0kk-X19BLDFF53G8gbnd21VZV2iehu-w_2v14cxvRvrkd_NjIdBWX7wUiQ66f-D8kOkTKD1BhLVlqrFAaqDP3LodRK2I0NfrObmhV9HsedGE7-mQeJpwJifSxdchqf524IMh9piBflGqP0Lg0_xjGmLKEQ0F4Na6THgC06VhtUG5infEdqMQ9otlJENe3PmOQTC_UeTH5DnENYwWC8KXs-M4fWmDADmG414V0_X0TfjrYu01nDH2Dcf3TIOFbRDb993g8nOCswLMi92LwjoqhYnFdf1jzgK0'
  }

  title = imdb_id
  URL = f"https://www.imdb.com/title/{title}/plotsummary"
  response = requests.get(URL, headers=headers)
  soup = BeautifulSoup(response.content, "html.parser")

  # ! class name is very much subject to change
  # this line finds all div elements with the specified class
  els = soup.find_all("div", class_="ipc-html-content-inner-div")

  try:
    if(els[0].text):
      # return the first plot summary (the one used by IMDB itself on the film's page)
      return(els[0].text)
    else:
      return None
  except IndexError as err:
    print(err)
    return None