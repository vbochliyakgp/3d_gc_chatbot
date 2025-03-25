import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

const need_data_for_ui = {
  companyLogo:
    "https://poetsandquants.com/wp-content/uploads/sites/5/2014/07/Deloitte-logo.jpg",
  employeeName: "John Doe",
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const chat = async (message) => {
    console.log("chat funtion clicked");
    setLoading(true);
    const data = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const resp = (await data.json()).messages;
    console.log("response", resp);
    setMessages((messages) => [...messages, ...resp]);
    setLoading(false);
  };

  const audioChat = async (audioBlob) => {
    console.log("audio chat");
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    const data = await fetch(`${backendUrl}/chat/audio`, {
      method: "POST",
      body: formData,
    });
    const resp = (await data.json()).messages;
    setMessages((messages) => [...messages, ...resp]);
    setLoading(false);
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        audioChat,
        need_data_for_ui,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
