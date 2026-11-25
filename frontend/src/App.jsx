import React, { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("http://localhost:4000/classify", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to classify");
      setResult(data.predictions);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "40px auto" }}>
      <h2>Real-time Image Classification</h2>
      <p>Upload an image and get top predictions from Hugging Face Transformers.</p>

      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={submit} disabled={!file || loading} style={{ marginLeft: 8 }}>
        {loading ? "Classifying..." : "Classify"}
      </button>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {result && (
        <ul>
          {result.map((p, i) => (
            <li key={i}>
              <strong>{p.label}</strong> — {(p.score * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}