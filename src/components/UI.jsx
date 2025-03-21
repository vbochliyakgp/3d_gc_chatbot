import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import {
  Mic,
  MicOff,
  ZoomIn,
  ZoomOut,
  Camera,
  Send,
  Loader,
} from "lucide-react";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const {
    chat,
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    setMessages,
    setLoading,
  } = useChat();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioRecording, setAudioRecording] = useState(null);
  const [processingAudio, setProcessingAudio] = useState(false);
  const companyLogo =
    "https://poetsandquants.com/wp-content/uploads/sites/5/2014/07/Deloitte-logo.jpg";
  const employeeName = "John Doe";

  // MediaRecorder reference
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Function to start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioRecording(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Error accessing your microphone. Please make sure it's connected and permissions are granted."
      );
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Reset previous recording if exists
      if (audioRecording) {
        URL.revokeObjectURL(audioRecording);
        setAudioRecording(null);
        setAudioBlob(null);
      }
      startRecording();
    }
  };

  // Send audio recording to backend
  const sendAudioMessage = async () => {
    if (!audioBlob) return;

    setProcessingAudio(true);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("http://localhost:3000/chat/audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      console.log("response here in josn", response);
      const data = (await response.json()).messages;
      console.log("response", data);
      setMessages((messages) => [...messages, ...data]);

      // Clear audio recording after sending
      URL.revokeObjectURL(audioRecording);
      setAudioRecording(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Error sending audio:", error);
      alert(
        "Failed to process audio. Please try again or type your message instead."
      );
    } finally {
      setLoading(false);
      setProcessingAudio(false);
    }
  };

  const sendMessage = () => {
    // If we have an audio recording, send that instead of text
    if (audioBlob) {
      sendAudioMessage();
      return;
    }

    // Otherwise send text message as before
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      chat(text);
      input.current.value = "";
    }
  };

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioRecording) {
        URL.revokeObjectURL(audioRecording);
      }
    };
  }, [audioRecording]);

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
            <h1 className="font-bold text-base md:text-lg">
              Virtual Assistant
            </h1>
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

        {/* Audio recording indicator */}
        {audioRecording && !isRecording && (
          <div className="pointer-events-auto max-w-screen-sm w-full mx-auto mb-2 bg-green-100 p-2 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Audio recorded and ready to send</span>
            </div>
            <button
              onClick={() => {
                URL.revokeObjectURL(audioRecording);
                setAudioRecording(null);
                setAudioBlob(null);
              }}
              className="text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Chat input area with improved icons alignment */}
        <div className="flex items-stretch gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className={`w-full p-3 rounded-l-md bg-opacity-70 bg-white backdrop-blur-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isRecording ? "opacity-50" : ""
            }`}
            placeholder={
              isRecording ? "Recording in progress..." : "Type your message..."
            }
            ref={input}
            disabled={isRecording || processingAudio}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isRecording && !processingAudio) {
                sendMessage();
              }
            }}
          />
          <button
            onClick={toggleRecording}
            disabled={loading || message || processingAudio}
            className={`flex items-center justify-center px-3 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-md transition duration-200 ${
              loading || message || processingAudio
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            disabled={
              loading ||
              message ||
              (isRecording && !audioBlob) ||
              processingAudio
            }
            onClick={sendMessage}
            className={`flex items-center justify-center px-4 ${
              loading || processingAudio
                ? "bg-gray-500"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-r-md transition duration-200 ${
              loading ||
              message ||
              (isRecording && !audioBlob) ||
              processingAudio
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {processingAudio ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
