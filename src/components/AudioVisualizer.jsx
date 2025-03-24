"use client";

import { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";

export default function AudioVisualizer() {
  const [isListening, setIsListening] = useState(false);
  const [scale, setScale] = useState(1);
  const [intensity, setIntensity] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("rgba(17, 24, 39, 0)");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      setIsListening(true);
      animate();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopListening = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
    setScale(1);
    setIntensity(0);
    setBackgroundColor("rgba(17, 24, 39, 0)");
  };

  const animate = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average =
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

    const newScale = 1 + (average / 255) * 0.5;
    const newIntensity = (average / 255) * 100;
    const opacity = 0.3 + (average / 255) * 0.65;

    setScale(newScale);
    setIntensity(newIntensity);
    setBackgroundColor(`rgba(0, 0, 0, ${opacity * 0.5})`);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      startListening();
    };
  }, []);

  return (
    <div
      onClick={isListening ? stopListening : startListening}
      className="flex items-center justify-center w-64 h-64 rounded-full cursor-pointer transition-all duration-300"
      style={{
        height: "100px",
        width: "100px",
        borderRadius: "100%",
        backgroundColor: backgroundColor,
        boxShadow: isListening
          ? `0 0 ${30 + intensity}px rgba(239, 68, 68, ${
              0.2 + intensity * 0.08
            })`
          : "none",
      }}
    >
      <div
        className="relative w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "100%",
          background: `radial-gradient(circle, 
            ${
              isListening
                ? `rgba(239, 68, 68, ${0.3 + intensity * 0.007})`
                : "rgba(75, 85, 99, 0.1)"
            } 0%,
            transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            borderRadius: "100%",
            background: `radial-gradient(circle, 
              ${
                isListening
                  ? `rgba(239, 68, 68, ${0.2 + intensity * 0.004})`
                  : "rgba(75, 85, 99, 0.05)"
              } 0%,
              transparent 100%)`,
            animation: isListening ? "pulse 2s infinite" : "none",
          }}
        />
        <div
          className={`transition-all duration-100 rounded-full p-6 ${
            isListening ? "bg-gray-800/50 backdrop-blur-sm" : "bg-transparent"
          }`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "100%",
            transform: `scale(${scale})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: isListening
              ? `0 0 ${20 + intensity * 0.5}px rgba(239, 68, 68, ${
                  0.3 + intensity * 0.007
                })`
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Mic
            className={`w-50 h-50 ${
              isListening ? "text-red-500" : "text-gray-600"
            }`}
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
