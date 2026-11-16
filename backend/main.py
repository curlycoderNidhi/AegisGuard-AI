from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(
    title="AegisGuard AI Backend",
    description="API for Phishing Email & Deepfake Detection",
    version="1.0.0"
)

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    sender: str
    subject: str
    body: str

class PhishingResponse(BaseModel):
    risk_score: float
    is_phishing: bool
    detected_indicators: List[str]
    recommendation: str

@app.post("/api/v1/analyze/email", response_model=PhishingResponse)
async def analyze_email(payload: EmailRequest):
    indicators = []
    risk_score = 0.0

    # Heuristic & Keyword Check
    keywords = ["urgent", "verify now", "suspended", "click here", "reset password", "immediate action"]
    body_lower = payload.body.lower()
    subject_lower = payload.subject.lower()

    matches = [kw for kw in keywords if kw in body_lower or kw in subject_lower]
    if matches:
        risk_score += 0.4 * min(len(matches), 2)
        indicators.append(f"Suspicious urgency keywords found: {', '.join(matches)}")

    # Domain Spoofing Check
    if "@" in payload.sender:
        domain = payload.sender.split("@")[1].lower()
        trusted_brands = ["paypal", "microsoft", "google", "apple", "netflix"]
        for brand in trusted_brands:
            if brand in domain and f"{brand}.com" not in domain:
                risk_score += 0.5
                indicators.append(f"Domain spoofing detected: '{domain}' mimics {brand.capitalize()}")

    risk_score = min(risk_score, 1.0)
    is_phishing = risk_score >= 0.5
    recommendation = "Quarantine email immediately and alert SOC." if is_phishing else "Email is safe for delivery."

    return PhishingResponse(
        risk_score=round(risk_score, 2),
        is_phishing=is_phishing,
        detected_indicators=indicators if indicators else ["No threats identified."],
        recommendation=recommendation
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)