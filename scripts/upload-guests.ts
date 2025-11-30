import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env.local file (same as Vite uses)
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVGuest {
  full_name: string;
  party_name: string;
  invitation_type: 'weekend' | 'friday';
}

interface DBGuest {
  id: string;
  full_name: string;
  party_name: string;
  invitation_type: 'weekend' | 'friday';
  is_attending: boolean | null;
  dietary_preferences: string | null;
  song_request: string | null;
  accommodation_choice: string | null;
  weekend_duration: string | null;
  additional_message: string | null;
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function uploadGuests() {
  console.log('🚀 Starting guest list upload...\n');

  // 1. Read CSV file
  const csvPath = path.join(__dirname, '../data/guestlist.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Error: guestlist.csv not found in data/ folder');
    console.log('Please create data/guestlist.csv with columns: full_name, party_name, invitation_type');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // 2. Parse CSV
  const parsed = Papa.parse<CSVGuest>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    console.error('❌ CSV parsing errors:', parsed.errors);
    process.exit(1);
  }

  // 3. Get existing guests from database to preserve their RSVP data
  const { data: existingGuests, error: fetchError } = await supabase
    .from('guests')
    .select('*');

  if (fetchError) {
    console.error('❌ Error fetching existing guests:', fetchError);
    process.exit(1);
  }

  // Create a map using full_name + party_name as key
  const existingGuestsMap = new Map<string, DBGuest>(
    (existingGuests as DBGuest[]).map(g => [
      `${g.full_name.toLowerCase()}|${g.party_name.toLowerCase()}`, 
      g
    ])
  );

  // 4. Prepare guest data
  const guests: Partial<DBGuest>[] = parsed.data.map(row => {
    const key = `${row.full_name.trim().toLowerCase()}|${row.party_name.trim().toLowerCase()}`;
    const existingGuest = existingGuestsMap.get(key);
    
    // For existing guests: keep their ID and RSVP data, only update invitation fields
    // For new guests: let Supabase generate ID, set RSVP fields to null
    const guest: Partial<DBGuest> = {
      full_name: row.full_name?.trim(),
      party_name: row.party_name?.trim(),
      invitation_type: row.invitation_type?.trim() as 'weekend' | 'friday',
      // Preserve existing RSVP data or set to null for new guests
      is_attending: existingGuest?.is_attending ?? null,
      dietary_preferences: existingGuest?.dietary_preferences ?? null,
      song_request: existingGuest?.song_request ?? null,
      accommodation_choice: existingGuest?.accommodation_choice ?? null,
      weekend_duration: existingGuest?.weekend_duration ?? null,
      additional_message: existingGuest?.additional_message ?? null,
    };
    
    // Include ID only if exists
    if (existingGuest?.id) {
      guest.id = existingGuest.id;
    }
    
    return guest;
  });

  // 5. Validate required fields
  const invalidGuests = guests.filter(g => 
    !g.full_name || !g.party_name || !g.invitation_type
  );

  if (invalidGuests.length > 0) {
    console.error('❌ Invalid guest records (missing required fields):');
    console.error(invalidGuests);
    console.log('\nRequired fields: full_name, party_name, invitation_type');
    process.exit(1);
  }

  // 6. Check for invalid invitation_type values
  const invalidTypes = guests.filter(g => 
    g.invitation_type !== 'weekend' && g.invitation_type !== 'friday'
  );

  if (invalidTypes.length > 0) {
    console.error('❌ Invalid invitation_type values (must be "weekend" or "friday"):');
    console.error(invalidTypes.map(g => ({ id: g.id, name: g.full_name, type: g.invitation_type })));
    process.exit(1);
  }

  // 7. Check for guests in DB but not in CSV (potential removals)
  const csvGuestKeys = new Set(
    guests.map(g => `${g.full_name!.toLowerCase()}|${g.party_name!.toLowerCase()}`)
  );
  const removedGuests = (existingGuests as DBGuest[]).filter(g => {
    const key = `${g.full_name.toLowerCase()}|${g.party_name.toLowerCase()}`;
    return !csvGuestKeys.has(key);
  });

  console.log(`📊 Summary:`);
  console.log(`   Total guests in CSV: ${guests.length}`);
  console.log(`   New guests: ${guests.filter(g => !g.id).length}`);
  console.log(`   Existing guests (will preserve RSVP data): ${guests.filter(g => g.id).length}`);
  console.log(`   Weekend invites: ${guests.filter(g => g.invitation_type === 'weekend').length}`);
  console.log(`   Friday invites: ${guests.filter(g => g.invitation_type === 'friday').length}`);
  
  if (removedGuests.length > 0) {
    console.log(`\n⚠️  Warning: ${removedGuests.length} guests are in the database but NOT in your CSV:`);
    removedGuests.forEach(g => {
      const rsvpStatus = g.is_attending === null ? 'No response' : 
                         g.is_attending ? 'Accepted' : 'Declined';
      console.log(`   - ${g.full_name} (${g.party_name}) - ${rsvpStatus}`);
    });
    console.log('   These guests will NOT be removed. To remove them, delete manually from Supabase.\n');
  }

  // 8. Upload to Supabase
  console.log('\n📤 Uploading to Supabase...');

  // For updates, we need to upsert with ID; for new guests, insert without ID
  const guestsWithId = guests.filter(g => g.id);
  const guestsWithoutId = guests.filter(g => !g.id);

  // Update existing guests
  if (guestsWithId.length > 0) {
    const { error: updateError } = await supabase
      .from('guests')
      .upsert(guestsWithId, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (updateError) {
      console.error('❌ Error updating existing guests:', updateError);
      process.exit(1);
    }
  }

  // Insert new guests
  if (guestsWithoutId.length > 0) {
    const { error: insertError } = await supabase
      .from('guests')
      .insert(guestsWithoutId);

    if (insertError) {
      console.error('❌ Error inserting new guests:', insertError);
      process.exit(1);
    }
  }

  console.log('✅ Successfully uploaded all guests!');
  console.log('\n💡 Tip: Existing guests\' RSVP responses have been preserved.');
}

uploadGuests().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});