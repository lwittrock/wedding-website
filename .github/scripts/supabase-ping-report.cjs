const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Determine if this is a ping or report run
const isPingRun = process.env.SCHEDULE_TYPE?.includes('*/5') || !process.env.SCHEDULE_TYPE;
const isReportRun = process.env.SCHEDULE_TYPE?.includes('* * 0') || !process.env.SCHEDULE_TYPE;

async function pingDatabase() {
  console.log('🏓 Pinging database to prevent inactivity...');
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database ping successful!');
    return true;
  } catch (error) {
    console.error('❌ Database ping failed:', error);
    return false;
  }
}

async function getWeeklyStats() {
  console.log('📊 Fetching weekly RSVP stats...');
  
  try {
    const { data: allGuests, error: allError } = await supabase
      .from('guests')
      .select('*');
    
    if (allError) throw allError;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentGuests, error: recentError } = await supabase
      .from('guests')
      .select('*')
      .gte('updated_at', sevenDaysAgo.toISOString());
    
    if (recentError) throw recentError;

    const totalGuests = allGuests.length;
    const totalAccepted = allGuests.filter(g => g.is_attending === true).length;
    const totalDeclined = allGuests.filter(g => g.is_attending === false).length;
    const totalPending = allGuests.filter(g => g.is_attending === null).length;

    const weeklyAccepted = recentGuests.filter(g => g.is_attending === true).length;
    const weeklyDeclined = recentGuests.filter(g => g.is_attending === false).length;

    const parties = [...new Set(allGuests.map(g => g.party_name))];
    const partiesAccepted = [...new Set(
      allGuests.filter(g => g.is_attending === true).map(g => g.party_name)
    )].length;
    const partiesPending = [...new Set(
      allGuests.filter(g => g.is_attending === null).map(g => g.party_name)
    )].length;

    return {
      totalGuests,
      totalAccepted,
      totalDeclined,
      totalPending,
      weeklyAccepted,
      weeklyDeclined,
      totalParties: parties.length,
      partiesAccepted,
      partiesPending,
      acceptanceRate: totalGuests > 0 ? Math.round((totalAccepted / totalGuests) * 100) : 0
    };
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error);
    throw error;
  }
}

async function sendWeeklyReport(stats) {
  console.log('📧 Sending weekly report email...');
  
  const { data: allGuests } = await supabase
    .from('guests')
    .select('*')
    .order('party_name', { ascending: true });
  
  const { data: recentGuests } = await supabase
    .from('guests')
    .select('*')
    .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const recentResponses = recentGuests
    .filter(g => g.is_attending !== null)
    .map(g => `<li>${g.full_name} (${g.party_name}) - ${g.is_attending ? '✅ Accepted' : '❌ Declined'}</li>`)
    .join('');

  const pendingParties = [...new Set(
    allGuests.filter(g => g.is_attending === null).map(g => g.party_name)
  )];

  const attendingGuests = allGuests.filter(g => g.is_attending === true);
  const stayingWithUs = attendingGuests.filter(g => g.accommodation_choice === 'Staying with us').length;
  const bookingOwn = attendingGuests.filter(g => g.accommodation_choice === 'Booking own').length;

  const fullWeekend = attendingGuests.filter(g => g.weekend_duration === 'Full Weekend').length;
  const fridayOnly = attendingGuests.filter(g => g.weekend_duration === 'Friday Only').length;
  const other = attendingGuests.filter(g => g.weekend_duration === 'Other').length;

  const songRequests = attendingGuests
    .filter(g => g.song_request && g.song_request.trim() !== '')
    .map(g => `<li>${g.song_request} <em>(${g.party_name})</em></li>`)
    .join('');

  const dietaryPrefs = attendingGuests
    .filter(g => g.dietary_preferences && g.dietary_preferences.trim() !== '')
    .map(g => `<li><strong>${g.full_name}:</strong> ${g.dietary_preferences}</li>`)
    .join('');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8B7355;">🎉 Weekly Wedding RSVP Report</h2>
      <p style="color: #666;">Report generated: ${new Date().toLocaleString('en-US', { 
        timeZone: 'Europe/Brussels',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>

      <hr style="border: 1px solid #ddd; margin: 20px 0;">
      
      <h3 style="color: #8B7355;">📈 This Week's Activity</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>${stats.weeklyAccepted}</strong> new acceptances | <strong>${stats.weeklyDeclined}</strong> new declines</p>
        ${recentResponses ? `<ul style="margin-top: 10px;">${recentResponses}</ul>` : '<p style="color: #999;">No new responses this week</p>'}
      </div>

      <h3 style="color: #8B7355;">📊 Total Guest Statistics</h3>
      <div style="background: #f0f8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <table style="width: 100%;">
          <tr>
            <td><strong>✅ Accepted:</strong></td>
            <td style="text-align: right;">${stats.totalAccepted} guests (${stats.acceptanceRate}%)</td>
          </tr>
          <tr>
            <td><strong>❌ Declined:</strong></td>
            <td style="text-align: right;">${stats.totalDeclined} guests</td>
          </tr>
          <tr>
            <td><strong>⏳ Pending:</strong></td>
            <td style="text-align: right;">${stats.totalPending} guests</td>
          </tr>
          <tr style="border-top: 2px solid #8B7355;">
            <td><strong>Total Invited:</strong></td>
            <td style="text-align: right;"><strong>${stats.totalGuests} guests</strong></td>
          </tr>
        </table>
      </div>

      <h3 style="color: #8B7355;">👥 Party Statistics</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Total Parties:</strong> ${stats.totalParties}</p>
        <p><strong>Confirmed:</strong> ${stats.partiesAccepted} parties</p>
        <p><strong>Pending:</strong> ${stats.partiesPending} parties</p>
        ${pendingParties.length > 0 ? `
          <p style="margin-top: 10px;"><strong>Still waiting to hear from:</strong></p>
          <ul>${pendingParties.map(p => `<li>${p}</li>`).join('')}</ul>
        ` : ''}
      </div>

      <h3 style="color: #8B7355;">🏠 Accommodation (Attending Guests)</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Staying with us:</strong> ${stayingWithUs} guests</p>
        <p><strong>Booking own:</strong> ${bookingOwn} guests</p>
      </div>

      <h3 style="color: #8B7355;">📅 Weekend Duration</h3>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Full Weekend:</strong> ${fullWeekend} guests</p>
        <p><strong>Friday Only:</strong> ${fridayOnly} guests</p>
        ${other > 0 ? `<p><strong>Other:</strong> ${other} guests</p>` : ''}
      </div>

      ${songRequests ? `
        <h3 style="color: #8B7355;">🎵 Song Requests</h3>
        <div style="background: #fff9f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <ul style="margin: 0;">${songRequests}</ul>
        </div>
      ` : ''}

      ${dietaryPrefs ? `
        <h3 style="color: #8B7355;">🍽️ Dietary Preferences & Notes</h3>
        <div style="background: #fff9f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <ul style="margin: 0;">${dietaryPrefs}</ul>
        </div>
      ` : ''}

      <hr style="border: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">
        This is an automated weekly report from your wedding website.
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: `💒 Wedding RSVP Report - Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    html: emailBody
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Supabase maintenance script...');
  console.log(`Running in ${isPingRun ? 'PING' : 'REPORT'} mode`);

  await pingDatabase();

  if (isReportRun || !process.env.SCHEDULE_TYPE) {
    const stats = await getWeeklyStats();
    await sendWeeklyReport(stats);
  }

  console.log('✨ Maintenance script completed!');
}

main().catch(console.error);
