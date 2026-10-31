"""
Customer Support Ticket Classifier Microservice
FastAPI service running on port 8000
Uses deterministic keyword matching rules to determine ticket category, priority, confidence, and suggested canned replies.
"""

import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Ticket Classifier Service", version="1.0.0")

# Enable CORS for local cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClassifyRequest(BaseModel):
    subject: str = Field(default="", description="Ticket subject line")
    description: str = Field(default="", description="Detailed ticket body")

class ClassifyResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    suggestedReply: str

# Keyword Dictionaries
CATEGORY_KEYWORDS = {
    "billing": [
        "refund", "charge", "charged", "invoice", "payment", "bill", "billing", 
        "subscription", "credit card", "receipt", "pricing", "cost", "renewal", 
        "overcharge", "stripe", "fee", "transaction"
    ],
    "technical": [
        "error", "crash", "crashed", "bug", "not working", "broken", "fail", 
        "failed", "failure", "exception", "500", "404", "freeze", "freezes", 
        "issue", "glitch", "timeout", "outage", "slow", "down", "stack trace", 
        "console", "cannot connect", "api error"
    ],
    "account": [
        "password", "login", "log in", "locked", "unlock", "2fa", "mfa", 
        "authentication", "auth", "reset", "username", "account", "sign in", 
        "credentials", "email address", "profile", "permission", "access denied"
    ],
    "shipping": [
        "delivery", "deliver", "tracking", "track", "late", "package", "parcel", 
        "order", "transit", "delayed", "delay", "shipment", "shipping", "lost", 
        "carrier", "arrived", "damaged in transit", "courier"
    ]
}

PRIORITY_RULES = {
    "urgent": [
        "emergency", "system down", "all users down", "critical outage", 
        "production down", "urgent", "asap", "data loss", "security breach"
    ],
    "high": [
        "down", "outage", "cannot access", "critical", "blocking", "broken for everyone", 
        "immediately", "severe", "deadline"
    ],
    "low": [
        "how to", "how do i", "question", "inquiry", "curiosity", "feedback", 
        "documentation", "doc", "feature request", "suggestion", "clarification"
    ]
}

SUGGESTED_REPLIES = {
    "billing": (
        "Hello, thank you for reaching out regarding your billing inquiry. "
        "We have pulled up your recent invoice and transaction history. "
        "Our billing department is reviewing the charges and will provide a full breakdown or process any eligible adjustments within 1 business day."
    ),
    "technical": (
        "Hello, thanks for contacting our technical support team. "
        "We have logged this issue with our engineering team for triage. "
        "Could you please confirm if this persists after clearing cache or trying in an incognito window, and share any browser console logs if available?"
    ),
    "account": (
        "Hello, thank you for contacting account support. "
        "To protect your security, we have reviewed your account credentials and security status. "
        "If you are unable to log in, please check if a password reset link arrived in your inbox, or let us know so we can trigger a secure identity verification."
    ),
    "shipping": (
        "Hello, thank you for checking on your shipment. "
        "We have requested an updated status report from the logistics carrier. "
        "We will track this package continuously and follow up with the latest delivery window as soon as dispatch confirms."
    ),
    "general": (
        "Hello, thank you for reaching out to our support team. "
        "We have received your request and assigned it to the appropriate specialist. "
        "We are currently reviewing the details and will get back to you shortly."
    )
}

def analyze_text(text: str):
    clean_text = text.lower()
    
    # Calculate category matches
    category_scores = {}
    total_hits = 0
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = 0
        for kw in keywords:
            # Word boundary regex where applicable
            pattern = r'\b' + re.escape(kw) + r'\b' if len(kw) > 3 else re.escape(kw)
            matches = len(re.findall(pattern, clean_text))
            score += matches
        category_scores[category] = score
        total_hits += score

    # Find highest scoring category
    best_category = "general"
    max_score = 0
    for cat, score in category_scores.items():
        if score > max_score:
            max_score = score
            best_category = cat

    # Calculate priority
    detected_priority = "medium"
    
    # Check urgent first
    for kw in PRIORITY_RULES["urgent"]:
        if re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
            detected_priority = "urgent"
            break
            
    if detected_priority == "medium":
        for kw in PRIORITY_RULES["high"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
                detected_priority = "high"
                break
                
    if detected_priority == "medium":
        for kw in PRIORITY_RULES["low"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', clean_text):
                detected_priority = "low"
                break

    # Calculate realistic confidence (0.70 to 0.95)
    if max_score == 0:
        confidence = 0.70
    elif max_score == 1:
        confidence = 0.78
    elif max_score == 2:
        confidence = 0.85
    elif max_score == 3:
        confidence = 0.90
    else:
        confidence = min(0.95, 0.90 + (max_score * 0.01))

    suggested_reply = SUGGESTED_REPLIES.get(best_category, SUGGESTED_REPLIES["general"])

    return best_category, detected_priority, round(confidence, 2), suggested_reply


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "classifier", "port": 8000}


@app.post("/classify", response_model=ClassifyResponse)
def classify_ticket(payload: ClassifyRequest):
    combined_text = f"{payload.subject} {payload.description}".strip()
    category, priority, confidence, suggested_reply = analyze_text(combined_text)
    
    return ClassifyResponse(
        category=category,
        priority=priority,
        confidence=confidence,
        suggestedReply=suggested_reply
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

