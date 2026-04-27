import urllib.request
import urllib.parse
import json

url = "https://spinevision-api.onrender.com/auth/login"
data = urllib.parse.urlencode({'username': 'test@test.com', 'password': 'wrongpassword'}).encode()
req = urllib.request.Request(url, data=data)
req.add_header('Origin', 'https://spinevisionai.netlify.app')

try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("HEADERS:", response.headers)
        print("BODY:", response.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("HEADERS:", e.headers)
    print("BODY:", e.read().decode())
except Exception as e:
    print("ERROR:", e)
