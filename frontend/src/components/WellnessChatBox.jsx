import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, Trash2 } from "lucide-react";
import { useTheme } from './ThemeProvider'; // keep theme support for light/dark mode

const WellnessChatBox = ({
  messages,
  userMessage,
  setUserMessage,
  handleSendMessage,
  handleKeyDown,
  inputRef,
  onDeleteMessage // add this prop
}) => {
  const { isDark } = useTheme(); // dark mode hook
  const chatEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const speechRecognition = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    // Browser compatibility check for the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in your browser.');
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition.current = new SpeechRecognition();
    
    // Configure speech recognition
    speechRecognition.current.continuous = false;
    speechRecognition.current.interimResults = false;
    speechRecognition.current.lang = 'en-US';

    // Set up event handlers
    speechRecognition.current.onresult = (event) => {
      console.log('Speech recognition result:', event.results); // Debug log
      if (event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        setUserMessage(prev => prev + ' ' + transcript.trim());
        inputRef.current?.focus();
      }
    };

    speechRecognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event.message);
      let errorMessage = `Error: ${event.error}`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission denied. Please allow microphone access.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please try speaking again.';
      }
      setSpeechError(errorMessage);
      setIsListening(false);
    };

    speechRecognition.current.onend = () => {
      console.log('Speech recognition ended'); // Debug log
      setIsListening(false);
    };

    return () => {
      // Clean up
      if (speechRecognition.current) {
        try {
          speechRecognition.current.stop();
        } catch (error) {
          console.warn('Error stopping speech recognition during cleanup:', error);
        }
      }
    };
  }, [setUserMessage]);

  // Handle start/stop listening
  const toggleListening = () => {
    if (speechError && speechError.includes('not supported')) {
      alert('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        speechRecognition.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setSpeechError(`Error stopping: ${error.message}`);
      }
    } else {
      setSpeechError(null);
      try {
        // Ensure microphone permission
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            speechRecognition.current.start();
            setIsListening(true);
          })
          .catch((error) => {
            console.error('Microphone permission error:', error);
            setSpeechError('Microphone permission denied. Please allow microphone access.');
          });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setSpeechError(`Failed to start: ${error.message}`);
      }
    }
  };

  // auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // wellness-themed quick replies
  const quickReplies = [
    "how can i reduce stress?",
    "what’s a good morning routine?",
    "any tips for better sleep?",
    "how do i start meditating?"
  ];

  // set input text and focus when quick reply is clicked
  const handleQuickReply = (message) => {
    setUserMessage(message);
    inputRef.current?.focus();
  };

  return (
    <div className={`w-[83%] h-[calc(95vh-5rem)] mt-20 mx-auto rounded-lg shadow-xl overflow-hidden ${
      isDark ? "bg-gray-800" : "bg-[#f8f9fa]"
    }`}>
      <div className="flex flex-col h-full">
        {/* header */}
        <div className={`p-4 flex justify-between items-center shadow-md rounded-t-lg ${
          isDark ? "bg-gray-700" : "bg-[#79A657]"
        }`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-white"}`}>
            wellness buddy chat
          </h2>
        </div>

        {/* messages */}
        <div className={`flex-1 p-4 overflow-y-auto m-3 rounded-lg shadow-lg ${
          isDark ? "bg-gray-700" : "bg-white"
        }`}>
          {messages.map((message, idx) => (
            <div
              key={message.id || idx}
              className={`mb-4 ${message.sender === 'User' ? 'text-right' : ''} group`}
              style={{ position: 'relative' }}
            >
              <div
                className={`inline-block rounded-xl p-6 max-w-[80%] md:max-w-[70%] ${
                  message.sender === 'User' 
                    ? isDark 
                      ? "bg-blue-600 text-white" 
                      : "bg-[#79A657] text-white"
                    : isDark 
                      ? "bg-gray-600 text-white" 
                      : "bg-[#e9ecef] text-[#333]"
                }`}
                style={{ whiteSpace: 'pre-wrap', position: 'relative' }}
              >
                {message.sender !== 'User' && <div className="font-bold mb-1">{message.sender}</div>}
                <p>{message.message}</p>
                {onDeleteMessage && (
                  <button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                    style={{ zIndex: 10 }}
                    onClick={() => onDeleteMessage(message.id)}
                    aria-label="Delete message"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* quick replies */}
        <div className={`p-3 border-t flex flex-wrap gap-2 ${
          isDark ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-200"
        }`}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className={`py-1 px-3 rounded-lg text-sm border ${
                isDark 
                  ? "bg-gray-500 text-white border-gray-400 hover:bg-gray-400" 
                  : "bg-[#f1f8f3] text-[#79A657] border-[#79A657] hover:bg-[#e0f7e1]"
              } transition-colors`}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* message input */}
        <div className={`p-3 m-3 rounded-lg ${
          isDark ? "bg-gray-600" : "bg-white"
        }`}>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className={`flex-1 rounded-l-lg p-2 outline-none text-sm border ${
                isDark 
                  ? "bg-gray-600 text-white border-gray-500 placeholder-gray-300" 
                  : "border-[#ccc]"
              }`}
              placeholder={isListening ? "Listening..." : "Type your wellness question..."}
            />
            {/* Voice Input Button */}
            <button 
              type="button"
              onClick={toggleListening}
              className={`px-4 py-2 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : isDark
                    ? "bg-gray-500 hover:bg-gray-400"
                    : "bg-[#5c8348] hover:bg-[#4a6a39]"
              } text-white transition-colors`}
              aria-label={isListening ? "Stop recording" : "Start voice input"}
              title={isListening ? "Stop recording" : "Start voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {/* Send Button */}
            <button
              type="submit"
              className={`px-4 py-2 rounded-r-lg ${
                isDark 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-[#79A657] hover:bg-[#68a457] text-white"
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          {/* Recording indicator and error messages */}
          {isListening && (
            <div className="mt-2 text-xs text-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <span className="w-2 h-2 mr-1 bg-red-500 rounded-full animate-pulse"></span>
                Recording...
              </span>
            </div>
          )}
          {speechError && (
            <div className="mt-2 text-xs text-center text-red-500 dark:text-red-400">
              {speechError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessChatBox;