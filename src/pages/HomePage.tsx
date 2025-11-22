import React, { useState, useEffect } from 'react';
import { Menu, X, MapPin, Calendar, Users, HelpCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const handleScroll = (): void => {
      const sections = ['home', 'schedule', 'travel', 'faq', 'rsvp'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#FAF7F2]/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => scrollToSection('home')}
              className="text-[#427161] hover:text-[#cc5500] transition-colors"
              style={{ fontFamily: 'Parisienne, cursive', fontSize: '1.5rem' }}
            >
              J & L
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'travel', label: 'Travel' },
                { id: 'faq', label: 'FAQ' },
                { id: 'rsvp', label: 'RSVP' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm transition-colors ${
                    activeSection === item.id
                      ? 'text-[#cc5500]'
                      : 'text-[#427161] hover:text-[#cc5500]'
                  }`}
                  style={{ fontFamily: 'Alice, serif' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[#427161]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-t border-[#427161]/20">
            <div className="px-4 py-4 space-y-3">
              {[
                { id: 'home', label: 'Home' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'travel', label: 'Travel' },
                { id: 'faq', label: 'FAQ' },
                { id: 'rsvp', label: 'RSVP' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-[#427161] hover:text-[#cc5500] transition-colors py-2"
                  style={{ fontFamily: 'Alice, serif' }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-end pt-16">
        <div className="absolute inset-0">
          <img
            src="/venue-painting.png"
            alt="Venue watercolor"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF7F2]/95"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative element */}
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#427161] to-transparent"></div>
            </div>
            
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl mb-4 text-[#cc5500]"
              style={{ fontFamily: 'Parisienne, cursive' }}
            >
              Jenna & Lars
            </h1>
            
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl mb-6 text-[#427161]"
              style={{ fontFamily: 'Alice, serif' }}
            >
              Wedding Weekend
            </h2>
            
            <div
              className="text-xl sm:text-2xl mb-8 text-[#494949]"
              style={{ fontFamily: 'Alice, serif' }}
            >
              26 - 28 June 2026
            </div>
            
            <div
              className="flex items-center justify-center gap-2 text-[#427161] mb-4"
              style={{ fontFamily: 'Alice, serif' }}
            >
              <MapPin size={20} />
              <span className="text-base sm:text-lg">Domaine Des Officiers</span>
            </div>
            
            <div
              className="text-[#427161] text-sm sm:text-base"
              style={{ fontFamily: 'Alice, serif' }}
            >
              Vielsalm, Belgian Ardennes
            </div>

            {/* Decorative element */}
            <div className="mt-8 flex justify-center">
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#427161] to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Calendar className="text-[#cc5500]" size={28} />
            <h2
              className="text-3xl sm:text-4xl text-[#427161]"
              style={{ fontFamily: 'Parisienne, cursive' }}
            >
              Schedule
            </h2>
          </div>
          <div className="text-center text-[#494949]" style={{ fontFamily: 'Alice, serif' }}>
            <p className="text-lg">Weekend itinerary coming soon...</p>
          </div>
        </div>
      </section>

      {/* Travel Section */}
      <section id="travel" className="py-20 px-4 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <MapPin className="text-[#cc5500]" size={28} />
            <h2
              className="text-3xl sm:text-4xl text-[#427161]"
              style={{ fontFamily: 'Parisienne, cursive' }}
            >
              Travel & Accommodations
            </h2>
          </div>
          <div className="text-center text-[#494949]" style={{ fontFamily: 'Alice, serif' }}>
            <p className="text-lg">Travel information coming soon...</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <HelpCircle className="text-[#cc5500]" size={28} />
            <h2
              className="text-3xl sm:text-4xl text-[#427161]"
              style={{ fontFamily: 'Parisienne, cursive' }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div className="text-center text-[#494949]" style={{ fontFamily: 'Alice, serif' }}>
            <p className="text-lg">FAQ details coming soon...</p>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="py-20 px-4 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Users className="text-[#cc5500]" size={28} />
            <h2
              className="text-3xl sm:text-4xl text-[#427161]"
              style={{ fontFamily: 'Parisienne, cursive' }}
            >
              RSVP
            </h2>
          </div>
          <div className="text-center text-[#494949]" style={{ fontFamily: 'Alice, serif' }}>
            <p className="text-lg mb-6">Please let us know if you can join us!</p>
            <button
              className="bg-[#cc5500] hover:bg-[#b34a00] text-white px-8 py-3 rounded-md transition-colors"
              style={{ fontFamily: 'Alice, serif' }}
            >
              RSVP Form (Coming Soon)
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#427161] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center" style={{ fontFamily: 'Alice, serif' }}>
          <p className="text-sm">
            We can't wait to celebrate with you in the Belgian Ardennes!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;