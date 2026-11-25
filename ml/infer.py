import json
import sys
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_NAME = "google/vit-base-patch16-224"

# Best practice: load once when process starts (not on each request)
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
model.eval()

def classify_image(image_path: str, top_k: int = 3):
    # Best practice: normalize input mode
    image = Image.open(image_path).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits

    probs = torch.softmax(logits, dim=-1)[0]
    scores, idxs = torch.topk(probs, k=top_k)

    return [
        {
            "label": model.config.id2label[idx.item()],
            "score": round(score.item(), 4),
        }
        for score, idx in zip(scores, idxs)
    ]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "Usage: python infer.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        preds = classify_image(image_path, top_k=3)
        print(json.dumps({"ok": True, "predictions": preds}))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        sys.exit(1)