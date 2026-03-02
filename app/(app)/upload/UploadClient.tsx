"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const API_BASE = "https://api.almostcrackd.ai";

export default function UploadClient() {
  const supabase = createSupabaseBrowserClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
    setCaptions([]);
    setStatus("");
  }

  // 4-step pipeline: presign -> upload -> register -> generate
  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setStatus("");
    setCaptions([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("Please log in first.");
        setLoading(false);
        return;
      }

      const token = session.access_token;

      // 1) get presigned url
      setStatus("Step 1/4: Generating upload URL...");
      const step1Response = await fetch(API_BASE + "/pipeline/generate-presigned-url", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!step1Response.ok) {
        throw new Error("Step 1 failed with status " + step1Response.status);
      }
      const step1Data = await step1Response.json();
      const presignedUrl = step1Data.presignedUrl;
      const cdnUrl = step1Data.cdnUrl;

      // 2) upload file
      setStatus("Step 2/4: Uploading image...");
      const step2Response = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!step2Response.ok) {
        throw new Error("Step 2 failed with status " + step2Response.status);
      }

      // 3) register image
      setStatus("Step 3/4: Registering image...");
      const step3Response = await fetch(API_BASE + "/pipeline/upload-image-from-url", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!step3Response.ok) {
        throw new Error("Step 3 failed with status " + step3Response.status);
      }
      const step3Data = await step3Response.json();
      const imageId = step3Data.imageId;

      // 4) generate captions
      setStatus("Step 4/4: Generating captions (this may take a moment)...");
      const step4Response = await fetch(API_BASE + "/pipeline/generate-captions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId: imageId }),
      });
      if (!step4Response.ok) {
        throw new Error("Step 4 failed with status " + step4Response.status);
      }

      const step4Data = await step4Response.json();
      setCaptions(Array.isArray(step4Data) ? step4Data : [step4Data]);
      setStatus("Done! Captions generated successfully.");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h1>Upload Image &amp; Generate Captions</h1>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>
        Select an image to upload. The system will generate funny captions for it.
      </p>

      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        onChange={handleFileChange}
      />

      {preview && (
        <div style={{ marginTop: 16 }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: 400, borderRadius: 8 }}
          />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Processing..." : "Upload & Generate Captions"}
        </button>
      </div>

      {status && (
        <p style={{
          marginTop: 12,
          color: status.startsWith("Error") ? "red" : "var(--foreground)",
        }}>
          {status}
        </p>
      )}

      {captions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Generated Captions</h2>
          {captions.map(function (caption, index) {
            return (
              <div key={index} className="card">
                <p style={{ margin: 0 }}>
                  {caption.content || JSON.stringify(caption)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
