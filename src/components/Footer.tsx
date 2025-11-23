import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="px-4 pb-8">
      {/* Divider line */}
      <div className="max-w-4xl mx-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
      </div>
      
      {/* Footer content */}
      <div className="max-w-4xl mx-auto pt-8 text-center text-[#494949] font-alice">
        <p>© 2026 Jenna & Lars — We are excited to celebrate with you ♥</p>
      </div>
    </footer>
  );
};

export default Footer;