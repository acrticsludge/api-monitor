import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse — Free API Uptime Monitor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Green radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(0,255,135,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            background: "#00d294",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
            boxShadow: "0 0 40px rgba(0,255,135,0.4)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#080808"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
            marginBottom: "16px",
          }}
        >
          Pulse
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#a3a3a3",
            letterSpacing: "0.02em",
            marginBottom: "40px",
          }}
        >
          Free API Uptime Monitoring for Developers
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >
          {["Uptime Monitoring", "Webhooks", "Status Pages", "Health Scoring"].map(
            (f) => (
              <div
                key={f}
                style={{
                  padding: "8px 18px",
                  border: "1px solid rgba(0,255,135,0.25)",
                  borderRadius: "999px",
                  color: "#00d294",
                  fontSize: "15px",
                  letterSpacing: "0.04em",
                }}
              >
                {f}
              </div>
            ),
          )}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            fontSize: "15px",
            color: "#525252",
            letterSpacing: "0.06em",
          }}
        >
          pulsemonitor.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
