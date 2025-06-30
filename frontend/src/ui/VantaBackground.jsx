// src/components/VantaBackground.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function VantaBackground() {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current && window.VANTA) {
      vantaEffect.current = window.VANTA.FOG({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x00bf63,
        midtoneColor: 0x453cf0,
        lowlightColor: 0x30f043,
        blurFactor: 0.59,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return (
    <div ref={vantaRef} className="w-full h-[500px] text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold z-10 relative">Welcome to MindfulStudent</h1>
    </div>
  );
}
