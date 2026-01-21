// src/layout/MainLayout.jsx
import React from "react";
import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
