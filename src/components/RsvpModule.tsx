import React, { useState } from 'react';
import RsvpLookup from './RsvpLookup';
import RsvpForm from './RsvpForm';
import { CheckCircle, Heart, LockKeyhole } from 'lucide-react';
import type { PartyGroup } from '../types/rsvp';
import { CONFIG } from '../constants/config';

class RsvpErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('RSVP error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto p-8 bg-white/50 rounded-lg shadow-xl border border-secondary/20 text-center">
          <p className="text-neutral mb-2">Something went wrong with the RSVP form.</p>
          <p className="text-sm text-neutral/70">Please refresh the page and try again, or contact us directly.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

type RsvpStep = 'lookup' | 'form' | 'confirmation';

const RsvpModule: React.FC = () => {
  const [step, setStep] = useState<RsvpStep>('lookup');
  const [party, setParty] = useState<PartyGroup | null>(null);
  const [isAttending, setIsAttending] = useState(false);

  const handleGroupFound = (foundParty: PartyGroup) => {
    // Clean the party data before passing to form
    const cleanParty: PartyGroup = {
      ...foundParty,
      guests: foundParty.guests.map(guest => ({
        id: guest.id,
        full_name: guest.full_name,
        party_name: guest.party_name,
        invitation_type: guest.invitation_type,
        is_attending: null,
        dietary_preferences: undefined,
        accommodation_choice: undefined,
        weekend_duration: undefined,
        song_request: undefined,
        additional_message: undefined,
        created_at: guest.created_at,
        updated_at: guest.updated_at
      }))
    };
    setParty(cleanParty);
    setStep('form');
  };

  const handleSuccess = (attending: boolean) => {
    setIsAttending(attending);
    setStep('confirmation');
  };

  if (!CONFIG.RSVP.IS_OPEN) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm mx-auto">
        <div className="w-full px-8 py-4 rounded-md font-alice flex items-center justify-center gap-3 text-lg select-none bg-neutral/10 text-neutral/50 cursor-not-allowed border border-neutral/20">
          <LockKeyhole size={24} />
          <span>RSVP</span>
        </div>
        <p className="text-sm text-neutral/70 mt-3 text-center">
          The RSVP deadline has passed. Please send us a message if anything has changed.
        </p>
      </div>
    );
  }

  return (
    <div id="rsvp-module-container" className="w-full">
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

const RsvpModuleWithBoundary: React.FC = () => (
  <RsvpErrorBoundary>
    <RsvpModule />
  </RsvpErrorBoundary>
);

export default RsvpModuleWithBoundary;