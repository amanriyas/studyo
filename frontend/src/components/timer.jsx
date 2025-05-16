import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";

const presets = [
  { label: "10m Work / 2m Break", work: 10, break: 2 },
  { label: "25m Work / 5m Break", work: 25, break: 5 },
  { label: "30m Work / 10m Break", work: 30, break: 10 },
  { label: "50m Work / 15m Break", work: 50, break: 15 },
  { label: "60m Work / 20m Break", work: 60, break: 20 },
  { label: "90m Work / 25m Break", work: 90, break: 25 },
];

const PTimer = () => {
  const { isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(presets[1].work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(presets[1]);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const handlePhaseEnd = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(currentPreset.break * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(currentPreset.work * 60);
      setCompletedSessions((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(currentPreset.work * 60);
  };

  const handlePresetChange = (preset) => {
    clearInterval(timerRef.current);
    setCurrentPreset(preset);
    setTimeLeft(preset.work * 60);
    setIsRunning(false);
    setIsBreak(false);
  };

  const progress = (timeLeft /
    (isBreak ? currentPreset.break * 60 : currentPreset.work * 60)) * 100;

  return (
    <div
      className={`
        w-[98%] max-w-5xl mx-auto mt-3
        flex flex-col items-center justify-center
        bg-white 
        text-gray-900 dark:text-gray-100
        rounded-xl p-4
        border-2 ${isDark ? "border-[#4F9252]" : "border-[#638A45]"}
        shadow-sm
        transition-all duration-500 ease-in-out
        min-h-[400px]
      `}
    >
      {/* Header */}
      <div className={`
        w-full flex justify-between items-center mb-4
        ${isDark ? "border-[#4F9252] bg-[#4F9252]" : "border-[#638A45] bg-[#638A45]"}
        py-2 px-4 rounded-lg shadow-md
      `}>
        <h1
          className="text-xl font-bold tracking-tight flex items-center gap-2 text-white transition-colors duration-500 text-center"
        >
          {isBreak ? "☕ Break" : "📚 Focus"}
        </h1>
        <span
          className={`
            text-base font-semibold text-white
            ${isDark ? "bg-[#4F9252]" : "bg-[#638A45]"}
            px-2 py-1 rounded-md transition-colors duration-500 text-center
          `}
        >
          {currentPreset.label}
        </span>
      </div>

      {/* Timer Display */}
      <div
        className={`
          text-5xl font-sans font-bold tracking-tight
          ${isDark ? "text-[#3C6F3E]" : "text-[#506B34]"}
          transition-colors duration-500
          bg-white rounded-lg px-6 py-2 mb-2
          border-2 ${isDark ? "border-[#4F9252]" : "border-[#638A45]"}
          w-48 text-center
        `}
      >
        {formatTime(timeLeft)}
      </div>

      {/* Progress Bar */}
      <div className={`
        w-full max-w-[90%] mx-auto
        ${isDark ? "bg-gray-700" : "bg-gray-200"}
        h-8 rounded-xl mb-3 overflow-hidden shadow-inner transition-colors duration-500
      `}>
        <div
          className={`
            h-full rounded-xl transition-all duration-300 ease-in-out
            ${isDark ? "bg-[#66BB6A]" : "bg-[#79A657]"}
            border ${isDark ? "border-[#4F9252]" : "border-[#638A45]"}
          `}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Preset Selector */}
      <div className="w-full max-w-[50%] mx-auto mb-2">
        <label className={`block text-sm font-semibold ${isDark ? "text-[#3C6F3E]" : "text-[#506B34]"} mb-1 transition-colors duration-500 text-left`}>
          Preset
        </label>
        <select
          value={currentPreset.label}
          onChange={(e) => {
            const preset = presets.find((p) => p.label === e.target.value);
            handlePresetChange(preset);
          }}
          className={`
            w-full p-2 rounded-lg text-sm
            bg-white dark:bg-black
            border-2 ${isDark ? "border-[#4F9252]" : "border-[#638A45]"}
            ${isDark ? "text-gray-100" : "text-gray-100"}
            focus:outline-none focus:ring-2 ${isDark ? "focus:ring-[#80D684]" : "focus:ring-[#8FBB6D]"}
            transition-all duration-500
            font-medium
            text-left
          `}
        >
          {presets.map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-2">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={`
            w-40 h-12 rounded-lg font-semibold text-base text-white
            ${isDark ? "bg-[#66BB6A] hover:bg-[#80D684]" : "bg-[#79A657] hover:bg-[#8FBB6D]"}
            transition-all duration-200
            border ${isDark ? "border-[#4F9252]" : "border-[#638A45]"}
            shadow-sm
            focus:outline-none focus:ring-2 ${isDark ? "focus:ring-[#80D684]" : "focus:ring-[#8FBB6D]"}
            text-center
          `}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className={`
            w-40 h-12 rounded-lg font-semibold text-base text-white
            ${isDark ? "bg-gray-600 hover:bg-gray-700 border-gray-700" : "bg-gray-500 hover:bg-gray-600 border-gray-200"}
            transition-all duration-200
            shadow-sm
            focus:outline-none focus:ring-2 ${isDark ? "focus:ring-[#80D684]" : "focus:ring-[#8FBB6D]"}
            text-center
          `}
        >
          Reset
        </button>
      </div>

      {/* Footer */}
      <div className={`text-center text-sm font-semibold ${isDark ? "text-[#3C6F3E]" : "text-[#506B34]"} mt-2 transition-colors duration-500`}>
        Sessions: <span className={`${isDark ? "text-[#66BB6A]" : "text-[#79A657]"} font-bold`}>{completedSessions}</span>
      </div>
    </div>
  );
};

export default PTimer;
