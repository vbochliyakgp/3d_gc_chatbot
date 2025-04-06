import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
    <ChatProvider>
      <App />
    </ChatProvider>
    </AuthProvider>
  </React.StrictMode>
);
