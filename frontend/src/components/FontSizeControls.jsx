import React from 'react';

const FontSizeControls = ({ fontSizeLevel, setFontSizeLevel }) => {
  const increaseFontSize = () => {
    setFontSizeLevel((prev) => Math.min(prev + 1, 2));
  };

  const decreaseFontSize = () => {
    setFontSizeLevel((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="font-size-controls">
      <button 
        onClick={decreaseFontSize} 
        disabled={fontSizeLevel === 0}
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button 
        onClick={increaseFontSize} 
        disabled={fontSizeLevel === 2}
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
};

export default FontSizeControls;