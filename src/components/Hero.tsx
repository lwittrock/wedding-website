import { MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-between pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/venue-painting.png"
          alt="Venue watercolor"
          className="w-full h-full object-cover object-center opacity-90"
          style={{ maxHeight: "100vh" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/20 via-transparent to-[#FAF7F2]"></div>
      </div>

      {/* Top text */}
      <div className="relative z-10 w-full px-4 pt-6 sm:pt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl mb-4 text-[#cc5500] font-parisienne">
            Jenna & Lars
          </h1>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#427161] font-alice">
            Wedding Weekend
          </h2>
        </div>
      </div>

      {/* Bottom text */}
      <div className="relative z-10 w-full px-4 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xl sm:text-2xl mb-6 text-[#494949] font-alice font-semibold">
            26 - 28 June 2026
          </div>

          <div className="flex items-center justify-center gap-2 text-[#427161] mb-3 font-alice">
            <MapPin size={20} />
            <span className="text-base sm:text-lg">Domaine Des Officiers</span>
          </div>

          <div className="text-[#427161] text-sm sm:text-base font-alice">
            Vielsalm, Belgian Ardennes
          </div>
        </div>
      </div>
    </section>
  );
}
