import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import fs from "fs";

const app = express();
app.use(cors());

const upload = multer({
  dest: "tmp/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "backend" });
});

app.post("/classify", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: "No image uploaded" });

  const py = spawn("python", ["../ml/infer.py", req.file.path]);
  let output = "";
  let errOutput = "";

  py.stdout.on("data", (chunk) => (output += chunk.toString()));
  py.stderr.on("data", (chunk) => (errOutput += chunk.toString()));

  py.on("close", () => {
    fs.unlink(req.file.path, () => {});
    if (errOutput) {
      return res.status(500).json({ ok: false, error: errOutput });
    }
    try {
      const parsed = JSON.parse(output);
      if (!parsed.ok) return res.status(500).json(parsed);
      return res.json(parsed);
    } catch {
      return res.status(500).json({ ok: false, error: "Invalid model response" });
    }
  });
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ ok: false, error: err.message });
});

app.listen(4000, () => {
  console.log("Backend running at http://localhost:4000");
});