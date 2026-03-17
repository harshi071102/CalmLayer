"use client";

import { useState } from "react";

type AnalysisResult = {
  stressLevel: string;
  pressureType: string;
  calmMode: boolean;
  rewrittenMessage: string;
  supportMessage: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("work");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeMessage = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze message.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (level: string) => {
    if (level === "High") return "#e63946";
    if (level === "Medium") return "#f4a261";
    return "#2a9d8f";
  };

  const getStressEmoji = (level: string) => {
    if (level === "High") return "😰";
    if (level === "Medium") return "⚠️";
    return "🙂";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: result?.calmMode
          ? "linear-gradient(180deg, #eef7f2 0%, #f8fbff 100%)"
          : "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        padding: "40px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "950px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              CalmLayer
            </p>
            <h1
              style={{
                margin: "8px 0 8px 0",
                fontSize: "38px",
                lineHeight: 1.1,
              }}
            >
              Emotion-aware message support
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "16px",
              }}
            >
              Detect emotional pressure in communication and rewrite messages in
              a calmer, clearer tone using AI.
            </p>
          </div>

          {result?.calmMode && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                padding: "12px 16px",
                borderRadius: "14px",
                marginBottom: "18px",
                fontWeight: 600,
              }}
            >
              🌿 Calm Mode is active — the interface has shifted into a softer,
              lower-pressure state.
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              Type your message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Type a stressful message here..."
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "18px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
                background: "#ffffff",
                color: "#111827",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                background: "#fff",
                color: "#111827",
                minWidth: "140px",
              }}
            >
              <option value="work">Work</option>
              <option value="Academic">Academic</option>
              <option value="social">Social</option>
            </select>

            <button
              onClick={analyzeMessage}
              disabled={loading || !message.trim()}
              style={{
                padding: "13px 22px",
                borderRadius: "14px",
                border: "none",
                background: loading || !message.trim() ? "#94a3b8" : "#2563eb",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
              }}
            >
              {loading ? "Analyzing..." : "Analyze Message"}
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "18px",
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                padding: "12px 14px",
                borderRadius: "14px",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {result && (
          <div
            style={{
              background: "rgba(255,255,255,0.94)",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "28px" }}>Analysis Result</h2>

              <span
                style={{
                  background: getStressColor(result.stressLevel),
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {getStressEmoji(result.stressLevel)} {result.stressLevel} Stress
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>
                  Pressure Type
                </p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                  {result.pressureType}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "16px",
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "13px" }}>
                  Calm Mode
                </p>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
                  {result.calmMode ? "Activated" : "Normal"}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "18px",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Original Message</h3>
                <p
                  style={{
                    margin: 0,
                    color: "#334155",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message}
                </p>
              </div>

              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "18px",
                  padding: "18px",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                  Suggested Rewrite
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#1e3a8a",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {result.rewrittenMessage}
                </p>

                <button
                  onClick={() => navigator.clipboard.writeText(result.rewrittenMessage)}
                  style={{
                    marginTop: "14px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Copy message
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "18px",
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#166534",
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                {result.supportMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}