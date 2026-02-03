/* eslint-disable react-hooks/set-state-in-effect */
import { Outlet } from "react-router";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

export default function LayoutBase() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
      {/* Sidebar - Passamos o estado e a função de fechar */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Wrapper Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={toggleMenu} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}