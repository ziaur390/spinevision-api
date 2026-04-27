import httpx
import asyncio

async def main():
    url = "https://ziaur390-spinevision-ml-api.hf.space/"
    print(f"Testing {url} ...")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            print("Status:", resp.status_code)
            print("Response:", resp.text)
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
