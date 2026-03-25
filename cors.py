from fastapi.middleware.cors import CORSMiddleware
from main import app

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://splitbills.com",
        "https://www.splitbills.com",
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
