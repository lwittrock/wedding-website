import React, { useState } from 'react';
import RsvpLookup from './RsvpLookup';
import RsvpForm from './RsvpForm';
import { CheckCircle } from 'lucide-react'; // <-- FIX: Missing CheckCircle import
import type { GuestGroup } from '../types/rsvp'; // <-- FIX: Type-only import

type RsvpStep = 'lookup' | 'form' | 'confirmation';

const RsvpModule: React.FC = () => {
  const [step, setStep] = useState<RsvpStep>('lookup');
  const [group, setGroup] = useState<GuestGroup | null>(null);

  const handleGroupFound = (foundGroup: GuestGroup) => {
    setGroup(foundGroup);
    setStep('form');
  };

  const handleSuccess = () => {
    setStep('confirmation');
  };

  // --- JSX RENDER ---
  return (
    <div className="w-full">
      {step === 'lookup' && <RsvpLookup onGroupFound={handleGroupFound} />}

      {step === 'form' && group && (
        <RsvpForm initialGroup={group} onSuccess={handleSuccess} />
      )}

      {step === 'confirmation' && (
        <div className="max-w-xl mx-auto p-8 bg-white/50 rounded-lg shadow-xl border border-secondary/20 text-center">
          <CheckCircle size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-parisienne text-primary mb-2">
            Thank You, {group?.name_search} Party!
          </h3>
          <p className="text-lg text-neutral mb-6">
            Your RSVP has been confirmed. We can't wait to celebrate with you!
          </p>
          <button
            onClick={() => {
              setStep('lookup'); // Allow user to search again
              setGroup(null); // Clear group state
            }}
            className="text-sm border border-secondary text-secondary px-4 py-2 rounded hover:bg-secondary hover:text-white transition-colors"
          >
            Start a new search
          </button>
        </div>
      )}
    </div>
  );
};

export default RsvpModule;