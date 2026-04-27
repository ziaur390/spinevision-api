import httpx
import asyncio

async def test_analyze():
    url = "https://ziaur390-spinevision-ml-api.hf.space/analyze"
    print(f"Testing {url} ...")
    
    # We need a dummy image file. Let's create one.
    from PIL import Image
    import io
    
    img = Image.new('RGB', (224, 224), color = (73, 109, 137))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    files = {"file": ("dummy.jpg", img_bytes, "image/jpeg")}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, files=files)
            print("Status:", resp.status_code)
            print("Response:", resp.text)
    except Exception as e:
        print("Error:", e)

asyncio.run(test_analyze())
