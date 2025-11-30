// src/types/rsvp.ts
export interface Guest {
  id: string;
  full_name: string;
  party_name: string;
  invitation_type: 'weekend' | 'friday';
  is_attending: boolean | null;
  dietary_preferences?: string;
  song_request?: string;
  accommodation_choice?: string;
  weekend_duration?: string;
  additional_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartyGroup {
  party_name: string;
  guests: Guest[];
}