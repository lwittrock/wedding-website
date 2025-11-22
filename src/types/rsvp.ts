// src/types/rsvp.ts

export interface Guest {
  id: string;
  group_id: string;
  full_name: string;
  is_attending: boolean | null;
  dietary_preferences: string | null;
}

export interface GuestGroup {
  id: string;
  name_search: string;
  accommodation_choice: string | null;
  weekend_duration: string | null;
  song_request: string | null;
  guests: Guest[]; // Array of guests linked to this group
}

// Type used when fetching group data from Supabase before guests are attached
export type GroupData = Omit<GuestGroup, 'guests'>;