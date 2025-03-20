import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Mic, MicOff, ZoomIn, ZoomOut, Camera, Send } from "lucide-react";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [isRecording, setIsRecording] = useState(false);
  const companyLogo = "https://poetsandquants.com/wp-content/uploads/sites/5/2014/07/Deloitte-logo.jpg"
  const employeeName = "John Doe"
  
  // Function to toggle microphone state
  const speakWithMic = () => {
    setIsRecording(!isRecording);
    // Here you would add actual speech recognition functionality
    // For example, using the Web Speech API
  };

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        {/* Smaller header with company logo and employee name */}
        <div className="w-full flex justify-between items-center backdrop-blur-md bg-white bg-opacity-50 p-2 rounded-lg">
          <div className="flex items-center">
            <img
              src={companyLogo || "/api/placeholder/120/60"}
              alt="Logo"
              className="h-8 mr-2"
            />
            <h1 className="font-bold text-base md:text-lg">Virtual Assistant</h1>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full text-sm">
            <span className="font-medium">Hi {employeeName || "Employee"}</span>
          </div>
        </div>
        
        {/* Camera controls */}
        <div className="w-full flex flex-col items-end justify-center gap-2">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow-md transition duration-200"
          >
            {cameraZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow-md transition duration-200"
          >
            <Camera size={20} />
          </button>
        </div>
        
        {/* Chat input area with improved icons alignment */}
        <div className="flex items-stretch gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full p-3 rounded-l-md bg-opacity-70 bg-white backdrop-blur-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            onClick={speakWithMic}
            className={`flex items-center justify-center px-3 ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-md transition duration-200`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`flex items-center justify-center px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md transition duration-200 ${
              loading || message ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
};