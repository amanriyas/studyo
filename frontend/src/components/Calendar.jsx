import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import api from "../api";


// Use the correct API URL based on environment
// const API_URL = process.env.NODE_ENV === 'production' 
//   ? '/api' 
//   : 'http://localhost:8002/api';

const API_URL = api;

const MyCalendar = ({ selectedDate, setSelectedDate }) => {
  const [events, setEvents] = useState({});
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurringRule, setRecurringRule] = useState("");
  const [eventDate, setEventDate] = useState(selectedDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventData, setEditEventData] = useState({});
  const [highContrastMode, setHighContrastMode] = useState(false);

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events from:", `${API_URL}events/`);
      const response = await axios.get(`${API_URL}events/`);
      console.log("API Response:", response.data);
      
      // Save the raw response for debugging
      setRawApiResponse(response.data);
      
      // Convert the array of events to the format needed by the calendar
      const eventsByDate = {};
      response.data.forEach(event => {
        // Extract date part from start_datetime
        const dateKey = event.start_datetime.split('T')[0];
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push({
          id: event.id,
          name: event.event_title,
          description: event.event_description,
          start: event.start_datetime,
          end: event.end_datetime,
          recurring_rule: event.recurring_rule,
          participants: event.participants,
          groups: event.groups
        });
      });
      
      setEvents(eventsByDate);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setEventDate(date);
  };

  const formatDateTime = (date, time) => {
    // Get the date components in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const [hours, minutes] = time.split(':');
    
    // Create a date string in the format that will preserve the exact date and time
    // Without timezone suffix since Django will treat times as-is with USE_TZ = False
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (eventName) {
      try {
        // Format the date string directly without using toISOString() to avoid timezone shifts
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        // Create start and end times based on user input
        const startDateTime = formatDateTime(eventDate, startTime);
        const endDateTime = formatDateTime(eventDate, endTime);
        
        console.log("Creating event with data:", {
          event_title: eventName,
          event_description: eventDescription,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          recurring_rule: recurringRule
        });
        
        // Create event in the backend using the Event model fields
        const response = await axios.post(`${API_URL}events/`, {
          event_title: eventName,
          event_description: eventDescription,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          recurring_rule: recurringRule
        });
        
        console.log("Created event:", response.data);
        
        // Update local state with the new event
        const newEvent = {
          id: response.data.id,
          name: response.data.event_title,
          description: response.data.event_description,
          start: response.data.start_datetime,
          end: response.data.end_datetime,
          recurring_rule: response.data.recurring_rule,
          participants: response.data.participants,
          groups: response.data.groups
        };
        
        setEvents(prev => ({
          ...prev,
          [dateKey]: [...(prev[dateKey] || []), newEvent]
        }));
        
        // Reset form fields
        setEventName("");
        setEventDescription("");
        setStartTime("09:00");
        setEndTime("10:00");
        setRecurringRule("");
        
        // Refresh events from the server to ensure we have the latest data
        fetchEvents();
      } catch (err) {
        console.error("Error creating event:", err.response ? err.response.data : err.message);
        alert("Failed to create event. Please check the console for details.");
      }
    }
  };

  const handleEventDelete = async (eventToDelete) => {
    try {
      console.log("Deleting event:", eventToDelete);
      
      // Delete event from the backend
      await axios.delete(`${API_URL}events/${eventToDelete.id}/`);
      
      console.log("Deleted event with ID:", eventToDelete.id);
      
      // Extract date from the event's start time
      const dateKey = eventToDelete.start.split('T')[0];
      
      // Update local state
      setEvents(prev => {
        const updatedEvents = prev[dateKey]?.filter(
          event => event.id !== eventToDelete.id
        );
        
        return updatedEvents && updatedEvents.length > 0
          ? { ...prev, [dateKey]: updatedEvents }
          : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== dateKey));
      });
      
      // Refresh events from the server to ensure IDs are properly reset
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err.response ? err.response.data : err.message);
      alert("Failed to delete event. Please check the console for details.");
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const closeEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const formatTimeFromISO = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      // Format the date directly without toISOString() to avoid timezone shifts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      return events[dateKey]?.length > 0 ? (
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full mt-1"></div>
        </div>
      ) : null;
    }
    return null;
  };

  // Format the date directly without toISOString() to avoid timezone shifts
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  const currentEvents = events[dateKey] || [];

  const startEditingEvent = (event) => {
    // Extract time from ISO datetime
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    const formatTimeForInput = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    // Set the event date to match the start date of the event being edited
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const day = startDate.getDate();
    const eventDateObj = new Date(year, month, day);
    setEventDate(eventDateObj);
    setSelectedDate(eventDateObj);
    
    setEditEventData({
      id: event.id,
      event_title: event.name,
      event_description: event.description || "",
      start_time: formatTimeForInput(startDate),
      end_time: formatTimeForInput(endDate),
      recurring_rule: event.recurring_rule || ""
    });
    
    // Make sure isEditing is set to true to show the edit form
    setIsEditing(true);
    setShowEventDetails(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create start and end times based on user input
      const startDateTime = formatDateTime(eventDate, editEventData.start_time);
      const endDateTime = formatDateTime(eventDate, editEventData.end_time);
      
      console.log("Updating event with data:", {
        id: editEventData.id,
        event_title: editEventData.event_title,
        event_description: editEventData.event_description,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        recurring_rule: editEventData.recurring_rule
      });
      
      // Update event in the backend
      const response = await axios.put(`${API_URL}events/${editEventData.id}/`, {
        event_title: editEventData.event_title,
        event_description: editEventData.event_description,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        recurring_rule: editEventData.recurring_rule
      });
      
      console.log("Updated event:", response.data);
      
      // Reset form and state
      cancelEditing();
      
      // Refresh events from the server
      fetchEvents();
    } catch (err) {
      console.error("Error updating event:", err.response ? err.response.data : err.message);
      alert("Failed to update event. Please check the console for details.");
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditEventData({});
  };

  return (
    <div className={`flex justify-center items-center min-h-screen mt-16 px-6 mx-auto w-5xl ${highContrastMode ? 'bg-black text-yellow-400' : ''}`}>
      <div className={`${highContrastMode ? 'bg-black' : 'bg-white'} rounded-xl shadow-lg w-full max-w-7xl p-8 border ${highContrastMode ? 'border-yellow-400' : 'border-green-300'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`${highContrastMode ? 'text-yellow-400' : 'text-green-700'} font-bold text-2xl text-center`}>
            📅 Event Calendar
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading events...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12">
            {/* Calendar Section */}
            <div className="flex-1">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
                className={`w-full shadow-md rounded-md border ${highContrastMode ? 'border-yellow-400' : 'border-green-400'}`}
              />
            </div>

            {/* Events Section */}
            <div className="flex-1">
              <div className={`bg-${highContrastMode ? 'black' : 'green-50'} p-5 rounded-md border ${highContrastMode ? 'border-yellow-400' : 'border-green-300'}`}>
                <h4 className={`${highContrastMode ? 'text-yellow-400' : 'text-green-700'} font-semibold text-lg`}>
                  Events on {selectedDate.toDateString()}:
                </h4>
                {currentEvents.length === 0 ? (
                  <p className={`text-${highContrastMode ? 'yellow-400' : 'gray-600'}`}>No events scheduled for this day</p>
                ) : (
                  <ul className="mt-2 text-green-800">
                    {currentEvents.map((event) => (
                      <li
                        key={event.id}
                        className={`flex justify-between items-center bg-${highContrastMode ? 'black' : 'white'} px-3 py-2 my-1 rounded-md shadow-sm border ${highContrastMode ? 'border-yellow-400' : 'border-green-200'}`}
                      >
                        <div className="flex-1 cursor-pointer" onClick={() => handleEventClick(event)}>
                          <div className="font-medium">{event.name}</div>
                          <div className={`text-xs text-${highContrastMode ? 'yellow-400' : 'gray-500'}`}>
                            {formatTimeFromISO(event.start)} - {formatTimeFromISO(event.end)}
                          </div>
                        </div>
                        <button
                          onClick={() => startEditingEvent(event)}
                          className={`text-white px-2 py-1 rounded text-sm hover:bg-${highContrastMode ? 'blue-600' : 'blue-600'} transition-all`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEventDelete(event)}
                          className={`text-white px-2 py-1 rounded text-sm hover:bg-${highContrastMode ? 'red-600' : 'red-600'} transition-all`}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Event Form */}
              <div className="mt-6">
                <h4 className={`${highContrastMode ? 'text-yellow-400' : 'text-green-700'} font-semibold text-lg`}>
                  {isEditing ? 'Edit Event' : 'Create an Event'}
                </h4>
                <form onSubmit={isEditing ? handleEditSubmit : handleEventSubmit} className="mt-2 space-y-3">
                  <div>
                    <label className={`block text-sm font-medium text-${highContrastMode ? 'yellow-400' : 'gray-700'}`}>Event Name</label>
                    <input
                      type="text"
                      value={isEditing ? editEventData.event_title : eventName}
                      onChange={(e) => isEditing ? setEditEventData(prev => ({ ...prev, event_title: e.target.value })) : setEventName(e.target.value)}
                      placeholder="Event Name"
                      required
                      className={`p-2 border border-${highContrastMode ? 'yellow-400' : 'green-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-${highContrastMode ? 'yellow-500' : 'green-500'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-${highContrastMode ? 'yellow-400' : 'gray-700'}`}>Description</label>
                    <textarea
                      value={isEditing ? editEventData.event_description : eventDescription}
                      onChange={(e) => isEditing ? setEditEventData(prev => ({ ...prev, event_description: e.target.value })) : setEventDescription(e.target.value)}
                      placeholder="Event Description"
                      className={`p-2 border border-${highContrastMode ? 'yellow-400' : 'green-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-${highContrastMode ? 'yellow-500' : 'green-500'}`}
                      rows="3"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium text-${highContrastMode ? 'yellow-400' : 'gray-700'}`}>Start Time</label>
                      <input
                        type="time"
                        value={isEditing ? editEventData.start_time : startTime}
                        onChange={(e) => isEditing ? setEditEventData(prev => ({ ...prev, start_time: e.target.value })) : setStartTime(e.target.value)}
                        className={`p-2 border border-${highContrastMode ? 'yellow-400' : 'green-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-${highContrastMode ? 'yellow-500' : 'green-500'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={`block text-sm font-medium text-${highContrastMode ? 'yellow-400' : 'gray-700'}`}>End Time</label>
                      <input
                        type="time"
                        value={isEditing ? editEventData.end_time : endTime}
                        onChange={(e) => isEditing ? setEditEventData(prev => ({ ...prev, end_time: e.target.value })) : setEndTime(e.target.value)}
                        className={`p-2 border border-${highContrastMode ? 'yellow-400' : 'green-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-${highContrastMode ? 'yellow-500' : 'green-500'}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-${highContrastMode ? 'yellow-400' : 'gray-700'}`}>Recurring Rule (optional)</label>
                    <select
                      value={isEditing ? editEventData.recurring_rule : recurringRule}
                      onChange={(e) => isEditing ? setEditEventData(prev => ({ ...prev, recurring_rule: e.target.value })) : setRecurringRule(e.target.value)}
                      className={`p-2 border border-${highContrastMode ? 'yellow-400' : 'green-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-${highContrastMode ? 'yellow-500' : 'green-500'}`}
                    >
                      <option value="">None</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className={`p-2 bg-${highContrastMode ? 'yellow-400' : 'green-600'} text-${highContrastMode ? 'black' : 'white'} rounded-md w-full hover:bg-${highContrastMode ? 'yellow-500' : 'green-700'} transition-all`}
                  >
                    {isEditing ? 'Update Event' : 'Add Event'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={cancelEditing}
                      className={`p-2 bg-${highContrastMode ? 'red-600' : 'red-600'} text-${highContrastMode ? 'black' : 'white'} rounded-md w-full hover:bg-${highContrastMode ? 'red-700' : 'red-700'} transition-all mt-2`}
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
        
      </div>
      
      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-${highContrastMode ? 'black' : 'white'} rounded-lg p-6 max-w-md w-full`}>
            <h3 className={`text-xl font-bold mb-4 ${highContrastMode ? 'text-yellow-400' : ''}`}>{selectedEvent.name}</h3>
            <div className="mb-4">
              <p className={`text-${highContrastMode ? 'yellow-400' : 'gray-600'} mb-2`}>
                <span className="font-medium">Time:</span> {formatTimeFromISO(selectedEvent.start)} - {formatTimeFromISO(selectedEvent.end)}
              </p>
              {selectedEvent.description && (
                <p className={`text-${highContrastMode ? 'yellow-400' : 'gray-600'} mb-2`}>
                  <span className="font-medium">Description:</span> {selectedEvent.description}
                </p>
              )}
              {selectedEvent.recurring_rule && (
                <p className={`text-${highContrastMode ? 'yellow-400' : 'gray-600'} mb-2`}>
                  <span className="font-medium">Recurring:</span> {selectedEvent.recurring_rule}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeEventDetails}
                className={`px-4 py-2 bg-${highContrastMode ? 'yellow-400' : 'green-600'} text-${highContrastMode ? 'black' : 'white'} rounded hover:bg-${highContrastMode ? 'yellow-500' : 'green-700'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
