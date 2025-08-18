// Minimal helper to open an .ics download or add to Google Calendar
// Usage:
// AddToCalendar(campaign) - accepts a campaign object with title, description, startDate/endDate or campaignDate
// or AddToCalendar(title, details, startIso, location)
const AddToCalendar = (a, b, c, d) => {
  try {
    let title, details, location, startIso, endIso;
    if (typeof a === 'object' && a !== null) {
      const campaign = a;
      title = encodeURIComponent(campaign.title || 'Campaign');
      details = encodeURIComponent(campaign.description || '');
      location = encodeURIComponent(campaign.location?.address || campaign.location?.city || '');
      startIso = campaign.campaignDate || campaign.startDate || '';
      endIso = campaign.endDate || '';
    } else {
      title = encodeURIComponent(a || 'Campaign');
      details = encodeURIComponent(b || '');
      startIso = c || '';
      location = encodeURIComponent(d || '');
      endIso = '';
    }

    if (!startIso) {
      // No start date: can't create calendar event
      return;
    }

    const toGoogle = (iso) => {
      try { return new Date(iso).toISOString().replace(/-|:|\.\d{3}Z/g, ''); } catch(e){ return ''; }
    };

    const start = toGoogle(startIso);
    const end = toGoogle(endIso) || start;

    if (start) {
      const gStart = start.slice(0, 15);
      const gEnd = end ? end.slice(0, 15) : gStart;
      const href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${gStart}/${gEnd}&details=${details}&location=${location}`;
      window.open(href, '_blank');
      return;
    }

  } catch (e) {
    // noop
  }
};

export default AddToCalendar;


