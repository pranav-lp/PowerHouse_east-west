"""Small private service for GitHub summaries and Aadhaar encryption."""
from __future__ import annotations

import base64
import os
import re
from urllib.parse import urlparse

import httpx
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="DocPass private API", version="0.1.0")


async def require_user(authorization: str | None = Header(default=None)) -> dict[str, object]:
    """Require a Supabase access token; never expose these endpoints anonymously."""
    secret = os.getenv("SUPABASE_JWT_SECRET")
    if not secret:
        raise HTTPException(status_code=503, detail="auth_not_configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing_bearer_token")
    try:
        claims = jwt.decode(authorization[7:], secret, algorithms=["HS256"],
                            audience="authenticated", options={"require": ["sub", "exp", "aud"]})
        return claims
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="invalid_bearer_token") from exc


class RepoRequest(BaseModel):
    url: str = Field(min_length=10, max_length=300)


class RepoSummary(BaseModel):
    description: str
    tags: list[str]


class AadhaarRequest(BaseModel):
    number: str = Field(min_length=12, max_length=12, pattern=r"^\d{12}$")


class AadhaarResponse(BaseModel):
    ciphertext: str
    last4: str


def _repo_coordinates(url: str) -> tuple[str, str]:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    if parsed.hostname not in {"github.com", "www.github.com"}:
        raise HTTPException(status_code=400, detail="unsupported_repository")
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) < 2 or not all(re.fullmatch(r"[A-Za-z0-9_.-]+", p) for p in parts[:2]):
        raise HTTPException(status_code=400, detail="invalid_repository_url")
    return parts[0], parts[1].removesuffix(".git")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/summarize-repo", response_model=RepoSummary)
async def summarize_repo(body: RepoRequest, _claims: dict[str, object] = Depends(require_user)) -> RepoSummary:
    owner, repo = _repo_coordinates(body.url)
    headers = {"Accept": "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28"}
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"https://api.github.com/repos/{owner}/{repo}/readme", headers=headers)
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="readme_unavailable_or_private")
    if response.status_code == 403:
        raise HTTPException(status_code=429, detail="github_rate_limited")
    if not response.is_success:
        raise HTTPException(status_code=502, detail="github_unavailable")
    readme = response.text[:12000]
    claude_key = os.getenv("ANTHROPIC_API_KEY")
    if not claude_key:
        raise HTTPException(status_code=503, detail="summarizer_not_configured")
    async with httpx.AsyncClient(timeout=25) as client:
        result = await client.post("https://api.anthropic.com/v1/messages", headers={
            "x-api-key": claude_key, "anthropic-version": "2023-06-01", "content-type": "application/json",
        }, json={"model": os.getenv("CLAUDE_MODEL", "claude-3-5-haiku-latest"), "max_tokens": 300,
                "system": "Summarize this student project in 2 concise sentences. Then suggest 2-4 short technology/domain tags. Return strict JSON with keys description and tags.",
                "messages": [{"role": "user", "content": readme}]})
    if not result.is_success:
        raise HTTPException(status_code=502, detail="summarizer_unavailable")
    # Keep output parsing narrow and reject malformed model output instead of trusting it.
    import json
    try:
        content = result.json()["content"][0]["text"]
        parsed = json.loads(content[content.find("{"):content.rfind("}") + 1])
        return RepoSummary(description=str(parsed["description"])[:700], tags=[str(t)[:40] for t in parsed["tags"][:5]])
    except (KeyError, ValueError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="invalid_model_response") from exc


@app.post("/aadhaar/encrypt", response_model=AadhaarResponse)
async def encrypt_aadhaar(body: AadhaarRequest, _claims: dict[str, object] = Depends(require_user)) -> AadhaarResponse:
    key_b64 = os.getenv("AADHAAR_ENCRYPTION_KEY")
    if not key_b64:
        raise HTTPException(status_code=503, detail="encryption_not_configured")
    try:
        key = base64.urlsafe_b64decode(key_b64)
        if len(key) != 32:
            raise ValueError("key must be 32 bytes")
    except (ValueError, base64.binascii.Error) as exc:
        raise HTTPException(status_code=500, detail="invalid_encryption_key") from exc
    nonce = os.urandom(12)
    ciphertext = AESGCM(key).encrypt(nonce, body.number.encode("ascii"), None)
    # Store version + nonce + ciphertext as one base64url value. Plaintext is never logged or returned.
    packed = b"v1." + nonce + ciphertext
    return AadhaarResponse(ciphertext=base64.urlsafe_b64encode(packed).decode("ascii"), last4=body.number[-4:])
