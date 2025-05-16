import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, Trash2 } from "lucide-react";
import { useTheme } from './ThemeProvider';
import authAxios from "../authAxios";

const StudyChatBox = ({
  messages,
  userMessage,
  setUserMessage,
  handleSendMessage,
  handleKeyDown,
  inputRef,
  modules,
  selectedModule,
  setSelectedModule,
  shouldPromptSave,
  handleSave,
  handleDismissSave,
  fetchMessages,
}) => {
  const { isDark } = useTheme();
  const chatEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const speechRecognition = useRef(null);
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleDeleteMessage = async (messageId, sender) => {
    try {
      // Determine the delete type based on the message sender
      const deleteType = sender === "User" ? 'user_message' : 'bot_response';
      
      const response = await authAxios.delete(`/studychatbox/delete/${messageId}/`, {

        data: { delete_type: deleteType }
      });
      
      if (response.status === 200) {
        // Instead of removing the message, we'll fetch fresh data
        if (typeof fetchMessages === 'function') {
          fetchMessages();
        } else {
          // Fallback: Update local state if fetchMessages not available
          setLocalMessages(prevMessages => 
            prevMessages.map(msg => {
              if (msg.id === messageId && msg.sender === sender) {
                return { ...msg, message: "", deleted: true };
              }
              return msg;
            }).filter(msg => !msg.deleted)
          );
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in your browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition.current = new SpeechRecognition();
    speechRecognition.current.continuous = false;
    speechRecognition.current.interimResults = false;
    speechRecognition.current.lang = 'en-US';

    speechRecognition.current.onresult = (event) => {
      if (event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        setUserMessage(prev => prev + ' ' + transcript.trim());
        inputRef.current?.focus();
      }
    };
    speechRecognition.current.onerror = (event) => {
      let errorMessage = `Error: ${event.error}`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission denied.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected.';
      }
      setSpeechError(errorMessage);
      setIsListening(false);
    };
    speechRecognition.current.onend = () => setIsListening(false);

    return () => {
      if (speechRecognition.current) {
        try {
          speechRecognition.current.stop();
        } catch (error) {}
      }
    };
  }, [setUserMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const toggleListening = () => {
    if (speechError?.includes('not supported')) {
      alert('Speech recognition not supported.');
      return;
    }
    if (isListening) {
      speechRecognition.current.stop();
    } else {
      setSpeechError(null);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          speechRecognition.current.start();
          setIsListening(true);
        })
        .catch(() => {
          setSpeechError('Microphone permission denied.');
        });
    }
  };

  const filteredMessages = localMessages.filter(message => message.message.trim() !== "");

  return (
    <div className={`w-[calc(95%-12rem)] h-[calc(95vh-5rem)] mt-20 mx-auto rounded-lg shadow-xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-[#f8f9fa]"}`}>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className={`p-4 flex justify-between items-center shadow-md rounded-t-lg ${isDark ? "bg-gray-700" : "bg-[#79A657]"}`}>
            <h2 className="text-xl font-bold text-white">Studyo Mentor Chat</h2>
          </div>

          <div className={`flex-1 p-4 overflow-y-auto m-3 rounded-lg shadow-lg ${isDark ? "bg-gray-700" : "bg-white"}`}>
            {filteredMessages.map((message) => (
              <div key={message.id} className="mb-4 flex items-start gap-2 group relative" style={{ justifyContent: message.sender === "User" ? "flex-end" : "flex-start" }}>
                <div
                  className={`inline-block rounded-xl p-6 max-w-[80%] md:max-w-[70%] ${message.sender === "User"
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-[#79A657] text-white"
                    : isDark
                      ? "bg-gray-600 text-white"
                      : "bg-[#e9ecef] text-[#333]"
                    }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {message.sender === "User" ? (
                    message.message
                  ) : (
                    <>
                      <strong>Bot</strong>
                      <div>{message.message}</div>
                    </>
                  )}
                </div>

                {/* Delete button that only appears on hover */}
                <button
                  onClick={() => handleDeleteMessage(message.id, message.sender)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div ref={chatEndRef} />

            {shouldPromptSave && (
              <div className="mt-6 bg-green-100 border border-green-300 p-4 rounded-xl shadow-md dark:bg-gray-600 dark:border-gray-500">
                <label className="block mb-2 font-semibold text-[#1f2937] dark:text-white">
                  Save this study plan to a module?
                </label>
                {modules.length === 0 ? (
                  <div className="text-sm text-red-600 dark:text-red-400 mb-2">⚠️ No modules found — Please create a module first.</div>
                ) : (
                  <select
                    className="w-full p-2 rounded-md border border-gray-300 mb-3 dark:bg-gray-700 dark:text-white"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="">Select a Module</option>
                    {modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                  </select>
                )}
                <div className="flex justify-end gap-4">
                  <button onClick={handleDismissSave} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md">
                    Don't Save
                  </button>
                  <button onClick={handleSave} disabled={!selectedModule} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                    Save Plan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`p-3 m-3 rounded-lg ${isDark ? "bg-gray-600" : "bg-white"}`}>
            <form onSubmit={handleSendMessage} className="flex">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                className={`flex-1 rounded-l-lg p-2 outline-none text-sm border ${isDark ? "bg-gray-600 text-white border-gray-500 placeholder-gray-300" : "border-[#ccc]"}`}
                placeholder={isListening ? "Listening..." : "Type your message..."}
              />
              <button type="button" onClick={toggleListening}
                className={`px-4 py-2 ${isListening ? "bg-red-500 hover:bg-red-600" : isDark ? "bg-gray-500 hover:bg-gray-400" : "bg-[#5c8348] hover:bg-[#4a6a39]"} text-white transition-colors`}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button type="submit" className={`px-4 py-2 rounded-r-lg ${isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-[#79A657] hover:bg-[#68a457]"} text-white`}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyChatBox;