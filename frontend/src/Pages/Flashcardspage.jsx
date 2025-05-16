import React from "react";
import pencil from "../assets/Pencil.png";

// Ensure correct file paths
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import Flashcards from "../components/Flashcards.jsx";
import notes_broken from "../assets/notes_broken.png"

function FlashcardsPage() {
  console.log("FlashcardsPage component rendering...");

  return (
    <>
    <Sidebar/>
    <Header title="Flashcards" pageIcon={notes_broken} />
    <Flashcards />
    </>
  );
}

export default FlashcardsPage;