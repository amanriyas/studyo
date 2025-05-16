import React from "react";


//these are some hardcoded values that might be used in both study tecniques chat and wellness chat
//these can be replaced by api calls in the future 

const ChatSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [

    { text: "Focus mode", response: "Ok, focus mode activated." },
    { text: "Study plans?", response: "Sure, heres the generated study plan for you." },
    { text: "Study Techniques", response: "Below are some general techniques." },
  ];

 


  return (
    <div>
      {suggestions.map((suggestion, index) => (
        <button key={index} onClick={() => onSuggestionClick(suggestion.text, suggestion.response)}>
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
