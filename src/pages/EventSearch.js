import React, { useState } from 'react';
import axios from 'axios';

function EventSearch() {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const [location, setLocation] = useState('');
  const [events, setEvents] = useState([]);

  const searchEvents = async () => {
    const response = await axios.get(`${apiBaseUrl}/events?location=${location}`);
    setEvents(response.data);
  };

  return (
    <div>
      <h2>Search Events</h2>
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
      <button onClick={searchEvents}>Search</button>
      <ul>
        {events.map(event => (
          <li key={event.eventId}>{event.title} - {event.time}</li>
        ))}
      </ul>
    </div>
  );
}

export default EventSearch;