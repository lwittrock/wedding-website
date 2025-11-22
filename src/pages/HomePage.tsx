import React, { useState } from "react";

// Components and Hooks
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ImageModal from "../components/ImageModal";

import ScheduleTimeline from "../components/ScheduleTimeline";
import ScheduleItem from "../components/ScheduleItem";
import FAQGrid from "../components/FAQGrid";
import FAQItem from "../components/FAQItem";
import RsvpModule from '../components/RsvpModule';

import { useScrollSpy } from "../hooks/useScrollSpy";
import { SECTIONS } from "../constants/sections";

// Icons
import { 
  Calendar, MapPin, HelpCircle, Users, 
  Plane, Train, CarFront, Info,
  CalendarClock, BedDouble, Shirt, Heart, CloudSun, Flower2, Car, Gift
} from "lucide-react";

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{src: string, alt: string} | null>(null);

  const activeSection = useScrollSpy(SECTIONS.map((s) => s.id), 100);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = 64;
    const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const openModal = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  return (
    <div className="min-h-screen bg-background text-neutral font-alice">
      <ImageModal 
        isOpen={!!modalImage} 
        onClose={() => setModalImage(null)} 
        imageSrc={modalImage?.src || ""} 
        altText={modalImage?.alt || ""} 
      />

      <Navigation
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
      />

      <Hero />

      {/* --- SCHEDULE --- */}
      <Section id="schedule" dividerGap="lg" contentBottomPadding="lg" title="Schedule" icon={Calendar}>
        <ScheduleTimeline>
          <ScheduleItem title="Arrival, checking in and getting ready" dateTime="Friday, June 26th, 13.00">
            <p>From 13.00 onward we are ready to welcome you at the Domaine! We'll tell you where to find your room, and you'll have time to drop your bags and get ready. If you don't need that much time, a cold drink will be waiting for you.</p>
          </ScheduleItem>

          <ScheduleItem title="Wedding Time!" dateTime="Friday, June 26th, 15.30 - 03.00">
            <p>Find yourself a seat and get ready to celebrate! The ceremony starts at 16.00 — don't miss it. We’ll continue with dinner, drinks, and dancing.</p>
          </ScheduleItem>

          <ScheduleItem title="Relax at the Domaine or Explore the Ardennes" dateTime="Saturday, June 27th, 10.00 - 16.00">
            <p className="mb-3">Breakfast / brunch / lunch whenever you’re ready!</p>
            <p className="mb-3">Outdoor enthusiasts: explore museums, history, hikes, or cycling.</p>
            <p>Relaxation enthusiasts: hang out at the Domaine — tennis, football, jeu de boules, sauna, and vibes.</p>
          </ScheduleItem>

          <ScheduleItem title="Barbecue & Bonfire" dateTime="Saturday, June 27th, 16.00 - ...">
            <p>If the weather treats us well, we’ll turn on the grill. If it doesn’t treat us well… we’ll still turn on the grill.</p>
          </ScheduleItem>

          <ScheduleItem title="Breakfast & Departure" dateTime="Sunday, June 28th, 10.00 - ..." isLast>
            <p>One last breakfast together before we say goodbye. Thank you for celebrating with us!</p>
          </ScheduleItem>
        </ScheduleTimeline>
      </Section>

      {/* --- TRAVEL --- */}
      <Section id="travel" dividerGap="lg" contentBottomPadding="lg" title="Travel Information" icon={MapPin}>
        {/* Venue Details */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-parisienne text-primary mb-2">Domaine Des Officiers</h3>
          <p className="text-lg mb-4">Rue de la Gare 9, 6690 Vielsalm, Belgium</p>
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => openModal('/venue-photo.jpg', 'The Venue')} className="text-sm border border-secondary text-secondary px-4 py-2 rounded hover:bg-secondary hover:text-white transition-colors">
              View Location
            </button>
            <button onClick={() => openModal('/entrance-photo.jpg', 'The Entrance')} className="text-sm border border-secondary text-secondary px-4 py-2 rounded hover:bg-secondary hover:text-white transition-colors">
              View Entrance
            </button>
          </div>
          <div className="bg-secondary/5 p-4 rounded-lg inline-block max-w-2xl mx-auto border border-secondary/20">
            <div className="flex items-start gap-3 text-left">
              <Info className="text-primary shrink-0 mt-1" size={20} />
              <p className="text-sm italic"><strong>Good to know:</strong> You don't directly see the Domaine from the street. You enter on foot where the flag is visible!</p>
            </div>
          </div>
        </div>

        {/* Travel Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-primary"><Plane size={24} /></div>
            <h4 className="font-parisienne text-xl text-secondary mb-3">By Plane</h4>
            <div className="text-sm leading-relaxed space-y-3">
              <p><strong>Brussels (BRU)</strong> is a great option. You can take a train directly from the airport to Vielsalm Station!</p>
              <p className="text-xs opacity-80">Other options: Charleroi (CRL), Eindhoven (EIN), Düsseldorf (DUS), Bonn/Cologne (CGN).</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-primary"><Train size={24} /></div>
            <h4 className="font-parisienne text-xl text-secondary mb-3">By Train</h4>
            <div className="text-sm leading-relaxed">
              <p className="mb-3"><strong>Vielsalm Train Station</strong> is just a 10-minute walk from the venue.</p>
              <p>Carrying heavy bags? Let us know your arrival time and we'll come pick you up!</p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-primary"><CarFront size={24} /></div>
            <h4 className="font-parisienne text-xl text-secondary mb-3">By Car</h4>
            <div className="text-sm leading-relaxed space-y-2">
              <p>Parking in Vielsalm is easy and free.</p>
              <ul className="text-left inline-block list-disc pl-4 space-y-1">
                <li>At the church (5 min walk)</li>
                <li><a href="#" className="text-primary underline">Public Parking Lot</a></li>
                <li>Street parking nearby</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* --- FAQ --- */}
      <Section id="faq" dividerGap="lg" contentBottomPadding="lg" title="Frequently Asked Questions" icon={HelpCircle}>
        <FAQGrid>

          <FAQItem icon={BedDouble} question="What type of accommodation can I expect?">
            <p className="mb-2">
              We’ve made sure all guests will have a comfortable room for Friday and Saturday night, 
              either at the Domaine or in a nearby gîte a 5-minute walk away.
            </p>
            <p className="mb-2">
              If you're staying in one of the places we've booked, 
              <strong className="text-primary">we've got the costs covered.</strong>
            </p>
            <p>
              If you’d rather arrange your own place to stay, that is perfectly fine! Please let us know as soon as possible.
            </p>
          </FAQItem>

          <FAQItem icon={Shirt} question="What should I wear?">
            <p className="mb-3">
              <strong className="text-primary">Friday (Fancy & Festive):</strong> We’d love to see you looking your best! 
              Think long or cocktail dresses, tuxedos, suits, or whatever makes you feel fabulous. 
              Hats or fascinators are welcome!
            </p>
            <p className="mb-3 italic text-sm opacity-80">
              Good to know: there is grass outside, so you might not want to wear (stiletto) heels.
            </p>
            <p>
              <strong className="text-primary">Saturday (Comfy & Casual):</strong> Anything goes!
            </p>
          </FAQItem>

          <FAQItem icon={CalendarClock} question="When is the RSVP deadline?">
            Please RSVP by <strong className="text-primary">April 15th</strong>, so we can have an accurate headcount. 
            The sooner the better though! :)
          </FAQItem>

          <FAQItem icon={Heart} question="Can I bring a date?">
            Please check your invite for your +1! Let us know if we missed someone important.
          </FAQItem>

          <FAQItem icon={CloudSun} question="What will the weather be like?">
            Welcome to the Ardennes! It can be unpredictable. Expect sunshine, maybe a few raindrops, and cooler evenings. Bring a warm layer and you’ll be ready for anything.
          </FAQItem>

          <FAQItem icon={Flower2} question="Is the wedding indoors or outdoors?">
            Our wedding ceremony is outdoors (if the weather allows). Later in the evening, the party will continue indoors.
          </FAQItem>

          <FAQItem icon={Car} question="Where should I park?">
            There is no parking at the domaine, but there is plenty of parking nearby. See the{" "}
            <button 
              onClick={() => scrollToSection('travel')} 
              className="text-primary underline hover:text-primary/80 font-semibold"
            >
              Travel section
            </button>{" "}
            for details.
          </FAQItem>

          <FAQItem icon={Gift} question="What can I get as a gift?">
            Your presence is the nicest gift we could ask for. If you’d like to give a little extra, a contribution to our honeymoon fund would make us very happy.
          </FAQItem>
        </FAQGrid>
      </Section>

      {/* --- RSVP SECTION --- */}
      <Section 
        id="rsvp" 
        dividerGap="lg" 
        contentBottomPadding="xl"
        title="RSVP"
        icon={Users}
      >        
        <RsvpModule />
        
      </Section>

      <Footer />
    </div>
  );
};

export default HomePage;