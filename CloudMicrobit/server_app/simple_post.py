import requests
import json

# Insert ip here
# url = "http://192.168.1.xxx:8080/post"
url = "http://127.0.0.1:5000/post"

payload = json.dumps({
  "Temperatur": [["12:00:00", 22.0],
                 ["12:01:00", 23.0],
                 ["12:02:00", 23.5],
                 ["12:03:00", 20.0]],
})
headers = {
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
