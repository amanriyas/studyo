
import React, { useState, useEffect, useRef } from "react";
import "./Flashcards.css"; // Keep your custom CSS references
import axios from "axios"; // For API requests
import api from "../api";

// Example Q&A sets for Easy, Medium, Hard

const allFlashcards = [
  {
    id: 0,
    moduleName: "Artificial Intelligence",
    topic: "Basic Concepts",
    difficulty: "Easy",
    question: "What does AI stand for?",
    answer: "AI stands for Artificial Intelligence.",
  },

];

// Capitalized difficulties
const difficulties = ["Easy", "Medium", "Hard"];

// Keyboard shortcuts help text - add this to your component
const keyboardShortcuts = [
  { key: "Tab", action: "Navigate between elements" },
  { key: "Enter/Space", action: "Activate buttons or toggle flashcards" },
  { key: "Escape", action: "Close dropdowns or modals" },
  { key: "←/→", action: "Navigate between flashcards" },
  { key: "S", action: "Show/hide answer" },
  { key: "B", action: "Go back to main menu" },
  { key: "A", action: "Add new flashcard" },
];

export default function Flashcards() {

  // Page state

  const [onMainPage, setOnMainPage] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [showControls, setShowControls] = useState(false);
  const [showSubjectControls, setShowSubjectControls] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false); // State for keyboard help

  // Subject & Flashcard modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);

  // Subject form states
  const [newSubject, setNewSubject] = useState("");
  const [newSubTopic, setNewSubTopic] = useState("");

  // Flashcard form states
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Easy");
  
  // Edit state
  const [editCardId, setEditCardId] = useState(null);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  
  // Delete subject confirmation
  const [showDeleteSubjectConfirm, setShowDeleteSubjectConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // New state for backend integration
  const [dbDecks, setDbDecks] = useState([]); // Stores decks from database
  const [dbFlashcards, setDbFlashcards] = useState([]); // Stores flashcards from database
  const [studentId, setStudentId] = useState(1); // Default student ID
  const [apiError, setApiError] = useState(null); // Track API errors
  
  // Selected deck/subject state
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [selectedDeckName, setSelectedDeckName] = useState("Select a Subject");
  
  // Current card index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reveal/hide answer
  const [showAnswer, setShowAnswer] = useState(false);

  // Refs for keyboard navigation and focus management
  const subjectsButtonRef = useRef(null);
  const optionsButtonRef = useRef(null);
  const startStudyingButtonRef = useRef(null);
  const backButtonRef = useRef(null);
  const prevButtonRef = useRef(null);
  const addCardButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const flashcardRef = useRef(null);
  const subjectDropdownItemsRef = useRef([]);
  const difficultyDropdownItemsRef = useRef([]);
  const modalRef = useRef(null);
  const firstFocusableElementRef = useRef(null);
  const lastFocusableElementRef = useRef(null);
  const keyboardHelpButtonRef = useRef(null);

  // CORS-compatible API URLs - Use environment variables
  // const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8002/api';
  const API_BASE_URL = api;
  
  // Configure axios to include credentials (for CSRF)
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  // Function to get CSRF token (required for POST requests to Django)
  function getCsrfToken() {
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }

  // Fetch decks from backend when component loads
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}decks/student/${studentId}/`
        );
        
        // If successful, update state with fetched decks
        if (response.data && response.data.data) {
          setDbDecks(response.data.data);
          console.log("Fetched decks:", response.data.data);
          
          // If we have decks, set the first deck as selected and fetch its flashcards
          if (response.data.data.length > 0) {
            setSelectedDeckId(response.data.data[0].id);
            setSelectedDeckName(response.data.data[0].name);
            fetchFlashcards(response.data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching decks:", error);
        setApiError("Could not connect to the server. Using local data instead.");
        // Continue with local data if API fails
      }
    };
    
    fetchDecks();
  }, [studentId, API_BASE_URL]);

  // KEYBOARD NAVIGATION: Global keyboard handler for shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in an input field or textarea
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT'
      ) {
        return;
      }

      // Show keyboard help with '?' key
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
        return;
      }

      // Handle ESC key for modals and dropdowns
      if (e.key === 'Escape') {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
          return;
        }
        if (showAddCardModal) {
          setShowAddCardModal(false);
          return;
        }
        if (showEditCardModal) {
          setShowEditCardModal(false);
          setEditCardId(null);
          return;
        }
        if (showSubjectModal) {
          setShowSubjectModal(false);
          return;
        }
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          setCardToDelete(null);
          return;
        }
        if (showDeleteSubjectConfirm) {
          setShowDeleteSubjectConfirm(false);
          setSubjectToDelete(null);
          return;
        }
        if (showControls) {
          setShowControls(false);
          return;
        }
        if (showSubjectControls) {
          setShowSubjectControls(false);
          return;
        }
      }

      // Study mode keyboard shortcuts
      if (!onMainPage) {
        // Left/Right arrows for previous/next card
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevNext("prev");
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handlePrevNext("next");
        }
        // S key to show/hide answer
        else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setShowAnswer(!showAnswer);
        }
        // B key to go back to main menu
        else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setOnMainPage(true);
        }
        // A key to add new card
        else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          setShowAddCardModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onMainPage, showAnswer, showAddCardModal, showEditCardModal, 
    showSubjectModal, showDeleteConfirm, showDeleteSubjectConfirm,
    showControls, showSubjectControls, showKeyboardHelp
  ]);

  // KEYBOARD NAVIGATION: Focus trapping for modals
  useEffect(() => {
    if (
      showSubjectModal || 
      showAddCardModal || 
      showEditCardModal || 
      showDeleteConfirm || 
      showDeleteSubjectConfirm ||
      showKeyboardHelp
    ) {
      // Set focus to the first focusable element when modal opens
      const setInitialFocus = () => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length) {
            firstFocusableElementRef.current = focusableElements[0];
            lastFocusableElementRef.current = focusableElements[focusableElements.length - 1];
            
            // Set focus to first element
            firstFocusableElementRef.current.focus();
          }
        }
      };
      
      // Small delay to ensure the modal DOM is ready
      setTimeout(setInitialFocus, 50);
      
      // Handle tab key within modal
      const handleTabKey = (e) => {
        // Only handle tab key when modal is open
        if (e.key !== 'Tab') return;
        
        // If no focusable elements, do nothing
        if (!firstFocusableElementRef.current || !lastFocusableElementRef.current) return;
        
        // SHIFT + TAB => focus on last element if we're at the first
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElementRef.current) {
            e.preventDefault();
            lastFocusableElementRef.current.focus();
          }
        } 
        // TAB => focus on first element if we're at the last
        else {
          if (document.activeElement === lastFocusableElementRef.current) {
            e.preventDefault();
            firstFocusableElementRef.current.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [
    showSubjectModal, 
    showAddCardModal, 
    showEditCardModal, 
    showDeleteConfirm, 
    showDeleteSubjectConfirm,
    showKeyboardHelp
  ]);

  // Fetch flashcards for a specific deck
  const fetchFlashcards = async (deckId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}flashcards/deck/${deckId}/`
      );
      
      if (response.data && response.data.data) {
        // Map backend model to frontend model
        const mappedFlashcards = response.data.data.map(card => ({
          id: card.id,
          moduleName: dbDecks.find(deck => deck.id === card.deck)?.name || "Unknown",
          topic: card.category || "General",
          difficulty: card.difficulty_level || "Medium",
          question: card.front_text,
          answer: card.back_text,
          // Store original data for API calls
          _original: card
        }));
        
        setDbFlashcards(mappedFlashcards);
        console.log("Fetched flashcards:", mappedFlashcards);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setDbFlashcards([]);
    }
  };

  // Delete a flashcard
  const deleteFlashcard = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}flashcards/delete/${id}/`);
      
      // Update the state to remove the deleted card
      setDbFlashcards(prev => prev.filter(card => card.id !== id));
      setShowDeleteConfirm(false);
      setCardToDelete(null);
      
      // Reset currentIndex if needed
      if (currentIndex >= filteredFlashcards.length - 1) {
        setCurrentIndex(Math.max(0, filteredFlashcards.length - 2));
      }
      
      // KEYBOARD NAVIGATION: Return focus to appropriate element
      if (onMainPage) {
        startStudyingButtonRef.current?.focus();
      } else {
        nextButtonRef.current?.focus();
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("Failed to delete flashcard. Please try again.");
    }
  };
  
  // Delete a subject/deck
  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}decks/delete/${id}/`);
      
      // Update the state to remove the deleted subject
      setDbDecks(prev => prev.filter(deck => deck.id !== id));
      
      // If the deleted subject was selected, select another one
      if (selectedDeckId === id) {
        const remainingDecks = dbDecks.filter(deck => deck.id !== id);
        if (remainingDecks.length > 0) {
          setSelectedDeckId(remainingDecks[0].id);
          setSelectedDeckName(remainingDecks[0].name);
          fetchFlashcards(remainingDecks[0].id);
        } else {
          setSelectedDeckId(null);
          setSelectedDeckName("Select a Subject");
          setDbFlashcards([]);
        }
      }
      
      setShowDeleteSubjectConfirm(false);
      setSubjectToDelete(null);
      
      // KEYBOARD NAVIGATION: Return focus to subjects button
      subjectsButtonRef.current?.focus();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject. Please try again.");
    }
  };

  // Handle subject change
  const handleSubjectChange = (deckId, deckName) => {
    setSelectedDeckId(deckId);
    setSelectedDeckName(deckName);
    fetchFlashcards(deckId);
    setShowSubjectControls(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    
    // KEYBOARD NAVIGATION: Return focus to subjects button
    subjectsButtonRef.current?.focus();
  };

  // Combine both hardcoded and DB subjects
  const allSubjects = [
    ...new Set(allFlashcards.map((card) => card.moduleName)),
    ...dbDecks.map(deck => deck.name)
  ];

  // Subject Modal with uncontrolled inputs
  const SubjectModal = () => {
    // Local refs for uncontrolled inputs
    const subjectInputRef = React.useRef(null);
    const topicInputRef = React.useRef(null);
    const createButtonRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);
    
    // Handle form submission with API integration
    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const subjectValue = subjectInputRef.current.value;
      if (!subjectValue.trim()) {
        alert("Please enter a subject name");
        return;
      }
      
      try {
        // Prepare data for creating a new deck
        const deckData = {
          name: subjectValue,
          description: topicInputRef.current.value || "",
          owner: studentId
        };
        
        // Get CSRF token for Django
        const csrftoken = getCsrfToken();
        
        const response = await axios.post(
          `${API_BASE_URL}decks/create/`, 
          deckData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken
            }
          }
        );
        
        // Handle successful response
        if (response.data && response.data.data) {
          // Add new deck to state without reload
          const newDeck = response.data.data;
          setDbDecks([...dbDecks, newDeck]);
          
          // Select the newly created deck
          setSelectedDeckId(newDeck.id);
          setSelectedDeckName(newDeck.name);
          
          console.log("Subject created:", newDeck);
          alert("Subject created successfully!");
          
          // Clear flashcards since new deck has none
          setDbFlashcards([]);
        }
        
        // Close modal
        setShowSubjectModal(false);
        
        // KEYBOARD NAVIGATION: Return focus to subjects button
        subjectsButtonRef.current?.focus();
      } catch (error) {
        // Log detailed error for debugging
        console.error("Error creating subject:", error);
        if (error.response) {
          console.log("Response data:", error.response.data);
          console.log("Response status:", error.response.status);
        }
        alert("Failed to create subject. Please try again.");
      }
    };
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSubjectModal(false);
        subjectsButtonRef.current?.focus();
      }
    };
    
    // Modal UI remains the same
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
          <h2 id="subject-modal-title" className="text-2xl font-bold mb-4">Add New Subject</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject-name" className="block text-sm font-medium mb-1">Subject Name *</label>
              <input
                type="text"
                id="subject-name"
                ref={subjectInputRef}
                defaultValue=""
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Mathematics"
                autoComplete="off"
                tabIndex="0"
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="subject-topic" className="block text-sm font-medium mb-1">Sub Topic</label>
              <input
                type="text"
                id="subject-topic"
                ref={topicInputRef}
                defaultValue=""
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Calculus"
                autoComplete="off"
                tabIndex="0"
              />
            </div>

            <button
              type="submit"
              ref={createButtonRef}
              className="w-full bg-[#79A657] text-white py-2 rounded-md text-sm"
              tabIndex="0"
            >
              Create Subject
            </button>
          </form>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowSubjectModal(false);
                subjectsButtonRef.current?.focus();
              }}
              ref={closeButtonRef}
              className="text-gray-600 hover:text-gray-800"
              tabIndex="0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Flashcard Modal - Using uncontrolled inputs
  const AddFlashcardModal = () => {
    // Local refs for uncontrolled inputs
    const subjectSelectRef = React.useRef(null);
    const questionInputRef = React.useRef(null);
    const answerInputRef = React.useRef(null);
    const difficultySelectRef = React.useRef(null);
    const categoryInputRef = React.useRef(null); // Added for backend
    const createButtonRef = React.useRef(null);
    const closeButtonRef = React.useRef(null);
    
    // Pre-select the current subject in the dropdown
    React.useEffect(() => {
      if (subjectSelectRef.current && selectedDeckName && selectedDeckName !== "Select a Subject") {
        subjectSelectRef.current.value = selectedDeckName;
      }
    }, [selectedDeckName]);
    
    // Handle form submission with API integration
    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get values from form fields
      const selectedSubjectValue = subjectSelectRef.current.value;
      const questionValue = questionInputRef.current.value;
      const answerValue = answerInputRef.current.value;
      const categoryValue = categoryInputRef.current?.value || "";
      const difficultyValue = difficultySelectRef.current.value;
      
      // Validate required fields
      if (!selectedSubjectValue || !questionValue.trim() || !answerValue.trim()) {
        alert("Please fill in all required fields");
        return;
      }
      
      // Find if this is a database deck or demo deck
      const selectedDeck = dbDecks.find(deck => deck.name === selectedSubjectValue);
      
      try {
        if (selectedDeck) {
          // Map frontend model to backend model
          const flashcardData = {
            front_text: questionValue,       // Map question to front_text
            back_text: answerValue,          // Map answer to back_text
            difficulty_level: difficultyValue, // Map difficulty to difficulty_level
            category: categoryValue,
            deck: selectedDeck.id            // Use the actual deck ID
          };
          
          // Get CSRF token for Django
          const csrftoken = getCsrfToken();
          
          const response = await axios.post(
            `${API_BASE_URL}flashcards/create/`, 
            flashcardData,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
              }
            }
          );
          
          // Handle successful response
          if (response.data && response.data.data) {
            console.log("Flashcard created:", response.data.data);
            
            // Map new flashcard to frontend format and add to state
            const newCard = {
              id: response.data.data.id,
              moduleName: selectedSubjectValue,
              topic: categoryValue || "General",
              difficulty: difficultyValue,
              question: questionValue,
              answer: answerValue,
              _original: response.data.data
            };
            
            setDbFlashcards([...dbFlashcards, newCard]);
            
            // If this is for the currently selected deck, make sure we select this deck
            if (selectedDeck.id !== selectedDeckId) {
              setSelectedDeckId(selectedDeck.id);
              setSelectedDeckName(selectedDeck.name);
            }
            
            alert("Flashcard created successfully!");
          }
        } else {
          // This is a demo subject - just log to console
          console.log("Creating flashcard for demo subject:", {
            subject: selectedSubjectValue,
            question: questionValue,
            answer: answerValue,
            difficulty: difficultyValue,
            category: categoryValue
          });
        }
        
        // Close modal
        setShowAddCardModal(false);
        
        // KEYBOARD NAVIGATION: Return focus to appropriate element
        if (onMainPage) {
          optionsButtonRef.current?.focus();
        } else {
          addCardButtonRef.current?.focus();
        }
      } catch (error) {
        // Log detailed error for debugging
        console.error("Error creating flashcard:", error);
        if (error.response) {
          console.log("Response data:", error.response.data);
          console.log("Response status:", error.response.status);
        }
        alert("Failed to create flashcard. Please try again.");
      }
    };
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAddCardModal(false);
        
        // Return focus to appropriate element
        if (onMainPage) {
          optionsButtonRef.current?.focus();
        } else {
          addCardButtonRef.current?.focus();
        }
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-modal-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
          <h2 id="add-card-modal-title" className="text-2xl font-bold mb-4">Add New Flashcard</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="card-subject" className="block text-sm font-medium mb-1">Subject *</label>
              <select
                id="card-subject"
                ref={subjectSelectRef}
                defaultValue={selectedDeckName !== "Select a Subject" ? selectedDeckName : ""}
                className="w-full p-2 border rounded-md"
                tabIndex="0"
                autoFocus
              >
                <option value="">Select a subject</option>
                {dbDecks.map(deck => (
                  <option key={deck.id} value={deck.name}>{deck.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="card-question" className="block text-sm font-medium mb-1">Question *</label>
              <textarea
                id="card-question"
                ref={questionInputRef}
                defaultValue=""
                className="w-full p-2 border rounded-md"
                placeholder="Enter your question"
                rows={3}
                tabIndex="0"
              />
            </div>

            <div>
              <label htmlFor="card-answer" className="block text-sm font-medium mb-1">Answer *</label>
              <textarea
                id="card-answer"
                ref={answerInputRef}
                defaultValue=""
                className="w-full p-2 border rounded-md"
                placeholder="Enter the answer"
                rows={3}
                tabIndex="0"
              />
            </div>

            <div>
              <label htmlFor="card-category" className="block text-sm font-medium mb-1">Category (optional)</label>
              <input
                id="card-category"
                type="text"
                ref={categoryInputRef}
                defaultValue=""
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Chapter 1, Formulas"
                tabIndex="0"
              />
            </div>

            <div>
              <label htmlFor="card-difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                id="card-difficulty"
                ref={difficultySelectRef}
                defaultValue="Easy"
                className="w-full p-2 border rounded-md"
                tabIndex="0"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              ref={createButtonRef}
              className="w-full bg-[#79A657] text-white py-2 rounded-md text-sm"
              tabIndex="0"
            >
              Create Flashcard
            </button>
          </form>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowAddCardModal(false);
                // Return focus to appropriate element
                if (onMainPage) {
                  optionsButtonRef.current?.focus();
                } else {
                  addCardButtonRef.current?.focus();
                }
              }}
              ref={closeButtonRef}
              className="text-gray-600 hover:text-gray-800"
              tabIndex="0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Flashcard Modal
  const EditFlashcardModal = () => {
    // Find the card being edited
    const card = dbFlashcards.find(card => card.id === editCardId);
    
    if (!card) {
      return null;
    }
    
    // Local refs for uncontrolled inputs
    const questionInputRef = React.useRef(null);
    const answerInputRef = React.useRef(null);
    const difficultySelectRef = React.useRef(null);
    const categoryInputRef = React.useRef(null);
    const updateButtonRef = React.useRef(null);
    const cancelButtonRef = React.useRef(null);
    
    // Set default values on mount
    React.useEffect(() => {
      if (questionInputRef.current) questionInputRef.current.value = card.question;
      if (answerInputRef.current) answerInputRef.current.value = card.answer;
      if (difficultySelectRef.current) difficultySelectRef.current.value = card.difficulty;
      if (categoryInputRef.current) categoryInputRef.current.value = card.topic;
    }, [card]);
    
    // Handle form submission with API integration
    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get values from form fields
      const questionValue = questionInputRef.current.value;
      const answerValue = answerInputRef.current.value;
      const categoryValue = categoryInputRef.current?.value || "";
      const difficultyValue = difficultySelectRef.current.value;
      
      // Validate required fields
      if (!questionValue.trim() || !answerValue.trim()) {
        alert("Please fill in all required fields");
        return;
      }
      
      try {
        // Map frontend model to backend model
        const flashcardData = {
          front_text: questionValue,       // Map question to front_text
          back_text: answerValue,          // Map answer to back_text
          difficulty_level: difficultyValue, // Map difficulty to difficulty_level
          category: categoryValue,
          deck: selectedDeckId            // Use the actual deck ID
        };
        
        // Get CSRF token for Django
        const csrftoken = getCsrfToken();
        
        const response = await axios.put(
          `${API_BASE_URL}flashcards/update/${editCardId}/`, 
          flashcardData,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken
            }
          }
        );
        
        // Handle successful response
        if (response.data && response.data.data) {
          console.log("Flashcard updated:", response.data.data);
          
          // Update the card in the state
          setDbFlashcards(prev => prev.map(c => 
            c.id === editCardId 
              ? {
                  ...c,
                  question: questionValue,
                  answer: answerValue,
                  difficulty: difficultyValue,
                  topic: categoryValue,
                  _original: response.data.data
                }
              : c
          ));
          
          alert("Flashcard updated successfully!");
        }
        
        // Close modal
        setShowEditCardModal(false);
        setEditCardId(null);
        
        // KEYBOARD NAVIGATION: Return focus to the flashcard
        flashcardRef.current?.focus();
      } catch (error) {
        // Log detailed error for debugging
        console.error("Error updating flashcard:", error);
        if (error.response) {
          console.log("Response data:", error.response.data);
          console.log("Response status:", error.response.status);
        }
        alert("Failed to update flashcard. Please try again.");
      }
    };
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowEditCardModal(false);
        setEditCardId(null);
        flashcardRef.current?.focus();
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-card-modal-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
          <h2 id="edit-card-modal-title" className="text-2xl font-bold mb-4">Edit Flashcard</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-subject" className="block text-sm font-medium mb-1">Subject</label>
              <input
                id="edit-subject"
                type="text"
                value={selectedDeckName}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100"
                tabIndex="-1"
              />
            </div>

            <div>
              <label htmlFor="edit-question" className="block text-sm font-medium mb-1">Question *</label>
              <textarea
                id="edit-question"
                ref={questionInputRef}
                defaultValue={card.question}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your question"
                rows={3}
                tabIndex="0"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="edit-answer" className="block text-sm font-medium mb-1">Answer *</label>
              <textarea
                id="edit-answer"
                ref={answerInputRef}
                defaultValue={card.answer}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the answer"
                rows={3}
                tabIndex="0"
              />
            </div>

            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium mb-1">Category (optional)</label>
              <input
                id="edit-category"
                type="text"
                ref={categoryInputRef}
                defaultValue={card.topic}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Chapter 1, Formulas"
                tabIndex="0"
              />
            </div>

            <div>
              <label htmlFor="edit-difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                id="edit-difficulty"
                ref={difficultySelectRef}
                defaultValue={card.difficulty}
                className="w-full p-2 border rounded-md"
                tabIndex="0"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              ref={updateButtonRef}
              className="w-full bg-[#79A657] text-white py-2 rounded-md text-sm"
              tabIndex="0"
            >
              Update Flashcard
            </button>
          </form>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowEditCardModal(false);
                setEditCardId(null);
                flashcardRef.current?.focus();
              }}
              ref={cancelButtonRef}
              className="text-gray-600 hover:text-gray-800"
              tabIndex="0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!cardToDelete) return null;
    
    const cancelRef = React.useRef(null);
    const deleteRef = React.useRef(null);
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDeleteConfirm(false);
        setCardToDelete(null);
        // Return focus to appropriate element
        if (onMainPage) {
          startStudyingButtonRef.current?.focus();
        } else {
          flashcardRef.current?.focus();
        }
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 id="delete-confirm-title" className="text-2xl font-bold mb-4">Delete Flashcard</h2>
          
          <p className="mb-6">Are you sure you want to delete this flashcard? This action cannot be undone.</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setCardToDelete(null);
                // Return focus to appropriate element
                if (onMainPage) {
                  startStudyingButtonRef.current?.focus();
                } else {
                  flashcardRef.current?.focus();
                }
              }}
              ref={cancelRef}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              tabIndex="0"
              autoFocus
            >
              Cancel
            </button>
            
            <button
              onClick={() => deleteFlashcard(cardToDelete)}
              ref={deleteRef}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              tabIndex="0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Delete Subject Confirmation Modal
  const DeleteSubjectConfirmModal = () => {
    if (!subjectToDelete) return null;
    
    // Find the subject being deleted
    const subject = dbDecks.find(deck => deck.id === subjectToDelete);
    
    const cancelRef = React.useRef(null);
    const deleteRef = React.useRef(null);
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDeleteSubjectConfirm(false);
        setSubjectToDelete(null);
        subjectsButtonRef.current?.focus();
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-subject-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 id="delete-subject-title" className="text-2xl font-bold mb-4">Delete Subject</h2>
          
          <p className="mb-6">
            Are you sure you want to delete the subject "{subject?.name}"? 
            <span className="font-bold text-red-600 block mt-2">This will also delete all flashcards in this subject!</span>
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteSubjectConfirm(false);
                setSubjectToDelete(null);
                subjectsButtonRef.current?.focus();
              }}
              ref={cancelRef}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              tabIndex="0"
              autoFocus
            >
              Cancel
            </button>
            
            <button
              onClick={() => deleteSubject(subjectToDelete)}
              ref={deleteRef}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              tabIndex="0"
            >
              Delete Subject
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Keyboard Shortcuts Help Modal
  const KeyboardShortcutsModal = () => {
    const closeRef = React.useRef(null);
    
    // KEYBOARD NAVIGATION: Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowKeyboardHelp(false);
        keyboardHelpButtonRef.current?.focus();
      }
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-container"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
      >
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 id="keyboard-help-title" className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
          
          <div className="space-y-2">
            {keyboardShortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between">
                <kbd className="bg-gray-100 px-2 py-1 rounded text-sm">{shortcut.key}</kbd>
                <span className="ml-4">{shortcut.action}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setShowKeyboardHelp(false);
                keyboardHelpButtonRef.current?.focus();
              }}
              ref={closeRef}
              className="px-4 py-2 bg-[#79A657] text-white rounded-md hover:bg-[#79A657]/90"
              tabIndex="0"
              autoFocus
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // FIXED: Combine hardcoded and DB flashcards for current deck only
  const combinedFlashcards = [
    ...allFlashcards.filter(card => 
      selectedDeckName === "Select a Subject" || card.moduleName === selectedDeckName
    ),
    ...dbFlashcards.filter(card => 
      card.moduleName === selectedDeckName
    )
  ];
  
  // Filter flashcards by difficulty
  const filteredFlashcards = combinedFlashcards.filter(
    (card) => card.difficulty === selectedDifficulty
  );

  // Simple progress calculation
  let progress = 0;
  if (filteredFlashcards.length > 1) {
    progress =
      currentIndex === 0
        ? 0
        : (currentIndex / (filteredFlashcards.length - 1)) * 100;
  }

  const handlePrevNext = (direction) => {
    setShowAnswer(false);
    if (direction === "prev") {
      setCurrentIndex((prev) =>
        prev === 0 ? filteredFlashcards.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex((prev) =>
        prev === filteredFlashcards.length - 1 ? 0 : prev + 1
      );
    }
    
    // KEYBOARD NAVIGATION: Focus the flashcard element after navigation
    setTimeout(() => {
      flashcardRef.current?.focus();
    }, 10);
  };


  // KEYBOARD NAVIGATION: Skip link component for accessibility
  const SkipLink = () => (
    <a 
      href="#main-content" 
      className="skip-link"
      tabIndex="0"
    >
      Skip to main content
    </a>
  );


  // KEYBOARD NAVIGATION: Keyboard Help Button
  const KeyboardHelpButton = () => (
    <button
      onClick={() => setShowKeyboardHelp(true)}
      ref={keyboardHelpButtonRef}
      className="fixed bottom-4 right-4 bg-[#79A657]/90 text-white p-2 rounded-full shadow-lg hover:bg-[#79A657] transition-colors"
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (press ? key)"
      tabIndex="0"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    </button>
  );

  // Error handling - if there's a runtime error, show a fallback UI
  try {
    /****************************************************
     * MAIN SUBJECT PAGE
     ****************************************************/
    if (onMainPage) {
      return (
        <div
          className="
            flashcards-container
            w-full min-h-screen
            md:pl-[15rem]
            p-4
            flex items-center justify-center
          "
        >
          {/* Accessibility: Skip link */}
          <SkipLink />
          
          {/* Keyboard help button */}
          <KeyboardHelpButton />
          
          {/* Display API error if any */}
          {apiError && (
            <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
              <p>{apiError}</p>
              <button 
                onClick={() => setApiError(null)}
                className="absolute top-2 right-2 text-yellow-700"
                tabIndex="0"
                aria-label="Close error message"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* If user opens these modals, they appear in front */}
          {showSubjectModal && <SubjectModal />}
          {showAddCardModal && <AddFlashcardModal />}
          {showEditCardModal && <EditFlashcardModal />}
          {showDeleteConfirm && <DeleteConfirmModal />}
          {showDeleteSubjectConfirm && <DeleteSubjectConfirmModal />}
          {showKeyboardHelp && <KeyboardShortcutsModal />}

          {/* The main "green" card */}
          <div 
            id="main-content"
            className="
              relative max-w-6xl w-full 
              bg-[#79A657]/20 rounded-2xl 
              p-8 flex flex-col justify-between 
              max-h-[80vh] overflow-auto
            "
            tabIndex="-1" // Not focusable but can be targeted by skip link

          >
            {/* Multi-purpose Subjects Menu - COMBINED BUTTON */}
            <div className="absolute top-6 left-6 z-20">
              <button
                ref={subjectsButtonRef}
                className="
                  bg-[#79A657]
                  text-white
                  px-4
                  py-3
                  rounded-full
                  hover:scale-105
                  transition-transform
                  cursor-pointer
                  flex items-center gap-2
                  min-w-[150px]
                "
                onClick={() => {
                  setShowSubjectControls(!showSubjectControls);
                  setShowControls(false); // Close other dropdown if open
                }}
                aria-expanded={showSubjectControls}
                aria-controls="subjects-dropdown"
                tabIndex="0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Subjects
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showSubjectControls && (
                <div
                  id="subjects-dropdown"
                  className="
                    mt-2 
                    rounded
                    animate-dropdown
                    bg-white
                    border border-gray-200
                    shadow-lg
                    min-w-[220px]
                    max-h-[350px]
                    overflow-y-auto
                    z-30
                  "
                  role="menu"
                  aria-labelledby="subjects-button"
                >
                  <div className="py-2 px-3 bg-gray-100 font-medium text-gray-700 border-b">
                    Select Subject
                  </div>
                  
                  {dbDecks.length > 0 ? (
                    <>
                      {dbDecks.map((deck, index) => (
                        <div
                          key={deck.id}
                          className="flex items-center justify-between group"
                        >
                          <button
                            onClick={() => handleSubjectChange(deck.id, deck.name)}
                            className={`
                              px-4 py-2 
                              cursor-pointer
                              text-gray-700
                              hover:bg-[#79A657]/10
                              transition-colors
                              flex-grow
                              text-left
                              ${
                                selectedDeckId === deck.id
                                  ? "bg-[#79A657]/10 font-medium"
                                  : ""
                              }
                            `}
                            role="menuitem"
                            tabIndex="0"
                            ref={el => {
                              // Store refs for keyboard navigation
                              subjectDropdownItemsRef.current[index] = el;
                            }}
                          >
                            {deck.name}
                          </button>
                          <button
                            onClick={() => {
                              setSubjectToDelete(deck.id);
                              setShowDeleteSubjectConfirm(true);
                              setShowSubjectControls(false);
                            }}
                            className="
                              px-2
                              text-gray-400
                              hover:text-red-500
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                            "
                            title={`Delete subject ${deck.name}`}
                            aria-label={`Delete subject ${deck.name}`}
                            tabIndex="0"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div className="border-t border-gray-200"></div>
                    </>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      No subjects available
                    </div>
                  )}
                  
                  {/* Add new subject option */}
                  <button

                    onClick={() => {
                      setShowSubjectModal(true);
                      setShowSubjectControls(false);
                    }}
                    className="
                      w-full px-4 py-2 
                      cursor-pointer
                      text-[#79A657] font-medium
                      hover:bg-[#79A657]/10
                      transition-colors
                      flex items-center
                      text-left
                    "
                    role="menuitem"
                    tabIndex="0"
                    ref={el => {
                      // Last item in the dropdown
                      subjectDropdownItemsRef.current[dbDecks.length] = el;
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Subject
                  </button>
                </div>
              )}
            </div>

            {/* Multi-purpose Control Menu - COMBINED BUTTON */}
            <div className="absolute top-6 right-6 z-20">
              <button
                ref={optionsButtonRef}
                className="
                  bg-[#79A657]
                  text-white
                  px-4
                  py-3
                  rounded-full
                  hover:scale-105
                  transition-transform
                  cursor-pointer
                  flex items-center gap-2
                  min-w-[150px]
                "
                onClick={() => {
                  setShowControls(!showControls);
                  setShowSubjectControls(false); // Close subject dropdown if open
                }}
                aria-expanded={showControls}
                aria-controls="options-dropdown"
                tabIndex="0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Options
                <svg
                  className="w-4 h-4 ml-auto"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showControls && (
                <div
                  id="options-dropdown"
                  className="
                    mt-2 
                    rounded
                    animate-dropdown
                    bg-white
                    border border-gray-200
                    shadow-lg
                    min-w-[200px]
                    z-30
                  "
                  role="menu"
                  aria-labelledby="options-button"
                >
                  <div className="py-2 px-3 bg-gray-100 font-medium text-gray-700 border-b">
                    Difficulty Level
                  </div>
                  {difficulties.map((diff, index) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setShowControls(false);
                        setCurrentIndex(0);
                        setShowAnswer(false);
                      }}
                      className={`
                        w-full px-4 py-2 
                        cursor-pointer
                        text-gray-700
                        hover:bg-[#79A657]/10
                        transition-colors
                        text-left
                        ${
                          selectedDifficulty === diff
                            ? "bg-[#79A657]/10 font-medium"
                            : ""
                        }
                      `}
                      role="menuitem"
                      tabIndex="0"
                      ref={el => {
                        // Store refs for keyboard navigation
                        difficultyDropdownItemsRef.current[index] = el;
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                  
                  <div className="border-t border-gray-200"></div>
                  
                  <button
                    onClick={() => {
                      setShowAddCardModal(true);
                      setShowControls(false);
                    }}
                    className="
                      w-full px-4 py-2 
                      cursor-pointer
                      text-[#79A657] font-medium
                      hover:bg-[#79A657]/10
                      transition-colors
                      flex items-center
                      text-left
                    "
                    role="menuitem"
                    tabIndex="0"
                    ref={el => {
                      // Last item in the dropdown
                      difficultyDropdownItemsRef.current[difficulties.length] = el;
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New Flashcard
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center h-72 mt-16">
              {dbDecks.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">No Subjects Available</h2>
                  <p className="text-gray-600 mb-6">Get started by creating your first subject.</p>
                  <button
                    onClick={() => setShowSubjectModal(true)}
                    className="
                      bg-[#79A657] text-white px-6 py-2
                      rounded-full font-semibold
                      hover:scale-105 transition-transform
                    "
                    tabIndex="0"
                  >
                    <span className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Create First Subject
                    </span>
                  </button>
                </div>
              ) : filteredFlashcards.length === 0 ? (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">{selectedDeckName}</h2>
                  <p className="text-gray-600 mb-6">No flashcards found for difficulty "{selectedDifficulty}"</p>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="
                      bg-[#79A657] text-white px-6 py-2
                      rounded-full font-semibold
                      hover:scale-105 transition-transform
                    "
                    tabIndex="0"
                  >
                    <span className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Create Flashcard
                    </span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-center mb-2">
                    {selectedDeckName}
                  </h2>
                  <p className="text-gray-600">
                    {filteredFlashcards.length} flashcards • {selectedDifficulty} difficulty
                  </p>
                </div>
              )}
            </div>

            {/* Only show the Start Studying button if there are flashcards */}
            {filteredFlashcards.length > 0 && (
              <button
                ref={startStudyingButtonRef}
                onClick={() => {
                  setOnMainPage(false);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                className="
                  mt-6 block mx-auto
                  bg-[#79A657]
                  text-white
                  px-8
                  py-3
                  rounded-full
                  hover:bg-[#79A657]/80
                  hover:scale-105
                  transition-all
                  font-semibold
                  flex items-center
                "
                tabIndex="0"
              >
                <span className="mr-2">Start Studying</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      );
    }


    // If navigated to study page but no cards found
    if (filteredFlashcards.length === 0) {
      return (
        <div
          className="
            flashcards-container
            w-full min-h-screen
            md:pl-[15rem]
            p-4 
            flex flex-col items-center justify-center
          "
        >
          {/* Accessibility: Skip link */}
          <SkipLink />
          
          {/* Keyboard help button */}
          <KeyboardHelpButton />
          
          <p id="main-content" className="mb-4 text-xl" tabIndex="-1">
            No flashcards found for difficulty "{selectedDifficulty}" in subject "{selectedDeckName}"
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setOnMainPage(true)}
              ref={backButtonRef}
              className="
                bg-white border border-[#79A657] text-[#79A657] px-6 py-2 
                rounded-full font-semibold 
                hover:bg-[#79A657]/10 transition-colors
                flex items-center
              "
              tabIndex="0"
              autoFocus
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Go Back
            </button>
            
            <button
              onClick={() => setShowAddCardModal(true)}
              className="
                bg-[#79A657] text-white px-6 py-2 
                rounded-full font-semibold 
                hover:bg-[#79A657]/80 hover:scale-105 transition-all
                flex items-center
              "
              tabIndex="0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Flashcard
            </button>
          </div>
          
          {showAddCardModal && <AddFlashcardModal />}

        </div>
      );
    }


    /****************************************************
     * STUDY PAGE (SHOW/HIDE ANSWER)
     ****************************************************/
    const cardLabel = `${currentIndex + 1} / ${filteredFlashcards.length}`;

    // The current card object
    const currentCard = filteredFlashcards[currentIndex];

    return (
      <div
        className="
          flashcards-container
          w-full min-h-screen
          md:pl-[15rem]
          p-4
          flex flex-col
          overflow-y-auto
          relative
          mt-24
          pt-8
        "
      >
        {/* Accessibility: Skip link */}
        <SkipLink />
        
        {/* Keyboard help button */}
        <KeyboardHelpButton />
        
        {/* If user opens these modals, they appear in front */}
        {showEditCardModal && <EditFlashcardModal />}
        {showDeleteConfirm && <DeleteConfirmModal />}
        {showAddCardModal && <AddFlashcardModal />}
        {showKeyboardHelp && <KeyboardShortcutsModal />}

        {/* Top Bar for Navigation + Progress */}
        <div id="main-content" className="max-w-6xl mx-auto w-full flex justify-between items-center mb-8" tabIndex="-1">
          <button
            onClick={() => setOnMainPage(true)}
            ref={backButtonRef}
            className="
              flex items-center gap-2 
              text-[#79A657] font-medium 
              hover:underline
            "
            tabIndex="0"
            aria-label="Back to main page"

          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            {/* Cards Remaining Counter */}
            <span className="font-medium text-sm" aria-live="polite">
              Card {cardLabel}
            </span>

            {/* Progress Bar */}
            <div 
              className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${Math.round(progress)}% progress through flashcards`}
            >
              <div
                className="h-full bg-[#79A657] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto w-full">
          {/* Flashcard */}
          <div
            ref={flashcardRef}
            className="
              bg-[#79A657]/20 
              shadow-xl 
              rounded-3xl 
              p-8 
              mb-6
              relative
              flex
              flex-col
              justify-center
              cursor-pointer
              flashcard
              min-h-[400px]
            "
            onClick={() => setShowAnswer(!showAnswer)}
            onKeyDown={(e) => {
              // Toggle on Enter or Space
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowAnswer(!showAnswer);
              }
            }}
            tabIndex="0"
            role="button"
            aria-label={`Flashcard: ${showAnswer ? 'Click to see question' : 'Click to see answer'}`}
            aria-pressed={showAnswer}
          >
            {/* Difficulty label */}
            <span className="absolute top-4 left-4 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              {currentCard.difficulty}
            </span>

            {/* Topic label */}
            <span className="absolute top-4 right-4 bg-[#79A657]/20 text-[#79A657] px-3 py-1 rounded-full text-xs font-medium">
              {currentCard.topic}
            </span>

            {/* Front side (Question) */}
            <div
              className={`
                ${
                  showAnswer ? "opacity-0" : "opacity-100"
                } transition-opacity duration-300 absolute inset-0 p-8 flex flex-col justify-center
              `}
              aria-hidden={showAnswer}
            >
              <div className="text-sm text-gray-500 mb-2">Question</div>
              <div className="text-2xl font-medium leading-relaxed text-center">
                {currentCard.question}
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <span className="text-sm text-gray-400">Click to see answer</span>
              </div>
            </div>

            {/* Back side (Answer) */}
            <div
              className={`
                ${
                  showAnswer ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300 absolute inset-0 p-8 flex flex-col justify-center
              `}
              aria-hidden={!showAnswer}
            >
              <div className="text-sm text-gray-500 mb-2">Answer</div>
              <div className="text-2xl font-medium leading-relaxed text-center">
                {currentCard.answer}
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <span className="text-sm text-gray-400">Click to see question</span>
              </div>
            </div>
            
            {/* Edit/Delete buttons - only show for database cards */}
            {currentCard.id > 0 && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent flashcard flip
                    setEditCardId(currentCard.id);
                    setShowEditCardModal(true);
                  }}
                  className="
                    bg-white text-[#79A657] 
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    hover:bg-gray-100
                    transition-colors
                    border border-[#79A657]
                  "
                  aria-label="Edit flashcard"
                  tabIndex="0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent flashcard flip
                    setCardToDelete(currentCard.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="
                    bg-white text-red-500
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    hover:bg-gray-100
                    transition-colors
                    border border-red-500
                  "
                  aria-label="Delete flashcard"
                  tabIndex="0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => handlePrevNext("prev")}
              ref={prevButtonRef}
              className="
                bg-white
                border border-[#79A657] 
                text-[#79A657]
                px-6
                py-3
                rounded-full
                font-semibold
                hover:bg-[#79A657]/10
                transition-colors
                flex items-center
              "
              tabIndex="0"
              aria-label="Previous flashcard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>

            <button
              onClick={() => setShowAddCardModal(true)}
              ref={addCardButtonRef}
              className="
                bg-white
                border border-[#79A657] 
                text-[#79A657]
                px-6
                py-3
                rounded-full
                font-semibold
                hover:bg-[#79A657]/10
                transition-colors
                flex items-center
              "
              tabIndex="0"
              aria-label="Add new flashcard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Card
            </button>

            <button
              onClick={() => handlePrevNext("next")}
              ref={nextButtonRef}
              className="
                bg-[#79A657]
                text-white
                px-6
                py-3
                rounded-full
                font-semibold
                hover:bg-[#79A657]/90
                transition-colors
                flex items-center
              "
              tabIndex="0"
              aria-label="Next flashcard"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Fallback UI in case of runtime errors
    console.error("Error rendering Flashcards component:", error);
    return (
      <div className="flashcards-container w-full min-h-screen md:pl-[15rem] p-4 flex flex-col items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-xl">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">There was an error rendering the Flashcards component.</p>
          <details className="text-sm">
            <summary className="cursor-pointer hover:underline" tabIndex="0">Error details</summary>
            <pre className="mt-2 p-2 bg-red-50 rounded overflow-auto text-xs">{error.toString()}</pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            tabIndex="0"

          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}