/**
 * API utilities for the Event Announcement System
 */

// Replace with your actual API Gateway URL when deployed
const API_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod';

/**
 * Subscribe a user to event notifications
 * @param {string} email - The user's email address
 * @returns {Promise} - Promise object representing the subscription result
 */
async function subscribeUser(email) {
  try {
    const response = await fetch(`${API_URL}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error subscribing user:', error);
    throw error;
  }
}

/**
 * Get all events
 * @returns {Promise} - Promise object representing the events
 */
async function getEvents() {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Create a new event
 * @param {Object} eventData - The event data
 * @returns {Promise} - Promise object representing the created event
 */
async function createEvent(eventData) {
  try {
    const response = await fetch(`${API_URL}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
} 