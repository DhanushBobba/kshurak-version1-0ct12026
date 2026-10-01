import React, { useState, useEffect } from "react";
import BiometricHead from "./BiometricHead";
import "./BiometricScanner.css";

interface BiometricScannerProps {
  activeHairstyle?: string;
  onSelectHairstyle?: (style: string) => void;
}

export default function BiometricScanner({
  activeHairstyle = "Executive Fade",
}: BiometricScannerProps) {
  const [activeThumb, setActiveThumb] = useState("3/4");
  const [scanStatus, setScanStatus] = useState("ANALYZING");
  const [scanProgress, setScanProgress] = useState(0);

  const [analysis, setAnalysis] = useState({
    faceShape: "OVAL",
    symmetry: "99.4%",
    hairDensity: "HIGH",
    recommended: "EXECUTIVE FADE",
  });

  // Sync recommended with active hairstyle
  useEffect(() => {
    setAnalysis((prev) => ({
      ...prev,
      recommended: activeHairstyle,
    }));
  }, [activeHairstyle]);

  // Periodic scanning cycle
  useEffect(() => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 1;

      setScanProgress(progress);

      if (progress >= 100) {
        progress = 0;

        setScanStatus("ANALYSIS COMPLETE");

        setTimeout(() => {
          setScanStatus("RE-SCANNING");
        }, 1800);
      } else if (progress === 1 && scanStatus !== "ANALYZING") {
        setScanStatus("ANALYZING");
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="scanner-card">
      {/* TOP STATUS */}
      <div className="scanner-top">
        <div>
          <div className="scanner-status">
            <span className="status-dot" />
            <span>3D BIOMETRIC MATRIX ACTIVE</span>
          </div>

          <div className="scan-status">
            <span className="scan-status-dot" />
            <span>
              {scanProgress < 100
                ? `ANALYZING ${scanProgress}%`
                : "ANALYSIS COMPLETE"}
            </span>
          </div>

          <div className="scan-progress">
            <div
              className="scan-progress-fill"
              style={{
                width: `${scanProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="scanner-morph">
          <small>ACTIVE MORPH</small>
          <strong>{activeHairstyle}</strong>
        </div>
      </div>

      {/* MAIN SCANNER */}
      <div className="scanner-body">
        {/* LEFT THUMBNAILS */}
        <div className="scanner-thumbnails">
          {[
            { id: "front", label: "Front" },
            { id: "3/4", label: "3/4" },
            { id: "side", label: "Side" },
            { id: "top", label: "Top" },
          ].map((thumb) => (
            <div
              key={thumb.id}
              onClick={() => setActiveThumb(thumb.id)}
              className={`scanner-thumb cursor-pointer ${
                activeThumb === thumb.id ? "active" : ""
              }`}
            >
              <span>{thumb.label}</span>
            </div>
          ))}
        </div>

        {/* REAL 3D HEAD */}
        <div className="scanner-viewport">
          <div className="scanner-glow" />

          <BiometricHead view={activeThumb} />
        </div>

        {/* DIAGNOSTICS */}
        <div className="scanner-diagnostics">
          <div>
            <span>FACE SHAPE</span>
            <strong>
              {scanProgress < 25 && scanStatus === "ANALYZING"
                ? "CALC..."
                : analysis.faceShape}
            </strong>
          </div>

          <div>
            <span>SYMMETRY</span>
            <strong>
              {scanProgress < 60 && scanStatus === "ANALYZING"
                ? `${(85 + scanProgress * 0.144).toFixed(1)}%`
                : analysis.symmetry}
            </strong>
          </div>

          <div>
            <span>HAIR DENSITY</span>
            <strong>
              {scanProgress < 85 && scanStatus === "ANALYZING"
                ? "MAPPING..."
                : analysis.hairDensity}
            </strong>
          </div>

          <div>
            <span>RECOMMENDED</span>
            <strong>{analysis.recommended.toUpperCase()}</strong>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="scanner-footer">
        <span>Φ = 1.618 GOLDEN RATIO</span>

        <span>SYMMETRY: {analysis.symmetry}</span>

        <span className="drag-label">↔ DRAG TO ROTATE 3D HEAD</span>
      </div>
    </section>
  );
}

