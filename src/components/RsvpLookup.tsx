import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Search, Loader2, Users } from 'lucide-react';
import type { GuestGroup, GroupData } from '../types/rsvp'; // Correct type-only import

// Define the required props for this component
interface RsvpLookupProps {
  onGroupFound: (group: GuestGroup) => void;
}

const RsvpLookup: React.FC<RsvpLookupProps> = ({ onGroupFound }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundGroups, setFoundGroups] = useState<GuestGroup[]>([]);

  const handleSearch = async () => {
    setError(null);
    setFoundGroups([]);
    const searchName = name.trim();

    if (searchName.length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      // -----------------------------------------------------
      // STEP 1: Search the guests table for the full name
      // -----------------------------------------------------
      const { data: guestMatch, error: guestError } = await supabase
        .from('guests')
        .select('group_id')
        .ilike('full_name', `%${searchName}%`);
      
      if (guestError) throw guestError;

      // Extract unique Group IDs found via guest names
      const guestGroupIds = guestMatch.map(g => g.group_id);

      // -----------------------------------------------------
      // STEP 2: Search the groups table by name_search (Party Name)
      // -----------------------------------------------------
      const { data: groupMatch, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .ilike('name_search', `%${searchName}%`);
        
      if (groupError) throw groupError;

      // Extract unique Group IDs found via group name
      const partyGroupIds = groupMatch.map(g => g.id);

      // -----------------------------------------------------
      // STEP 3: Combine all unique Group IDs
      // -----------------------------------------------------
      const allUniqueGroupIds = Array.from(new Set([...partyGroupIds, ...guestGroupIds]));

      if (allUniqueGroupIds.length === 0) {
        setError("We couldn't find an invitation for that name. Please try your full first or last name.");
        setLoading(false);
        return;
      }

      // -----------------------------------------------------
      // STEP 4: Fetch the complete Group records for all matching IDs
      // -----------------------------------------------------
      const { data: finalGroupData, error: finalGroupError } = await supabase
        .from('groups')
        .select('*')
        .in('id', allUniqueGroupIds);

      if (finalGroupError) throw finalGroupError;

      // -----------------------------------------------------
      // STEP 5: Fetch all linked guests for the found groups
      // -----------------------------------------------------
      const groupsWithGuests: GuestGroup[] = await Promise.all(
        finalGroupData.map(async (group: GroupData) => { 
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .select('*')
            .eq('group_id', group.id);

          if (guestError) throw guestError;

          // Combine group data with the array of linked guests
          return { ...group, guests: guestData || [] } as GuestGroup;
        })
      );
      
      setFoundGroups(groupsWithGuests);
      
    } catch (err) { // Fixed ESLint 'any' error
      console.error(err);
      setError('An error occurred during lookup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group: GuestGroup) => {
    onGroupFound(group);
  };

  // --- JSX RENDER ---
  return (
    <div className="max-w-xl mx-auto p-6 bg-white/50 rounded-lg shadow-lg border border-secondary/20">
      <h3 className="text-2xl font-parisienne text-primary mb-6 text-center">
        Find Your Invitation
      </h3>

      {/* Search Input */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your first or last name"
          className="flex-grow p-3 border border-secondary/50 rounded-md focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition font-alice"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          className="bg-secondary hover:bg-secondary/90 text-white font-alice px-6 py-3 rounded-md transition disabled:opacity-60 flex items-center"
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
        <p className="text-red-600 text-sm mb-4 text-center border border-red-200 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      {/* Group Selection */}
      {foundGroups.length > 0 && (
        <div className="mt-6">
          <p className="text-secondary font-semibold mb-3 flex items-center gap-2">
            <Users size={20} />Choose your party:
          </p>
          <div className="space-y-3">
            {foundGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className="w-full text-left p-4 border border-secondary/30 rounded-md bg-white hover:bg-background transition shadow-sm"
              >
                <span className="font-semibold text-neutral">
                  The {group.name_search} Party
                </span>
                <span className="block text-xs text-secondary/80">
                  (Includes: {group.guests.map(g => g.full_name.split(' ')[0]).join(', ')})
                </span>
              </button>
            ))}
            {foundGroups.length > 1 && (
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