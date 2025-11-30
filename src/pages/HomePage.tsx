import React, { useState } from "react";

// Components
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Section from "../components/Section";
import Footer from "../components/Footer";
import ImageModal from "../components/ImageModal";
import InfoCard from "../components/InfoCard";

import ScheduleTimeline from "../components/ScheduleTimeline";
import ScheduleItem from "../components/ScheduleItem";
import FAQGrid from "../components/FAQGrid";
import FAQItem from "../components/FAQItem";
import RsvpTimingGame from "../components/RsvpTimingGame";
import RsvpModule from '../components/RsvpModule';
import FloatingRSVP from "../components/FloatingRSVP";
import PhotoDownload from "../components/PhotoDownload";
import PhotoUpload from "../components/PhotoUpload";

// Hooks and Constants
import { useScrollSpy } from "../hooks/useScrollSpy";
import { SECTIONS } from "../constants/sections";
import { CONFIG } from "../constants/config";

// Icons
import { 
  Calendar, MapPin, HelpCircle, CalendarCheck, 
  Plane, Train, CarFront, Info,
  CalendarClock, BedDouble, Shirt, Heart, CloudSun, 
  Flower2, Car, Gift, TreePine, Bath, Home, Map, Camera,
  Binoculars
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
            <p>
              From 13.00 onward we are ready to welcome you at the Domaine! 
              We'll tell you where to find your room, and you'll have time to drop your bags and get ready. 
              If you don't need that much time, a cold drink will be waiting for you.
            </p>
          </ScheduleItem>

          <ScheduleItem title="Wedding Time!" dateTime="Friday, June 26th, 15.30">
            <p>
              Find yourself a seat and get ready to celebrate! 
              The ceremony starts at 16.00, so make sure not to miss it. 
              We'll continue the celebrations with dinner, drinks, and dancing.
            </p>
          </ScheduleItem>

          <ScheduleItem title="Relax at the Domaine or Explore the Ardennes" dateTime="Saturday, June 27th, the morning after...">
            <p className="mb-3">
              Breakfast / brunch / lunch is at whatever time you feel ready to leave your bedroom! 
            </p>
            <p className="mb-3">
              For the outdoor enthusiasts, the Ardennes offer lots of possibilities for 
              museums & history, hikes or cycling - see the "Explore the Ardennes" section. 
            </p>
            <p>
              For the relaxation enthusiasts, we plan on hanging out at the Domaine throughout the day; 
              tennis, football, or jeu de boules and a sauna await you.
            </p>
          </ScheduleItem>

          <ScheduleItem title="Barbecue & Bonfire" dateTime="Saturday, June 27th, 16.00">
            <p>
              If the weather treats us well, we'll be turning on the grill for a chill dinner. 
              If the weather does not treat us well, we'll still be turning on the grill for a chill dinner. 
            </p>
          </ScheduleItem>

          <ScheduleItem title="Breakfast & Departure" dateTime="Sunday, June 28th, 10.00" isLast>
            <p>
              One last breakfast together before we say goodbye.
            </p>
          </ScheduleItem>
        </ScheduleTimeline>
      </Section>

      {/* --- TRAVEL --- */}
      <Section id="travel" dividerGap="lg" contentBottomPadding="lg" title="Travel to the venue" icon={MapPin}>
        {/* Venue Details */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-parisienne text-primary mb-2">Domaine Des Officiers</h3>
          <p className="text-lg mb-4">Rue du Général Jacques 9, 6690 Vielsalm, Belgium</p>
          <div className="flex justify-center gap-4 mb-6">
            <button 
              onClick={() => openModal('venue-photo.jpg', 'The Venue')} 
              className="text-sm border border-secondary text-secondary px-4 py-2 rounded hover:bg-secondary hover:text-white transition-colors"
            >
              View Location
            </button>
            <button 
              onClick={() => openModal('entrance-photo.jpg', 'The Entrance')} 
              className="text-sm border border-secondary text-secondary px-4 py-2 rounded hover:bg-secondary hover:text-white transition-colors"
            >
              View Entrance
            </button>
          </div>
          <div className="bg-secondary/5 p-4 rounded-lg inline-block max-w-2xl mx-auto border border-secondary/20">
            <div className="flex items-start gap-3 text-left">
              <Info className="text-primary shrink-0 mt-1" size={20} />
              <p className="text-sm italic">
                You don't directly see the Domaine from the street. Enter on foot where the flag is!
              </p>
            </div>
          </div>
        </div>

        {/* Travel Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard icon={Plane} title="By Plane">
            <p><strong>Brussels (BRU)</strong> is a great option. The airport is well connected to Vielsalm by train</p>
            <p className="text-xs opacity-80">Other options: Charleroi (CRL), Eindhoven (EIN), Düsseldorf (DUS), Bonn/Cologne (CGN).</p>
          </InfoCard>

          <InfoCard icon={Train} title="By Train">
            <p className="mb-3"><strong>Vielsalm Train Station</strong> is a ~15 minute walk from the venue {" "}
             <a 
              href={CONFIG.TRAVEL_LINKS.TRAIN_STATION}
              className="text-primary underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              (map)
              </a>
            .
            </p>
            <p>Need help with your bags? Let us know!</p>
          </InfoCard>

          <InfoCard icon={CarFront} title="By Car">
            <p><strong>Parking</strong> in Vielsalm is easy and free.</p>
            <ul className="text-left inline-block list-disc pl-4 space-y-1">
              <li>
                <a 
                  href={CONFIG.TRAVEL_LINKS.PARKING_MAIN}
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Public parking lot (5 min walk)
                </a>
              </li>
              <li>
                <a 
                  href={CONFIG.TRAVEL_LINKS.PARKING_CHURCH}
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  At the church (5 min walk)
                </a>
              </li>
              <li>Street parking is easy too.</li>
            </ul>
          </InfoCard>
        </div>
      </Section>

      {/* --- EXPLORE THE ARDENNES --- */}
      <Section id="ardennes" dividerGap="lg" contentBottomPadding="lg" title="Explore the Ardennes" icon={Binoculars}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard icon={Home} title="Vielsalm">
            <p>Don't want to go far away? Vielsalm offers some great options:</p>
            <ul className="text-left inline-block list-disc pl-4 space-y-1 mt-2">
              <li>
                Lakeside walk - A nice and casual stroll with pretty views
              </li>
              <li>
                Maison Du Pays de Salm - A museum on the people and legends of the region
              </li>
              <li>
                Vielsalm is a touristy town with cute cafes, shops and restaurants to explore (do make reservations for dinner)
              </li>
            </ul>
          </InfoCard>

          <InfoCard icon={TreePine} title="Explore the Region">
            <p>The Ardennes are known for the beautiful nature, perfect for hikes and biking:</p>
            <ul className="text-left inline-block list-disc pl-4 space-y-1 mt-2">
              <li>
                <a 
                  href="https://www.visitardenne.com/en/best-ardennes/discover-our-top-10/top-walks-and-hikes" 
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Hiking
                </a>
                {" "}- Nice routes for walks & hikes 
              </li>
              <li>
                <a 
                  href="https://www.ardennes.com/en/itineraries/cycling-in-the-ardennes/" 
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Biking
                </a>
                {" "}- Cycling routes 
              </li>
              <li>
                <a 
                  href="https://chouffe.com/en-gb/" 
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Beer
                </a>
                {" "}- The Ardennes are home to some great beers like La Chouffe, Lupulus, and many more
              </li>
              <li>
                <a 
                  href="https://www.spa-francorchamps.be/nl/" 
                  className="text-primary underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Racing
                </a>
                {" "}- You can drive the Circuit de Spa-Francorchamps yourself! 
              </li>
            </ul>
          </InfoCard>

          <InfoCard icon={Map} title="Also Nearby"> 
            <p>Within a couple hours of driving are:</p>
            <ul className="text-left inline-block list-disc pl-4 space-y-1 mt-2">
              <li><strong>Maastricht </strong>
               - 1.5 hour (cobblestones, gezelligheid, and a very good place for meeting the love of your life)
              </li>
              <li><strong>The Champagne Region</strong>
               - 2.5 hours (visit the champagne houses and vineyards in Reims / Epernay)
              </li>
              <li><strong>Tilburg</strong>
               - 2.5 hours (visit the Barretts / the Efteling)
              </li>
              <li><strong>Paris</strong>
               - 4 hours (croissants, baguettes, and more)
              </li>
            </ul>
          </InfoCard>
        </div>
      </Section>

      {/* --- FAQ --- */}
      <Section id="faq" dividerGap="lg" contentBottomPadding="lg" title="Frequently Asked Questions" icon={HelpCircle}>
        <FAQGrid>
          <FAQItem icon={BedDouble} question="What type of accommodation can I expect?">
            <p className="mb-2">
              We've made sure all guests will have a comfortable room{" "}
              <button 
                onClick={() => openModal('venue-room.jpg', 'Example Room at the Venue')} 
                className="text-primary underline hover:text-primary/80"
              >
                (see example)
              </button>{" "}
              for Friday and Saturday night, either at the Domaine or in a nearby Gîte a 5-minute walk away. 
              All costs are covered by us.
            </p>
            <p className="mb-2">
              There are different types of rooms (2, 3, and 4 beds), 
              we will ask some of you to share a room with others to have space for everyone.
            </p>
            <p>
              If you'd rather arrange your own place to stay, that is perfectly fine! 
              Please let us know as soon as possible.
            </p>
          </FAQItem>

          <FAQItem icon={Shirt} question="What should I wear?">
            <p className="mb-3">
              <strong className="text-primary">Friday (Fancy & Festive): </strong> 
              We'd love to see you looking your best! 
              Think long or cocktail dresses, jumpsuits, tuxedos, suits, or whatever makes you feel fabulous. 
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
            Please RSVP by <strong className="text-primary">{CONFIG.DATES.RSVP_DEADLINE}</strong>, 
            so we can have an accurate headcount. The sooner the better though! :)
          </FAQItem>

          <FAQItem icon={Heart} question="Can I bring a date?">
            Please check your invite for your +1! Let us know if we missed someone important.
          </FAQItem>

          <FAQItem icon={TreePine} question="Why the Ardennes?">
            <p>
            We don't really know what the deciding factor was; choose your favorite:
            </p>
            <ul className="text-left inline-block list-disc pl-4 space-y-1 mt-2">
                <li>It's in between Germany and the Netherlands</li>
                <li>Belgian beers and waffles</li>
                <li>It's close to Maastricht</li>
                <li>The beautiful scenery and spacious venue</li>
                <li>Did we already mention belgian beers?</li>
            </ul>
          </FAQItem>

          <FAQItem icon={Bath} question="What should I really not forget to bring?">
            <p>
              There is a wellness area with a sauna and jacuzzi free for all guests to use. 
              Bring your swimwear and a large towel if you want to use these.
            </p>
          </FAQItem>

          <FAQItem icon={CloudSun} question="What will the weather be like?">
            Welcome to the Ardennes! It can be unpredictable. 
            Expect sunshine, maybe a few raindrops, and cooler evenings. 
            Bring a warm layer and you'll be ready for anything.
          </FAQItem>

          <FAQItem icon={Flower2} question="Is the wedding indoors or outdoors?">
            Our wedding ceremony is outdoors (if the weather allows). 
            Later in the evening, the party will continue indoors.
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
            Your presence is the nicest gift we could ask for. 
            If you'd like to give a little extra, 
            a contribution to our honeymoon fund would make us very happy.
          </FAQItem>
        </FAQGrid>
      </Section>

      {/* --- RSVP SECTION --- */}
      <Section 
        id="rsvp" 
        dividerGap="lg" 
        contentBottomPadding="lg"
        title="RSVP"
        icon={CalendarCheck}
      > 
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-8 leading-relaxed">
            You want to join the celebration? Please let us know by filling out the RSVP form below. 
            The final deadline is <strong className="text-primary">{CONFIG.DATES.RSVP_DEADLINE}</strong>!
          </p>   
          <RsvpTimingGame />
          <RsvpModule />    
        </div>
        
      </Section>

      {/* --- PHOTOS SECTION --- */}
      <Section 
        id="photos" 
        dividerGap="lg" 
        contentBottomPadding="xl"
        title="Photos"
        icon={Camera}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-8 leading-relaxed">
            Our photographer will capture the official moments, 
            but we'd love to see your perspective too! 
            Share your photos and help us relive the weekend through your eyes.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      
            {/* Left Column: Photo Download (done) */}
            <div className="flex flex-col items-center">
              <PhotoDownload />
            </div>

            {/* Right Column: Photo Upload (work in progress) */}
            <div className="flex flex-col items-center">
              <PhotoUpload />
            </div>

          </div>
        </div>
      </Section>

      <FloatingRSVP scrollToSection={scrollToSection} />

      <Footer />
    </div>
  );
};

export default HomePage;