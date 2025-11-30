import { MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative h-[100svh] flex flex-col pt-16">
      
      {/* Background Image & Gradient Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="venue-painting.png"
          alt="Venue watercolor"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background"></div>
      </div>
      
      {/* Top text */}
      <div className="relative z-10 w-full px-4 pt-6 sm:pt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl mb-4 text-primary font-parisienne">
            Jenna & Lars
          </h1>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl text-secondary font-alice">
            Wedding Weekend
          </h2>
        </div>
      </div>
      
      {/* Bottom text */}
      <div className="relative z-10 w-full px-4 flex-grow flex items-end pb-32 sm:pb-16 lg:pb-12">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="text-xl sm:text-2xl mb-6 text-neutral font-alice font-semibold">
            26 - 28 June 2026
          </div>
          <div className="flex items-center justify-center gap-2 text-secondary mb-3 font-alice">
            <MapPin size={20} />
            <span className="text-base sm:text-lg">Domaine Des Officiers</span>
          </div>
          <div className="text-secondary text-sm sm:text-base font-alice">
            Vielsalm, Belgian Ardennes
          </div>
        </div>
      </div>
    </section>
  );
}