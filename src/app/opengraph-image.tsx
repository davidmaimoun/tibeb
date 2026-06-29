import { ImageResponse } from "next/og";

export const alt = "Tibeb — Private guided journeys across Ethiopia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#241409 0%,#3a2412 55%,#0b7a41 140%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 14, width: "100%" }}>
          <div style={{ flex: 1, background: "#12a65a" }} />
          <div style={{ flex: 1, background: "#f7c600" }} />
          <div style={{ flex: 1, background: "#e11d22" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, color: "#fff6e6", letterSpacing: -2 }}>
            Tibeb
          </div>
          <div style={{ fontSize: 40, color: "#f7c600", marginTop: 8 }}>
            Private guided journeys across Ethiopia
          </div>
        </div>

        <div style={{ fontSize: 28, color: "rgba(255,246,230,0.7)" }}>
          14-day grand circuit · Lalibela · Simien · Danakil · Omo Valley
        </div>
      </div>
    ),
    { ...size },
  );
}