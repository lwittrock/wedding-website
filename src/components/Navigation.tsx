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
    <nav className="fixed top-0 left-0 w-full bg-[#FAF7F2]/80 backdrop-blur-md z-50 border-b border-[#427161]/20">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Brand */}
        <div className="text-2xl font-parisienne text-[#427161]">
          Our Wedding
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 font-alice text-lg text-[#494949]">
          {SECTIONS.map((section) => (
            <li
              key={section.id}
              className={`cursor-pointer transition ${
                activeSection === section.id
                  ? "text-[#cc5500] font-semibold"
                  : "hover:text-[#cc5500]"
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="md:hidden bg-[#FAF7F2] border-t border-[#427161]/20 font-alice text-lg px-6 py-4 space-y-4">
          {SECTIONS.map((section) => (
            <li
              key={section.id}
              className={`cursor-pointer ${
                activeSection === section.id
                  ? "text-[#cc5500] font-semibold"
                  : "text-[#494949]"
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
