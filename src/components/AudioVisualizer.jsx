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
      analyserRef.current.fftSize = 128;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;

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

    const sortedData = [...dataArray].sort((a, b) => b - a);
    const topValues = sortedData.slice(0, 5);
    const peakValue = Math.max(...topValues);

    const newScale = 1 + Math.pow(peakValue / 255, 2) * 1;
    const newIntensity = Math.pow(peakValue / 255, 1.5) * 200;
    const opacity = 0.05 + Math.pow(peakValue / 255, 1.5) * 0.5;

    setScale(newScale);
    setIntensity(newIntensity);
    setBackgroundColor(`rgba(0, 0, 0, ${opacity * 0.1})`);

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
        position:"absolute",
        zIndex:9,
        height: "100px",
        width: "100px",
        borderRadius: "100%",
        background: `radial-gradient(circle, 
        ${
          isListening
            ? `rgba(239, 68, 68, ${0.05 + intensity * 0.002})`
            : "rgba(75, 85, 99, 0.01)"
        } 0%,
        transparent 70%)`,
      }}
    >
      <div
        className="relative w-48 h-48 rounded-full flex items-center justify-center"
        style={{
          // backgroundColor:"blue",
          height: "100%",
          width: "100%",
          borderRadius: "100%",
          background: `radial-gradient(circle, 
            ${
              isListening
                ? `rgba(239, 68, 68, ${0.05 + intensity * 0.002})`
                : "rgba(75, 85, 99, 0.01)"
            } 0%,
            transparent 70%)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            // backgroundColor:"black",
            borderRadius: "100%",
            background: `radial-gradient(circle, 
              ${
                isListening
                  ? `rgba(239, 68, 68, ${0.02 + intensity * 0.001})`
                  : "rgba(75, 85, 99, 0.005)"
              } 0%,
              transparent 100%)`,
            animation: isListening ? "pulse 1.5s infinite" : "none",
          }}
        />
        <div
          className="transition-all duration-100 rounded-full p-6"
          style={{
            // backgroundColor:"rgba(239,68,68,0.5)",
            width: "100%",
            height: "100%",
            borderRadius: "100%",
            transform: `scale(${scale})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "transparent",
            boxShadow: isListening
              ? `0 0 ${25 + intensity * 0.3}px rgba(239, 68, 68, ${
                  0.4 + intensity * 0.008
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
            transform: scale(1.15);
            opacity: 0.7;
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