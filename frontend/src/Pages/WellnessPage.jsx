import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import WellnessChatBox from "../components/WellnessChatBox.jsx";
import Wellness from "../assets/Wellness.png"; // changed icon
import api from "../api";

const WellnessPage = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(-1);
  const inputRef = useRef(null);
  const BASE_URL = api;

  useEffect(() => {
    // Fetch all wellness chat messages for the current student (replace student_id as needed)
    const fetchMessages = async () => {
      try {
        // TODO: Replace with actual student_id from context or props
        const studentId = 1; 
        const response = await fetch(`${BASE_URL}wellness_message/${studentId}/`);
        const data = await response.json();
        if (data.data) {
          // Map backend messages to local format
          setMessages(
            data.data.map(msg => ({
              sender: msg.is_bot ? "Bot" : "User",
              message: msg.message,
              id: msg.id,
              timestamp: msg.timestamp
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (messageIndex < messages.length - 1) {
        setMessageIndex(messageIndex + 1);
        setUserMessage(messages[messages.length - 1 - messageIndex].message);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (messageIndex > 0) {
        setMessageIndex(messageIndex - 1);
        setUserMessage(messages[messages.length - 1 - messageIndex].message);
      } else {
        setMessageIndex(-1);
        setUserMessage("");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    // TODO: Replace with actual student_id from context or props
    const studentId = 1;
    // Save user message to DB
    try {
      const userRes = await fetch(`${BASE_URL}wellness_create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: studentId, message: userMessage, is_bot: false })
      });
      const userData = await userRes.json();
      setMessages(prev => [...prev, { sender: "User", message: userMessage, id: userData.data?.id, timestamp: userData.data?.timestamp }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "User", message: userMessage }]);
    }

    // Get bot response and save to DB
    try {
      const botRes = await fetch(`${BASE_URL}wellness/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage })
      });
      const botData = await botRes.json();
      const botMsg = botData.data || "error getting response";
      // Save bot message to DB
      const saveBotRes = await fetch(`${BASE_URL}wellness_create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: studentId, message: botMsg, is_bot: true })
      });
      const saveBotData = await saveBotRes.json();
      setMessages(prev => [...prev, { sender: "Bot", message: botMsg, id: saveBotData.data?.id, timestamp: saveBotData.data?.timestamp }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "Bot", message: "failed to connect to server" }]);
    }

    setUserMessage("");
    setMessageIndex(-1);
    inputRef.current?.focus();
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId) => {
    try {
      await fetch(`${BASE_URL}wellness_delete/${messageId}/`, { method: "DELETE" });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <>
      <Sidebar />
      <Header title="Wellness Buddy" pageIcon={Wellness} />
      <WellnessChatBox
        messages={messages}
        userMessage={userMessage}
        setUserMessage={setUserMessage}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        inputRef={inputRef}
        onDeleteMessage={handleDeleteMessage}
      />
    </>
  );
};

export default WellnessPage;