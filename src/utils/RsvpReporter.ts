import { supabase } from './supabase';

/**
 * Runs a complex JOIN query on the 'groups' and 'guests' tables
 * and prints a clean, comprehensive summary of the RSVP data to the console.
 *
 * This effectively runs the same logic as the 'rsvp_summary' database VIEW.
 */
export async function generateRsvpReport() {
  console.log('--- GENERATING RSVP REPORT (Production Data) ---');

  try {
    // This query joins the guests table with the groups table on group_id = id
    // and selects specific fields for a comprehensive report.
    const { data, error } = await supabase
      .from('guests')
      .select(`
        full_name,
        is_attending,
        dietary_preferences,
        groups (
          name_search,
          accommodation_choice,
          weekend_duration,
          song_request
        )
      `)
      .order('groups.name_search', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No RSVP data found in the database.');
      return;
    }

    // 1. Process and Flatten the Data for the Console Table
    const reportData = data.map(guest => {
      // Supabase returns the joined data under the object name 'groups'
      const group = Array.isArray(guest.groups) ? guest.groups[0] : guest.groups;
      
      return {
        'Party Name': group.name_search,
        'Guest Name': guest.full_name,
        'Attending': guest.is_attending ? '✅ YES' : '❌ NO',
        'Dietary': guest.dietary_preferences || 'None specified',
        'Accommodation': group.accommodation_choice,
        'Duration': group.weekend_duration,
        'Song': group.song_request || 'None requested',
      };
    });

    // 2. Calculate Attendee Totals
    const attendingCount = reportData.filter(r => r.Attending === '✅ YES').length;
    const totalInvited = reportData.length;
    
    // 3. Print the Summary Table to the Console
    console.table(reportData);

    // 4. Print Summary Statistics
    console.log(`--- SUMMARY ---`);
    console.log(`Total Guests Invited: ${totalInvited}`);
    console.log(`Total Confirmed Attendees: ${attendingCount}`);
    console.log(`Attendance Rate: ${((attendingCount / totalInvited) * 100).toFixed(1)}%`);
    
    // Filter out specific notes for quick reference
    const dietaryNotes = reportData
      .filter(r => r.Dietary !== 'None specified' && r.Dietary !== null)
      .map(r => ({ Name: r['Guest Name'], Note: r.Dietary }));

    if (dietaryNotes.length > 0) {
      console.log('\n--- DIETARY / SPECIAL NOTES ---');
      console.table(dietaryNotes);
    }
    
  } catch (err) {
    console.error('Error fetching RSVP report:', err);
    console.log('Please ensure your Supabase permissions (RLS) allow SELECT access on both the "groups" and "guests" tables for your current access token (anon key).');
  }
}