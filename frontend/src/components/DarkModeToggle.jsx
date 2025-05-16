import { useTheme } from "./ThemeProvider";
import { FaSun, FaMoon } from "react-icons/fa";

export const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full ${
        isDark ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"
      }`}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
};