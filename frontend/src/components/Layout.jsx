import React from "react";
import { Outlet } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";

function Layout() {
  return (
    <div>
      <header style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
        <DarkModeToggle />
      </header>
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;