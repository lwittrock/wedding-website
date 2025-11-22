import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Section from "../components/Section";
import ScheduleTimeline from "../components/ScheduleTimeline";
import ScheduleItem from "../components/ScheduleItem";
import Footer from "../components/Footer";

import { useScrollSpy } from "../hooks/useScrollSpy";
import { SECTIONS } from "../constants/sections";

import { Calendar, MapPin, HelpCircle, Users } from "lucide-react";

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeSection = useScrollSpy(
    SECTIONS.map((s) => s.id),
    100
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = 64;
    const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    // Global Styles: Background, Text Color, and Default Font (Alice)
    <div className="min-h-screen bg-background text-neutral font-alice">
      <Navigation
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
      />

      <Hero />

      {/* Schedule Section */}
      <Section 
        id="schedule" 
        dividerGap="lg" 
        contentBottomPadding="lg"
        title="Schedule"
        icon={Calendar}
      >
        <ScheduleTimeline>
          <ScheduleItem
            title="Arrival, checking in and getting ready"
            dateTime="Friday, June 26th, 13.00"
          >
            <p>
              From 13.00 onward we are ready to welcome you at the Domaine!
              We'll tell you where to find your room, and you'll have time
              to drop your bags and get ready. If you don't need that much
              time, a cold drink will be waiting for you.
            </p>
          </ScheduleItem>

          <ScheduleItem
            title="Wedding Time!"
            dateTime="Friday, June 26th, 15.30 - 03.00"
          >
            <p>
              Find yourself a seat and get ready to celebrate! The ceremony
              starts at 16.00 — don't miss it. We’ll continue with dinner,
              drinks, and dancing.
            </p>
          </ScheduleItem>

          <ScheduleItem
            title="Relax at the Domaine or Explore the Ardennes"
            dateTime="Saturday, June 27th, 10.00 - 16.00"
          >
            <p className="mb-3">
              Breakfast / brunch / lunch whenever you’re ready!
            </p>
            <p className="mb-3">
              Outdoor enthusiasts: explore museums, history, hikes, or cycling.
            </p>
            <p>
              Relaxation enthusiasts: hang out at the Domaine — tennis,
              football, jeu de boules, sauna, and vibes.
            </p>
          </ScheduleItem>

          <ScheduleItem
            title="Barbecue & Bonfire"
            dateTime="Saturday, June 27th, 16.00 - ..."
          >
            <p>
              If the weather treats us well, we’ll turn on the grill. If it
              doesn’t treat us well… we’ll still turn on the grill.
            </p>
          </ScheduleItem>

          <ScheduleItem
            title="Breakfast & Departure"
            dateTime="Sunday, June 28th, 10.00 - ..."
            isLast
          >
            <p>
              One last breakfast together before we say goodbye. Thank you
              for celebrating with us!
            </p>
          </ScheduleItem>
        </ScheduleTimeline>
      </Section>

      {/* Travel Section */}
      <Section 
        id="travel" 
        dividerGap="lg" 
        contentBottomPadding="lg"
        title="Travel & Accommodations"
        icon={MapPin}
      >
        <div className="text-center">
          <p className="text-lg">Travel information coming soon...</p>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section 
        id="faq" 
        dividerGap="lg" 
        contentBottomPadding="lg"
        title="Frequently Asked Questions"
        icon={HelpCircle}
      >
        <div className="text-center">
          <p className="text-lg">FAQ details coming soon...</p>
        </div>
      </Section>

      {/* RSVP Section */}
      <Section 
        id="rsvp" 
        dividerGap="lg" 
        contentBottomPadding="xl"
        title="RSVP"
        icon={Users}
      >
        <div className="text-center">
          <p className="text-lg mb-6">Please let us know if you can join us!</p>
          <button className="bg-primary hover:brightness-90 text-white px-8 py-3 rounded-md transition-all font-alice">
            RSVP Form (Coming Soon)
          </button>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default HomePage;