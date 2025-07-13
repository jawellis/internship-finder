import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";

function ChatScreen({ messages, inputValue, setInputValue, isLoading, onSend, chatRef }) {
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, chatRef]);

  return (
    <div style={{
      width: "100%",
      maxWidth: 900,
      height: "calc(100vh - 64px)",
      margin: "24px 0",
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 6px 32px 0 #0001",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 0,
    }}>
      <div
        ref={chatRef}
        style={{
          flex: 1,
          padding: "12px 16px 6px 16px",
          overflowY: "auto",
          background: "#fafafa",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          minHeight: 0,
        }}
      >
        {/* messages human vs assistant */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "human" ? "flex-end" : "flex-start",
              width: "100%",
              margin: "10px 0"
            }}
          >
            <div
              style={{
                background: msg.role === "human" ? "#e6e7e9" : "none",
                color: msg.role === "human" ? "#333" : "#111",
                borderRadius: "18px",
                padding: "7px 16px",
                display: "inline-block",
                fontWeight: 500,
                fontSize: 18,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                boxSizing: "border-box",
              }}
            >
              {/* markdown implemengtation */}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      {/* form */}
      <form onSubmit={onSend} style={{
        display: "flex",
        gap: 12,
        borderTop: "1px solid #ececec",
        padding: "18px 32px",
        background: "#fff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={isLoading}
          placeholder="Type your message…"
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: 20,
            border: "1px solid #bbb",
            fontSize: 18,
            background: "#f7f7f7"
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          style={{
            padding: "14px 32px",
            borderRadius: 20,
            border: "none",
            background: isLoading || !inputValue.trim() ? "#cccccc" : "#111",
            color: "#fff",
            fontSize: 18,
            cursor: isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
            transition: "background 0.2s, opacity 0.2s"
          }}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ChatScreen;
