import uvicorn
import os
import requests
import signal
import sys

from threading import Thread
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import create_cat, get_cats, create_tables, delete_cat

from pydantic import BaseModel

create_tables()

class Saved(BaseModel):
    link: str

app = FastAPI(
    title="Tauri + FastAPI sidecar",
    version="0.1.0"
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/", tags=["System"])
async def root():
    return f"Hello from Python {sys.version.split()[0]} and FastAPI sidecar!"

@app.get("/random_cat", tags=["Cats"], summary="Get random cat")
async def get_cat():
    url = "https://api.thecatapi.com/v1/images/search"

    response = requests.get(url)

    if response.status_code == 200:
        cat_data = response.json()
        cat_image_url = cat_data[0]['url']
        return {"url": cat_image_url}
    else:
        raise HTTPException(status_code=502, detail="No good")

@app.post("/save", tags=["Cats"], summary="Save the cat :)")
async def upload_cat(link: Saved):
    try:
        create_cat(link.link)
        return "Success! XD"
    except Exception as e:
        print(e)
        raise HTTPException(status_code=502, detail="Something went wrong ig... T^T")
    
@app.post("/delete", tags=["Cats"], summary="Delete the cat :(")
async def delete_cat_api(link: Saved):
    try:
        success = delete_cat(link.link) 
        if success:
            return {"message": "Success!"}
        else:
            raise HTTPException(status_code=404, detail="Cat not found :(")
    except Exception as e:
        print(f"Error in delete_cat_api: {e}")
        raise HTTPException(status_code=502, detail="Something went wrong T^T")


@app.get("/get_saved", tags=["Cats"])
async def get_saved():
    return get_cats()

def shutdown():
    print("Received shutdown command. Exiting...")
    os.kill(os.getpid(), signal.SIGINT)

# You need to listen to inputs for a server to shutdown
def listen_to_stdin():
    for line in sys.stdin:
        line = line.strip()
        print(f"[sidecar] Received from stdin: {line}")
        if line == "sidecar shutdown":
            print("[sidecar] Shutdown command received via stdin.")
            shutdown()

def run_server_thread():
    run_server = lambda: uvicorn.run(app, host="127.0.0.1", port=8000)
    
    listen_thread = Thread(target=listen_to_stdin, daemon=True)
    server_thread = Thread(target=run_server)
    
    listen_thread.start()
    server_thread.start()

    server_thread.join()


if __name__ == "__main__":
    run_server_thread()