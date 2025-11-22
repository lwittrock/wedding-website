import React, { useState } from 'react';
import RsvpLookup from './RsvpLookup';
import RsvpForm from './RsvpForm';
import { CheckCircle, Heart } from 'lucide-react';
import type { PartyGroup } from '../types/rsvp';

type RsvpStep = 'lookup' | 'form' | 'confirmation';

const RsvpModule: React.FC = () => {
  const [step, setStep] = useState<RsvpStep>('lookup');
  const [party, setParty] = useState<PartyGroup | null>(null);
  const [isAttending, setIsAttending] = useState(false);

  const handleGroupFound = (foundParty: PartyGroup) => {
    setParty(foundParty);
    setStep('form');
  };

  const handleSuccess = (attending: boolean) => {
    setIsAttending(attending);
    setStep('confirmation');
  };

  return (
    <div className="w-full">
      {step === 'lookup' && <RsvpLookup onGroupFound={handleGroupFound} />}
      
      {step === 'form' && party && (
        <RsvpForm initialParty={party} onSuccess={handleSuccess} />
      )}
      
      {step === 'confirmation' && party && (
        <div className="max-w-xl mx-auto p-8 bg-white/50 rounded-lg shadow-xl border border-secondary/20 text-center">
          {isAttending ? (
            <>
              <CheckCircle size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-parisienne text-primary mb-2">
                Thank You!
              </h3>
              <p className="text-lg text-neutral mb-6">
                Your RSVP has been confirmed. We can't wait to celebrate with you!
              </p>
            </>
          ) : (
            <>
              <Heart size={48} className="text-secondary mx-auto mb-4" />
              <h3 className="text-2xl font-parisienne text-secondary mb-2">
                Thank You for Letting Us Know
              </h3>
              <p className="text-lg text-neutral mb-6">
                We're sorry you can't make it, but we appreciate you taking the time to respond. You'll be missed!
              </p>
            </>
          )}
          <button
            onClick={() => {
              setStep('lookup');
              setParty(null);
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