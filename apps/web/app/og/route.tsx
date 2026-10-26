import { ImageResponse } from "next/og";

// Node runtime, not Edge: the Vercel `services` deployment target used by this
// repo rejects Edge Function output (see vercel.json). ImageResponse works the
// same on both runtimes.
export const runtime = "nodejs";
export const alt = "Ferroscope — map your blast radius before the breach does";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#08090b",
        color: "#f2eee4",
        padding: "64px 72px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "620px",
          height: "620px",
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(240,166,60,0.18), rgba(240,166,60,0))",
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              border: "1px solid rgba(240,166,60,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "9999px",
                border: "2px solid #f0a63c",
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "20px",
              letterSpacing: "8px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Ferroscope
          </div>
        </div>
        <div
          style={{
            fontSize: "15px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#9a9b9e",
            display: "flex",
          }}
        >
          Black October · seed 2718
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            fontSize: "22px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#f0a63c",
            display: "flex",
          }}
        >
          Exposure observatory
        </div>
        <div
          style={{
            fontSize: "86px",
            lineHeight: 1.0,
            letterSpacing: "-3px",
            display: "flex",
            flexDirection: "column",
            maxWidth: "900px",
          }}
        >
          <span>Map your blast radius</span>
          <span style={{ color: "#f0a63c" }}>before the breach does.</span>
        </div>
        <div
          style={{
            fontSize: "24px",
            lineHeight: 1.45,
            color: "#9a9b9e",
            maxWidth: "760px",
            display: "flex",
          }}
        >
          27 incidents. Declare your stack, see which ones actually intersect it, and rank the fixes
          by risk removed per minute.
        </div>
      </div>

      <div style={{ display: "flex", gap: "1px", backgroundColor: "#24282e" }}>
        {[
          { value: "27", label: "Incidents" },
          { value: "2", label: "Touch this laptop" },
          { value: "3 min", label: "First fix" },
          { value: "0", label: "API keys" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              backgroundColor: "#0f1114",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: "38px", color: "#f2eee4", display: "flex" }}>{item.value}</div>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#6b6d72",
                display: "flex",
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
