# Hugging Face Transformers: Best Practice for Image Processing (Real-time Demo)

This mini project shows a practical pattern for **real-time image classification**:

- **Python + Hugging Face Transformers** for model inference
- **Node.js (Express)** as an API gateway
- **React** frontend for image upload and result display

It is intentionally lightweight, but structured like a real use case (e.g., classify photos uploaded by users in a web app).

---

## Use Case Scenario

You run a platform where users upload images and you need quick automatic labeling (e.g., "dog", "car", "food") to improve search and moderation workflows.

### Common problems in production
1. Wrong image format handling (RGBA/CMYK issues)
2. Slow cold starts because model loads repeatedly
3. Inconsistent preprocessing between environments
4. Blocking backend threads for heavy inference

### How this starter addresses them
- Uses `AutoImageProcessor` + `AutoModelForImageClassification` (recommended preprocessing/model pairing)
- Converts images to RGB before inference
- Loads model once at process start
- Node isolates ML logic in Python process (easy to scale as separate service later)

---

## Project Structure

- `ml/infer.py` — Python inference script using Transformers
- `backend/server.js` — Express API (`POST /classify`)
- `frontend/src/App.jsx` — React upload UI
- package files for backend/frontend dependency setup

---

## Quick Start

## 1) Python setup
```bash
python -m venv .venv
# mac/linux
source .venv/bin/activate
# windows
# .venv\Scripts\activate

pip install torch transformers pillow
```

## 2) Backend setup
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

## 3) Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default).

---

## API

### `POST /classify`
- Form-data field: `image` (file)
- Response:
```json
{
  "ok": true,
  "predictions": [
    { "label": "Labrador retriever", "score": 0.87 },
    { "label": "golden retriever", "score": 0.08 },
    { "label": "kuvasz", "score": 0.02 }
  ]
}
```

---

## Best Practices Included

1. **Use model + processor pair from same checkpoint**
   - Example: `google/vit-base-patch16-224`
2. **Do explicit RGB conversion**
   - `Image.open(...).convert("RGB")`
3. **Keep model warm**
   - Load once globally, not per request
4. **Return top-k predictions with scores**
   - Better UX and easier debugging
5. **Limit upload size + file type**
   - Security and stability basics in Node

---

## Next Improvements (Production Guidance)

- Move Python to dedicated microservice (FastAPI + gunicorn/uvicorn workers)
- Add async queue for high traffic (Redis + worker)
- Cache frequent image hashes
- Add observability (latency, model version, error rate)
- Add content safety models before user-facing publish

---

## Notes

- First inference can be slower due to model download.
- If running on CPU only, keep expectations realistic for latency.
- For sensitive domains (medical/legal), never rely on generic labels alone.