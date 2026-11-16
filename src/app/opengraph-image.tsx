import { ImageResponse } from "next/og";
import { OG_LOGO_DATA_URL } from "./_og-logo-data";

export const runtime = "edge";
export const alt = "BankingPoint24 — Payments. Powered for India.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          // BankingPoint24 gradient — deep navy with a teal glow
          background:
            "radial-gradient(60% 80% at 20% 20%, rgba(31,59,139,0.55) 0%, rgba(31,59,139,0) 60%), radial-gradient(50% 60% at 100% 100%, rgba(97,169,58,0.42) 0%, rgba(97,169,58,0) 60%), linear-gradient(135deg, #0b1740 0%, #172b6b 50%, #315620 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        {/* Top: real BankingPoint24 logo lockup */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={OG_LOGO_DATA_URL} alt="BankingPoint24" width={380} height={94} style={{ objectFit: "contain" }} />
        </div>

        {/* Middle headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2
            }}
          >
            Powering Payments for a{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #a5d67f 0%, #c8e7af 100%)",
                backgroundClip: "text",
                color: "transparent"
              }}
            >
              Digital India
            </span>
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 26,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 880,
              lineHeight: 1.4
            }}
          >
            Payment gateway, POS machines, QR collections, AePS, money
            transfer, recharges and bill payments — in one dashboard.
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.75)",
            fontSize: 20
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600 }}>bankingpoint-24.com</span>
            <span>·</span>
            <span>support@bankingpoint-24.com</span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {["PG", "POS", "QR", "AePS", "DMT", "BBPS"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  fontSize: 18,
                  fontWeight: 600
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
