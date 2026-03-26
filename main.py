from fastapi import FastAPI, HTTPException, Request
from schema import ContactForm
from mailing import send_email
from slowapi.util import get_remote_address
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://splitbills.org",
        "https://www.splitbills.org",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore


@app.post("/contact")
@limiter.limit("5/minute")
async def contact(request: Request, form: ContactForm):
    try:
        send_email(form)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send message")
    return {"status": "success", "message": "Message sent"}
