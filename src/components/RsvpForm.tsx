import React, { useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, CheckCircle, Gift, BedDouble, CalendarCheck } from 'lucide-react';
import type { PartyGroup, Guest } from '../types/rsvp';

interface RsvpFormProps {
  initialParty: PartyGroup;
  onSuccess: (isAttending: boolean) => void;
}

const RsvpForm: React.FC<RsvpFormProps> = ({ initialParty, onSuccess }) => {
  // --- Individual Guest State ---
  const [guests, setGuests] = useState<Guest[]>(initialParty.guests);

  // --- Party Level State (from first guest since they're duplicated) ---
  const [accommodation, setAccommodation] = useState(initialParty.guests[0]?.accommodation_choice || '');
  const [duration, setDuration] = useState(initialParty.guests[0]?.weekend_duration || '');
  const [song, setSong] = useState(initialParty.guests[0]?.song_request || '');

  // --- Form State ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state: is anyone in the group attending?
  const isAnyoneAttending = useMemo(() => {
    return guests.some(g => g.is_attending === true);
  }, [guests]);

  // Handlers
  const handleAttendanceChange = (guestId: string, attending: boolean) => {
    setGuests(prevGuests =>
      prevGuests.map(g =>
        g.id === guestId ? { ...g, is_attending: attending } : g
      )
    );
  };

  const handleDietaryChange = (guestId: string, value: string) => {
    setGuests(prevGuests =>
      prevGuests.map(g =>
        g.id === guestId ? { ...g, dietary_preferences: value } : g
      )
    );
  };

  // --- Submission Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Validate if at least one choice was made
    if (guests.some(g => g.is_attending === null)) {
      setError('Please confirm attendance (Accept/Decline) for all members of your party.');
      setLoading(false);
      return;
    }

    try {
      // 2. Prepare Guest Data for Upsert (Insert/Update)
      // For each guest, include their personal info AND the shared party-level fields
      const guestUpdates = guests.map(g => ({
        id: g.id,
        full_name: g.full_name,
        party_name: g.party_name,
        is_attending: g.is_attending,
        dietary_preferences: g.dietary_preferences,
        song_request: song, // Duplicated across all party members
        accommodation_choice: isAnyoneAttending ? accommodation : null, // Duplicated
        weekend_duration: isAnyoneAttending ? duration : null, // Duplicated
      }));
      
      // Upsert: Updates existing guests with all their data
      const { error: guestError } = await supabase
        .from('guests')
        .upsert(guestUpdates);

      if (guestError) throw guestError;

      // 3. Success!
      onSuccess(isAnyoneAttending);

    } catch (err) {
      console.error('Submission Error:', err);
      setError('A network error occurred. Please try again or contact the couple.');
    } finally {
      setLoading(false);
    }
  };

  // --- JSX RENDER ---
  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/50 rounded-lg shadow-lg border border-secondary/20 max-w-2xl mx-auto">
      <h3 className="text-2xl font-parisienne text-primary mb-6 text-center">
        The {initialParty.party_name} Party RSVP
      </h3>

      {/* --- 1. ATTENDANCE (PER GUEST) --- */}
      <h4 className="text-xl font-parisienne text-secondary border-b border-secondary/30 pb-2 mb-4">
        1. Attendance
      </h4>
      <div className="space-y-4 mb-8">
        {guests.map((guest) => (
          <div key={guest.id} className="p-4 border border-neutral/20 rounded-md bg-white/70">
            <p className="font-semibold text-neutral mb-2">{guest.full_name}</p>
            
            {/* Accept / Decline Radios */}
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={`attending-${guest.id}`}
                  checked={guest.is_attending === true}
                  onChange={() => handleAttendanceChange(guest.id, true)}
                  className="form-radio text-primary"
                />
                Joyfully Accept
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={`attending-${guest.id}`}
                  checked={guest.is_attending === false}
                  onChange={() => handleAttendanceChange(guest.id, false)}
                  className="form-radio text-primary"
                />
                Regretfully Decline
              </label>
            </div>
            
            {/* Dietary Preference (Only if Accepting) */}
            {guest.is_attending === true && (
              <div className="mt-3">
                <label htmlFor={`dietary-${guest.id}`} className="block text-sm text-neutral/80 mb-1">
                  Dietary preferences/Allergies/Anything else we need to be aware of:
                </label>
                <textarea
                  id={`dietary-${guest.id}`}
                  value={guest.dietary_preferences || ''}
                  onChange={(e) => handleDietaryChange(guest.id, e.target.value)}
                  placeholder="e.g. Vegetarian, nut allergy, I've had bad experiences with Belgian beers, etc."
                  rows={2}
                  className="w-full p-2 border border-neutral/30 rounded-md text-sm font-alice"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* --- 2. LOGISTICS (CONDITIONAL ON ATTENDANCE) --- */}
      {isAnyoneAttending && (
        <>
          <h4 className="text-xl font-parisienne text-secondary border-b border-secondary/30 pb-2 mb-4">
            2. Logistics
          </h4>

          {/* Accommodation */}
          <div className="mb-6 p-4 border border-secondary/20 rounded-md bg-white/70">
            <p className="font-semibold text-neutral mb-2 flex items-center gap-2">
              <BedDouble size={18} className="text-primary"/> 
              Accommodation
            </p>
            <p className='text-sm text-neutral/80 mb-3'>Will you be staying with us or taking care of your own accommodation?</p>
            <div className="flex flex-col gap-2 text-sm">
              <label className='cursor-pointer'>
                <input
                  type="radio"
                  name="accommodation"
                  value="Staying with us"
                  checked={accommodation === 'Staying with us'}
                  onChange={(e) => setAccommodation(e.target.value)}
                  className="form-radio text-primary"
                  required={isAnyoneAttending}
                /> 
                <span className='ml-2'>I/we'd love to stay at the Domaine/Gîte (costs covered)</span>
              </label>
              <label className='cursor-pointer'>
                <input
                  type="radio"
                  name="accommodation"
                  value="Booking own"
                  checked={accommodation === 'Booking own'}
                  onChange={(e) => setAccommodation(e.target.value)}
                  className="form-radio text-primary"
                  required={isAnyoneAttending}
                />
                <span className='ml-2'>I/we will arrange our own place to stay</span>
              </label>
            </div>
          </div>
          
          {/* Duration */}
          <div className="mb-8 p-4 border border-secondary/20 rounded-md bg-white/70">
            <p className="font-semibold text-neutral mb-2 flex items-center gap-2">
              <CalendarCheck size={18} className="text-primary"/> 
              Full Weekend?
            </p>
            <p className='text-sm text-neutral/80 mb-3'>Will you be joining the full weekend (Friday until Sunday)?</p>
            <div className="flex flex-col gap-2 text-sm">
              <label className='cursor-pointer'>
                <input
                  type="radio"
                  name="duration"
                  value="Full Weekend"
                  checked={duration === 'Full Weekend'}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-radio text-primary"
                  required={isAnyoneAttending}
                /> 
                <span className='ml-2'>Yes, I/we'll be there for the full weekend (Fri-Sun)</span>
              </label>
              <label className='cursor-pointer'>
                <input
                  type="radio"
                  name="duration"
                  value="Friday Only"
                  checked={duration === 'Friday Only'}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-radio text-primary"
                  required={isAnyoneAttending}
                />
                <span className='ml-2'>Friday Only (Ceremony & Party)</span>
              </label>
              <label className='cursor-pointer'>
                <input
                  type="radio"
                  name="duration"
                  value="Other"
                  checked={duration === 'Other'}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-radio text-primary"
                  required={isAnyoneAttending}
                />
                <span className='ml-2'>Other (Please specify in the comments/dietary field)</span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* --- 3. MUSIC (ONLY IF ATTENDING) --- */}
      {isAnyoneAttending && (
        <>
          <h4 className="text-xl font-parisienne text-secondary border-b border-secondary/30 pb-2 mb-4">
            3. Other
          </h4>
          <div className="mb-8 p-4 border border-secondary/20 rounded-md bg-white/70">
            <p className="font-semibold text-neutral mb-2 flex items-center gap-2">
              <Gift size={18} className="text-primary"/> 
              Song Request
            </p>
            <label htmlFor="song" className="block text-sm text-neutral/80 mb-1">
              What music will guarantee you on the dancefloor? (Song Title & Artist)
            </label>
            <input
              id="song"
              type="text"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="e.g. Dancing Queen - ABBA"
              className="w-full p-2 border border-neutral/30 rounded-md text-sm font-alice"
            />
          </div>
        </>
      )}

      {/* --- SUBMIT & ERRORS --- */}
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center border border-red-200 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-primary hover:brightness-90 text-white px-8 py-3 rounded-md transition-all font-alice flex items-center justify-center disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin mr-2" />
        ) : (
          <CheckCircle size={24} className="mr-2" />
        )}
        {isAnyoneAttending ? 'Confirm RSVP' : 'Submit Response'}
      </button>
    </form>
  );
};

export default RsvpForm;