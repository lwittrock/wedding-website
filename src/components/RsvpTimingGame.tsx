import React, { useState } from 'react';
import { Sparkles, Clock, CalendarX } from 'lucide-react';

// Generate confetti data outside component to avoid purity issues
const generateConfetti = () => {
  return Array.from({ length: 50 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random(),
    color: ['#ff6b9d', '#c44569', '#ffa502', '#4bcffa', '#0fb9b1'][
      Math.floor(Math.random() * 5)
    ],
    rotation: Math.random() * 360,
  }));
};

const RsvpTimingGame: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // Use lazy initialization to generate confetti only once
  const [confettiPieces] = useState(generateConfetti);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    
    if (option === 'today') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const options = [
    {
      id: 'today',
      label: 'Today',
      icon: Sparkles,
      response: "Legend! The RSVP form is right below.",
      color: 'border-green-500 bg-green-50 text-green-700',
      hoverColor: 'hover:bg-green-100',
    },
    {
      id: 'soon',
      label: 'At some point (soon)',
      icon: Clock,
      response: "We appreciate the realistic reply. We're looking forward to hearing from you soon!",
      color: 'border-orange-400 bg-orange-50 text-orange-700',
      hoverColor: 'hover:bg-orange-100',
    },
    {
      id: 'lastminute',
      label: 'One day before the deadline',
      icon: CalendarX,
      response: "Please don't leave us hanging that long!",
      color: 'border-red-400 bg-red-50 text-red-700',
      hoverColor: 'hover:bg-red-100',
    },
  ];

  return (
    <div className="mb-12 relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: '-10px',
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mb-6">
        <p className="text-lg mb-6 leading-relaxed">
          But let's be honest - when are you <span className="italic">actually</span> going to RSVP?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-300
                  ${isSelected ? option.color : 'border-secondary/30 bg-white text-neutral hover:border-secondary/50'}
                  ${!isSelected && option.hoverColor}
                  ${isSelected && option.id === 'lastminute' ? 'animate-shake' : ''}
                  ${isSelected && option.id === 'soon' ? 'animate-gentle-bounce' : ''}
                `}
              >
                <Icon className="mx-auto mb-2" size={24} />
                <span className="font-medium text-sm">{option.label}</span>
                
                {isSelected && option.id === 'today' && (
                  <Sparkles className="absolute top-2 right-2 text-yellow-400 animate-pulse" size={20} />
                )}
              </button>
            );
          })}
        </div>

        {/* Response Message */}
        {selectedOption && (
          <div className="animate-fade-in">
            <p className="text-base leading-relaxed">
              {options.find(opt => opt.id === selectedOption)?.response}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-gentle-bounce {
          animation: gentle-bounce 1s ease-in-out 2;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RsvpTimingGame;