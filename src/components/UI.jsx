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
  Trash2,
  Pause,
} from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";

export const UI = ({ hidden }) => {
  const transcriptInput=useRef(null);
  const [savedTranscript, setSavedTranscript] = useState("");
  const input = useRef();
  const {
    chat,
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    audioChat,
    need_data_for_ui,
  } = useChat();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioRecording, setAudioRecording] = useState(null);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [audiodelete, setAudioDelete] = useState(false);
  // MediaRecorder reference
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcript,setTranscript]=useState("");
  // Function to start recording
  const startRecording = async () => {
    try {
      const SpeechRecognition=window.SpeechRecognition ||window.webkitSpeechRecognition;
      const recognition=new SpeechRecognition();
      recognition.continuous=true;
      recognition.interimResults=true;
      recognition.lang= 'en-US';
      recognition.onresult=(event)=>{
        let currentTranscript='';
        for(let i =event.resultIndex;i<event.results.length;i++){
          currentTranscript=event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if(transcriptInput.current) {
          // Add a space if needed
          if(transcriptInput.current.value && !transcriptInput.current.value.endsWith(' ')) {
            transcriptInput.current.value += ' ';
          }
          transcriptInput.current.value += currentTranscript;
          setSavedTranscript(transcriptInput.current.value);
        }
        recognition.onend = () => {
          // If we're still in recording mode but recognition stopped, restart it
          if (isRecording) {
            console.log("Speech recognition paused, restarting...");
            recognition.start();
          }
        };
      }
      recognition.start();
      window.recognition=recognition;
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
    if(window.recognition){
      window.recognition.stop();
    }
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
      setTranscript("");
      if(transcriptInput.current)
      transcriptInput.current.value="";
      startRecording();
    }
  };

  // Send audio recording to backend
  const sendAudioMessage = async () => {
    if (!audioBlob) return;

    setProcessingAudio(true);

    try {
      await audioChat(audioBlob);

      // Clear audio recording after sending
      URL.revokeObjectURL(audioRecording);
      setAudioRecording(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Error sending audio:", error);
    } finally {
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

  useEffect(() => {
    // When recording stops and we have a saved transcript
    if (!isRecording && savedTranscript) {
      // Wait for UI to update
      const timer = setTimeout(() => {
        if (input.current) {
          input.current.value = savedTranscript;
          console.log("Set input value to:", savedTranscript); // Debug log
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isRecording, savedTranscript]);
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

  useEffect(() => {
    if (!isRecording && audioBlob && !audiodelete) {
      sendMessage();
    }
  }, [isRecording, audioBlob, audiodelete]);

  useEffect(() => {
    if (audiodelete && audioRecording) {
      URL.revokeObjectURL(audioRecording);
      setAudioRecording(null);
      setAudioBlob(null);

      setAudioDelete(false);
    }
  }, [audiodelete, audioRecording]);
  return (
    <>
      {isRecording && (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            margin:"0%",
            padding:"0%",
            top: 0,
            left: 0,
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.2)", // Combined color and opacity
          }}
        />
      )}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        {/* Smaller header with company logo and employee name */}
        <div className="w-full flex justify-between items-center backdrop-blur-md bg-white bg-opacity-50 p-2 rounded-lg">
          <div className="flex items-center">
            <img
              src={need_data_for_ui.companyLogo}
              alt="Deloitte."
              className="h-8 mr-2"
            />
            <h1 className="font-bold text-base md:text-lg">
              Virtual Assistant
            </h1>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-full text-sm">
            <span className="font-medium">
              Hi {need_data_for_ui.employeeName || "There"}
            </span>
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

        <div className="pointer-events-auto max-w-screen-sm w-full mx-auto mb-2 bg-transparent-100 p-2 rounded-md flex items-center justify-center">
          {isRecording && <AudioVisualizer />}
        </div>
        {/* Chat input area with improved icons alignment */}
        <div className="flex items-stretch gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          
          {!(isRecording&&transcript)&&<input
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
          />}
          {isRecording&&transcript&&(
            <input readOnly={true}
            className={`w-full p-3 rounded-l-md bg-opacity-70 bg-white backdrop-blur-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
            `}
            // placeholder={
            //   isRecording ? "Recording in progress..." : "Type your message..."
            // }
            ref={transcriptInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isRecording) {
                  console.log("transcript is :",transcriptInput.current.value);
              }
            }}
          />
          )}
          {!isRecording && (
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
              {<Mic size={20}/>}
            </button>
          )}
          {/* {!audioRecording && isRecording && (
            <button
              onClick={() => {
                stopRecording();
                setAudioDelete(true);
              }}
              className={`flex items-center justify-center px-3 ${"bg-red-600 hover:bg-red-700"} text-white rounded-md transition duration-200 `}
            >
              <Trash2 size={20} color="white" strokeWidth={2} style={{}} />
            </button>
          )} */}
          {isRecording&& (
            <button
              onClick={() => {

                
                stopRecording();
                setAudioDelete(true);
                setIsRecording(false);
                
      
               
              }}
              className={`flex items-center justify-center px-3 ${"bg-red-600 hover:bg-red-700"} text-white rounded-md transition duration-200 `}
            >
              <Pause size={20} color="white" strokeWidth={2} style={{}} />
            </button>
          )}

          {!isRecording&&(
          <button
            disabled={loading || message || processingAudio}
            onClick={() => {
              if (isRecording) {
                stopRecording();
              } else sendMessage();
            }}
            className={`flex items-center justify-center px-4 ${
              loading || processingAudio
                ? "bg-gray-500"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-r-md transition duration-200 ${
              loading || message || processingAudio
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {processingAudio ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>)}
        </div>
      </div>
    </>
  );
};
