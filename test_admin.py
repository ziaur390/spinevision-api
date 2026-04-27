import urllib.request
import urllib.parse
import json

url = "https://spinevision-api.onrender.com/auth/make-admin/ziaurrahman.26261@gmail.com"
req = urllib.request.Request(url, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        print("STATUS:", response.status)
        print("BODY:", response.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS:", e.code)
    print("BODY:", e.read().decode())
except Exception as e:
    print("ERROR:", e)
