import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Search, Loader2, Users } from 'lucide-react';

// Simplified types for single-table structure
interface Guest {
  id: string;
  full_name: string;
  party_name: string;
  is_attending: boolean | null;
  dietary_preferences?: string;
  song_request?: string;
  accommodation_choice?: string;
  weekend_duration?: string;
  created_at?: string;
  updated_at?: string;
}

interface PartyGroup {
  party_name: string;
  guests: Guest[];
}

interface RsvpLookupProps {
  onGroupFound: (party: PartyGroup) => void;
}

const RsvpLookup: React.FC<RsvpLookupProps> = ({ onGroupFound }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundParties, setFoundParties] = useState<PartyGroup[]>([]);

  const handleSearch = async () => {
    setError(null);
    setFoundParties([]);
    const searchName = name.trim();

    if (searchName.length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      
      const { data: allGuests, error: testError } = await supabase
      .from('guests')
      .select('*');
    
      console.log('ALL GUESTS (test):', allGuests);
      console.log('Test error:', testError);


      // Search for guests by full name
      const { data: nameMatches, error: nameError } = await supabase
        .from('guests')
        .select('*')
        .ilike('full_name', `%${searchName}%`);
      
      if (nameError) throw nameError;

      // Search for guests by party name
      const { data: partyMatches, error: partyError } = await supabase
        .from('guests')
        .select('*')
        .ilike('party_name', `%${searchName}%`);
      
      if (partyError) throw partyError;

      console.log('Search term:', searchName);
      console.log('Name matches:', nameMatches);
      console.log('Party matches:', partyMatches);

      // Combine results
      const allMatches = [...(nameMatches || []), ...(partyMatches || [])];
      
      if (allMatches.length === 0) {
        setError("We couldn't find an invitation for that name. Please try one full, first or last name. If that does not work, send us a message on WhatsApp!");
        setLoading(false);
        return;
      }

      // Get all unique party names from matching guests
      const uniquePartyNames = Array.from(
        new Set(allMatches.map(g => g.party_name))
      );

      // Fetch all guests for each party
      const { data: allPartyGuests, error: fetchError } = await supabase
        .from('guests')
        .select('*')
        .in('party_name', uniquePartyNames);

      if (fetchError) throw fetchError;

      // Group guests by party
      const parties: PartyGroup[] = uniquePartyNames.map(partyName => {
        const partyGuests = allPartyGuests.filter(g => g.party_name === partyName);
        return {
          party_name: partyName,
          guests: partyGuests
        };
      });

      setFoundParties(parties);
      
    } catch (err) {
      console.error(err);
      setError('An error occurred during lookup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParty = (party: PartyGroup) => {
    onGroupFound(party);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white/50 rounded-lg shadow-lg border border-secondary/20">
      <h3 className="text-2xl font-parisienne text-primary mb-6 text-center">
        Find Your Invitation
      </h3>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your first or last name"
          className="flex-1 min-w-0 p-3 border border-secondary/50 rounded-md focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition font-alice"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          className="bg-secondary hover:bg-secondary/90 text-white font-alice px-4 py-3 rounded-md transition disabled:opacity-60 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center border border-red-200 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}

      {/* Party Selection */}
      {foundParties.length > 0 && (
        <div className="mt-6">
          <p className="text-secondary font-semibold mb-3 flex items-center gap-2">
            <Users size={20} />Choose your party:
          </p>
          <div className="space-y-3">
            {foundParties.map((party) => (
              <button
                key={party.party_name}
                onClick={() => handleSelectParty(party)}
                className="w-full text-left p-4 border border-secondary/30 rounded-md bg-white hover:bg-background transition shadow-sm"
              >
                <span className="font-semibold text-neutral">
                  The {party.party_name}
                </span>
                <span className="block text-xs text-secondary/80">
                  (Includes: {party.guests.map(g => g.full_name.split(' ')[0]).join(', ')})
                </span>
              </button>
            ))}
            {foundParties.length > 1 && (
              <p className='text-xs text-neutral/70 italic text-center pt-2'>
                Can't find your name? Contact us directly.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RsvpLookup;