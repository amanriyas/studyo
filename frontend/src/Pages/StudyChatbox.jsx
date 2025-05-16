import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StudyChatBox from "../components/chatbox";
import Pencil from "../assets/Pencil.png";
import authAxios from "../authAxios";

const StudyChatbox = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [shouldPromptSave, setShouldPromptSave] = useState(false);
  const [lastSavedPlan, setLastSavedPlan] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [modules, setModules] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchStudentDetails();
    fetchModules();
  }, []);

  useEffect(() => {
    if (currentStudentId) {
      fetchPreviousChats();
    }
  }, [currentStudentId]);

  const fetchStudentDetails = async () => {
    try {
      const res = await authAxios.get('get_user_and_student_details/');
      setCurrentStudentId(res.data.student.id);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
    }
  };

  const fetchPreviousChats = async () => {
    try {
      const res = await authAxios.get(`studychatbox/student/${currentStudentId}/`);
      const chats = res.data.data;
      const formattedChats = chats.flatMap(chat => [
        { id: chat.id, sender: "User", message: chat.user_message },
        { id: chat.id, sender: "Bot", message: chat.bot_response }
      ]);
      setMessages(formattedChats);
    } catch (error) {
      console.error("Failed to fetch previous chat messages:", error);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await authAxios.get("dashboard-modules/");
      setModules(res.data.data);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  };

  const isFullStudyPlan = (text) => {
    return (
      text.includes("Study Plan") &&
      text.includes("Time Blocks") &&
      text.includes("Breaks") &&
      text.includes("Techniques") &&
      text.includes("Duration")
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || !currentStudentId) return;

    const userMsg = userMessage;
    setMessages(prev => [...prev, { sender: "User", message: userMsg }]);

    try {
      const planRes = await authAxios.post('study_plan/', { prompt: userMsg });
      const botMsg = planRes.data.data;

      setMessages(prev => [...prev, { sender: "Bot", message: botMsg }]);

      await authAxios.post('studychatbox/create/', {
        student: currentStudentId,
        user_message: userMsg,
        bot_response: botMsg,
        category: "GENERAL"
      });

      fetchPreviousChats(); // Refresh IDs properly

      if (isFullStudyPlan(botMsg) && botMsg !== lastSavedPlan) {
        setShouldPromptSave(true);
      }
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message || error);
      alert("Failed to send message.");
    }

    setUserMessage("");
    inputRef.current?.focus();
  };

  const handleDeleteMessage = async (chatId) => {
    try {
      await authAxios.delete(`studychatbox/delete/${chatId}/`);
      fetchPreviousChats(); // Refresh messages after deleting
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message.");
    }
  };

  const handleSave = async () => {
    const latestBotMsg = messages.filter(m => m.sender === "Bot").slice(-1)[0]?.message;
    if (!selectedModule || !latestBotMsg) return;

    try {
      await authAxios.post("study-plans/save/", {
        plan_content: latestBotMsg,
        module_id: selectedModule,
      });
      setShouldPromptSave(false);
      setLastSavedPlan(latestBotMsg);
    } catch (error) {
      console.error("Failed to save study plan:", error);
    }
  };

  const handleDismissSave = () => {
    const latestBotMsg = messages.filter(m => m.sender === "Bot").slice(-1)[0]?.message;
    setLastSavedPlan(latestBotMsg);
    setShouldPromptSave(false);
  };

  return (
    <>
      <Sidebar />
      <Header title="Studyo Mentor" pageIcon={Pencil} />
      <StudyChatBox
        messages={messages}
        userMessage={userMessage}
        setUserMessage={setUserMessage}
        handleSendMessage={handleSendMessage}
        handleKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e);
        }}
        inputRef={inputRef}
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        shouldPromptSave={shouldPromptSave}
        handleSave={handleSave}
        handleDismissSave={handleDismissSave}
        handleDeleteMessage={handleDeleteMessage}
      />
    </>
  );
};

export default StudyChatbox;
