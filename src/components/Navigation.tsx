import React from "react";
import { Menu, X } from "lucide-react";
import { SECTIONS } from "../constants/sections";

interface NavigationProps {
  activeSection: string | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  scrollToSection: (id: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  isMenuOpen,
  setIsMenuOpen,
  scrollToSection
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-secondary/20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        <div className="text-2xl font-parisienne text-secondary">
          J & L
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 font-alice text-lg text-neutral">
          {SECTIONS.map((section) => (
            <li
              key={section.id}
              className={`cursor-pointer transition ${
                activeSection === section.id
                  ? "text-primary font-semibold"
                  : "hover:text-primary"
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-neutral"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="md:hidden bg-background border-t border-secondary/20 font-alice text-lg px-6 py-4 space-y-4">
          {SECTIONS.map((section) => (
            <li
              key={section.id}
              className={`cursor-pointer ${
                activeSection === section.id
                  ? "text-primary font-semibold"
                  : "text-neutral"
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navigation;