import React, { useState, useRef } from "react";
import ChatScreen from "./components/ChatScreen";

const INITIAL_AI_MESSAGE = {
  role: "assistant",
  content: `Hello! How can I assist you today? Are you looking for internship opportunities? 
  If so, could you please share your internship preferences with me? 
  Let's start with the field/industry you are interested in and whether you prefer paid or unpaid internships. 
  Lastly, let me know the location you are targeting.`
};

function App() {
  const [messages, setMessages] = useState([INITIAL_AI_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const chatRef = useRef(null);

  // handles message send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // chat history update
    const newMessages = [...messages, { role: "human", content: inputValue.trim() }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // post messages to server
      const response = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      // streaming response
      if (!response.body) throw new Error("No stream!");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiMessage = "";
      let done = false;

      // placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // stream chunks
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          aiMessage += chunk;
          if (chunk.includes("You've sent too many messages. Please start a new conversation.")) {
            setShowTokenModal(true);
            setIsLoading(false);
            return;
          }
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: aiMessage }
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to server!" }]);
    }
    setIsLoading(false);
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 200);
  };

  // handle retrying token modal
  function handleTryAgain() {
    window.location.reload();
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#f6f7fb",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* token popup */}
      {showTokenModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.45)",
          zIndex: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 32,
            minWidth: 300,
            textAlign: "center",
            boxShadow: "0 6px 32px #0003"
          }}>
            <div style={{ fontSize: 22, marginBottom: 20 }}>Can't load more internships.</div>
            <div style={{ fontSize: 16, marginBottom: 32 }}>Would you like to try again?</div>
            <button
              onClick={handleTryAgain}
              style={{
                background: "#111", color: "#fff", border: "none",
                borderRadius: 8, padding: "12px 32px", fontSize: 18, fontWeight: 600, cursor: "pointer"
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
      <ChatScreen
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        isLoading={isLoading}
        onSend={handleSend}
        chatRef={chatRef}
      />
    </div>
  );
}

export default App;
