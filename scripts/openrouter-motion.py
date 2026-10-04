#!/usr/bin/env python3
"""One-image / one-video OpenRouter runner for Oil Motion studies (stdlib only).

Uses /images and /videos, not Oil Motion's ZenMux request protocol. Credentials
stay in OPENROUTER_API_KEY; request files and saved job files never contain them.
"""

import argparse
import base64
import json
import mimetypes
import os
from pathlib import Path
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ORIGIN = "https://openrouter.ai"
API = ORIGIN + "/api/v1"
TERMINAL = {"completed", "failed", "cancelled", "expired"}
FAILURES = {401: "invalid or unavailable key", 402: "insufficient credits", 403: "access denied", 429: "rate limited"}


class MotionError(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def https_url(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise MotionError("Image and download URLs must use HTTPS without embedded credentials.")
    return parsed


def api_origin(url):
    parsed = https_url(url)
    return parsed.hostname == "openrouter.ai" and parsed.port in (None, 443)


def request(url, key="", payload=None, redirects=False):
    """Honor the environment proxy. Never forward a credential off OpenRouter."""
    for _ in range(6):
        headers = {"User-Agent": "GDamon-OilMotion/1.0", "Accept": "application/json"}
        if key and api_origin(url):
            headers["Authorization"] = "Bearer " + key
        data = None
        if payload is not None:
            data = json.dumps(payload).encode()
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.build_opener(NoRedirect()).open(req, timeout=300) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if redirects and payload is None and error.code in (301, 302, 303, 307, 308):
                location = error.headers.get("Location")
                if not location:
                    raise MotionError("Download redirect is missing its destination.") from None
                url = urllib.parse.urljoin(url, location)
                https_url(url)
                continue
            detail = FAILURES.get(error.code, "request rejected")
            raise MotionError(f"OpenRouter HTTP {error.code}: {detail}. No automatic resubmission.") from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise MotionError("Network/proxy request failed. A submitted job may still exist; do not blindly resubmit.") from None
    raise MotionError("Too many download redirects.")


def api(path, key="", payload=None):
    try:
        result = json.loads(request(API + path, key, payload))
    except (ValueError, UnicodeDecodeError):
        raise MotionError("OpenRouter returned invalid JSON.") from None
    if not isinstance(result, dict) or (result.get("error") and result.get("status") not in TERMINAL):
        raise MotionError("OpenRouter returned an API error; response details withheld to protect credentials and URLs.")
    return result


def load_json(path):
    try:
        result = json.loads(Path(path).read_text())
    except (OSError, ValueError):
        raise MotionError("Cannot read a valid JSON request/job file.") from None
    if not isinstance(result, dict):
        raise MotionError("The request/job file must contain a JSON object.")
    return result


def require_key():
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise MotionError("OPENROUTER_API_KEY is not available in this environment. Save/bind the secret before running.")
    return key


def no_overwrite(path):
    if path.exists():
        raise MotionError("Output/job file already exists; choose a new path or use resume for an existing video job.")


def prepare_parent(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryFile(dir=path.parent) as test:
        test.write(b"ready")
        test.flush()


def validate_payload(payload, kind):
    if not isinstance(payload.get("model"), str) or not payload["model"].strip():
        raise MotionError("Request needs a model string.")
    if not isinstance(payload.get("prompt"), str) or not payload["prompt"].strip():
        raise MotionError("Request needs a nonempty prompt.")
    if any(k in payload for k in ("api_key", "authorization", "headers", "callback_url")):
        raise MotionError("Do not put credentials, headers or webhook URLs in a motion request.")
    if kind == "image":
        if payload.get("n", 1) != 1 or payload.get("stream", False):
            raise MotionError("This runner supports one buffered image per request.")
        if payload.get("output_format", "png") != "png":
            raise MotionError("Image output_format must be png.")
        payload["output_format"] = "png"
    else:
        for name in ("duration", "resolution", "aspect_ratio"):
            if name not in payload:
                raise MotionError(f"Video request must explicitly set {name}.")
        if type(payload["duration"]) is not int or payload["duration"] < 1:
            raise MotionError("Video duration must be a positive integer.")
        if payload.get("frame_images") and payload.get("input_references"):
            raise MotionError("Choose frame_images or input_references; do not silently override references.")
    for field in ("input_references", "frame_images"):
        items = payload.get(field, [])
        if not isinstance(items, list):
            raise MotionError(f"{field} must be an array.")
        for item in items:
            if not isinstance(item, dict) or item.get("type") != "image_url":
                raise MotionError("This runner accepts only image_url references.")
            if not isinstance(item.get("image_url"), dict):
                raise MotionError("Image reference must contain an image_url object.")
            url = item["image_url"].get("url", "")
            if not isinstance(url, str):
                raise MotionError("Image URL must be a string.")
            if kind != "image" or not url.startswith("data:image/"):
                https_url(url)
            if field == "frame_images" and item.get("frame_type") not in ("first_frame", "last_frame"):
                raise MotionError("Video frames need first_frame or last_frame frame_type.")


def validate_video_catalog(payload, catalog):
    model = next((m for m in catalog.get("data", []) if m.get("id") == payload["model"]), None)
    if model is None:
        raise MotionError("Requested video model is absent from the current catalog.")
    for field, capability in (("duration", "supported_durations"), ("resolution", "supported_resolutions"), ("aspect_ratio", "supported_aspect_ratios")):
        if payload[field] not in (model.get(capability) or []):
            raise MotionError(f"The current model catalog does not support this {field}; request was not submitted.")
    for frame in payload.get("frame_images", []):
        if frame["frame_type"] not in (model.get("supported_frame_images") or []):
            raise MotionError("The current model catalog does not support the requested frame type.")
    if payload.get("generate_audio") and not model.get("generate_audio"):
        raise MotionError("The current model catalog does not support audio generation.")
    if "size" in payload and payload["size"] not in (model.get("supported_sizes") or []):
        raise MotionError("The current model catalog does not support the requested video size.")


def save_job(path, response, model=None):
    job_id = response.get("id", "")
    if not isinstance(job_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,200}", job_id):
        raise MotionError("Video response has no valid job ID. Do not resubmit without checking OpenRouter activity.")
    status = response.get("status", "pending")
    if status not in TERMINAL | {"pending", "in_progress"}:
        raise MotionError("Video response has an unrecognized status.")
    safe = {"provider": "openrouter", "id": job_id, "status": status}
    if model:
        safe["model"] = model
    cost = (response.get("usage") or {}).get("cost")
    if isinstance(cost, (int, float)):
        safe["cost_usd"] = cost
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(safe, indent=2) + "\n")
    temporary.replace(path)
    return safe


def finish_video(job, path, output, key, interval, timeout):
    deadline = time.monotonic() + timeout
    previous = None
    while True:
        status = job.get("status", "pending")
        if status != previous:
            print(f"Video status: {status}", flush=True)
            previous = status
        if status == "completed":
            data = request(API + "/videos/" + job["id"] + "/content?index=0", key, redirects=True)
            if len(data) < 12 or data[4:8] != b"ftyp":
                raise MotionError("Downloaded video is not an MP4 container; job is saved for resume.")
            output.parent.mkdir(parents=True, exist_ok=True)
            with output.open("xb") as stream:
                stream.write(data)
            print(f"Video saved ({len(data)} bytes).")
            return
        if status in TERMINAL:
            raise MotionError(f"Video ended with status {status}; sanitized job file is saved.")
        if time.monotonic() >= deadline:
            raise MotionError("Polling deadline reached; use resume with the saved job file. No new job was submitted.")
        time.sleep(min(interval, max(0, deadline - time.monotonic())))
        response = api("/videos/" + job["id"], key)
        if response.get("id") != job["id"]:
            raise MotionError("Polling response changed job ID; stopped.")
        job = save_job(path, response, job.get("model"))


def run(args):
    if args.command == "check":
        key = os.environ.get("OPENROUTER_API_KEY", "").strip()
        print("Credential present: " + ("yes" if key else "no"))
        if args.dry_run:
            print("Dry run: no network requests.")
            return
        if key:
            api("/key", key)
            print("Authentication: accepted")
        for kind in ("images", "videos"):
            catalog = api("/" + kind + "/models")
            print(f"{kind.title()} catalog: {len(catalog.get('data', []))} models")
            candidate = "openai/gpt-image-2" if kind == "images" else "google/veo-3.1-lite"
            model = next((item for item in catalog.get("data", []) if item.get("id") == candidate), None)
            print(candidate + ": " + ("available" if model else "not listed"))
            if model:
                if kind == "images":
                    print("Supported image fields: " + ", ".join(sorted(model.get("supported_parameters", {}))))
                else:
                    for field in ("supported_durations", "supported_resolutions", "supported_aspect_ratios", "supported_frame_images"):
                        print(field + ": " + json.dumps(model.get(field)))
                    prices = {sku: float(cost) for sku, cost in (model.get("pricing_skus") or {}).items()
                              if isinstance(cost, (int, float)) or re.fullmatch(r"[0-9.eE+-]+", str(cost))}
                    print("Video pricing SKUs (inspect units): " + json.dumps(prices))
        if not key:
            raise MotionError("Public catalogs are readable, but OPENROUTER_API_KEY is absent; generation is not ready.")
        return
    output = Path(args.output)
    no_overwrite(output)
    if output.suffix.lower() != (".png" if args.command == "image" else ".mp4"):
        raise MotionError("Use a .png output for images or a .mp4 output for videos.")
    if args.command == "resume":
        job_path = Path(args.job)
        job = load_json(job_path)
        if job.get("provider") != "openrouter" or not re.fullmatch(r"[A-Za-z0-9_-]{1,200}", str(job.get("id", ""))):
            raise MotionError("Not a valid saved OpenRouter job.")
        if job.get("status") not in TERMINAL | {"pending", "in_progress"}:
            raise MotionError("Saved job has an unrecognized status.")
        if args.dry_run:
            print("Valid saved job. Dry run: no network requests.")
            return
        prepare_parent(output)
        return finish_video(job, job_path, output, require_key(), args.poll_interval, args.timeout)
    payload = load_json(args.request)
    if args.command == "image" and args.reference:
        reference = Path(args.reference)
        mime = mimetypes.guess_type(reference.name)[0]
        if mime not in ("image/png", "image/jpeg", "image/webp"):
            raise MotionError("Reference must be a PNG, JPEG or WebP file.")
        if reference.stat().st_size > 20 * 1024 * 1024:
            raise MotionError("Reference exceeds this runner's 20 MiB limit.")
        url = "data:" + mime + ";base64," + base64.b64encode(reference.read_bytes()).decode()
        if not isinstance(payload.setdefault("input_references", []), list):
            raise MotionError("input_references must be an array.")
        payload["input_references"].append({"type": "image_url", "image_url": {"url": url}})
    validate_payload(payload, args.command)
    if args.dry_run:
        print(f"Valid {args.command} request structure. Dry run: no network requests; live model support is not yet verified.")
        return
    key = require_key()
    prepare_parent(output)
    if args.command == "image":
        result = api("/images", key, payload)
        try:
            data = base64.b64decode(result["data"][0]["b64_json"], validate=True)
        except (KeyError, IndexError, TypeError, ValueError):
            raise MotionError("Image response did not contain valid base64 image data.") from None
        if not data.startswith(b"\x89PNG\r\n\x1a\n"):
            raise MotionError("Image response is not PNG; nothing was written.")
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("xb") as stream:
            stream.write(data)
        print(f"Image saved ({len(data)} bytes).")
        return
    job_path = Path(args.job) if args.job else output.with_suffix(".job.json")
    no_overwrite(job_path)
    prepare_parent(job_path)
    validate_video_catalog(payload, api("/videos/models"))
    response = api("/videos", key, payload)
    job = save_job(job_path, response, payload["model"])
    print("Submitted once; sanitized job file saved. Use resume if interrupted.", flush=True)
    finish_video(job, job_path, output, key, args.poll_interval, args.timeout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("check", "image", "video", "resume"):
        sub = commands.add_parser(name)
        sub.add_argument("--dry-run", action="store_true")
        if name != "check":
            sub.add_argument("--output", required=True)
        if name in ("image", "video"):
            sub.add_argument("--request", required=True)
        if name == "image":
            sub.add_argument("--reference")
        if name in ("video", "resume"):
            sub.add_argument("--job", required=name == "resume")
            sub.add_argument("--poll-interval", type=float, default=20)
            sub.add_argument("--timeout", type=float, default=1200)
    args = parser.parse_args()
    if getattr(args, "poll_interval", 20) < 15 or not 1 <= getattr(args, "timeout", 1200) <= 3600:
        parser.error("poll interval must be at least 15 seconds; timeout must be 1–3600 seconds")
    try:
        run(args)
    except (MotionError, OSError, ValueError) as error:
        # Raw OS errors can include paths; do not print arbitrary server bodies.
        print("Error: " + (str(error) if isinstance(error, MotionError) else "Local file/input operation failed."), file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("Interrupted. Resume a saved video job; do not resubmit it.", file=sys.stderr)
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
