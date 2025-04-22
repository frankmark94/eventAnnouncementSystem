/**
 * Main JavaScript for the Event Announcement System
 */

// DOM Elements
const subscribeForm = document.getElementById('subscribe-form');
const eventForm = document.getElementById('event-form');
const eventsContainer = document.getElementById('events-container');
const successMessage = document.querySelector('.success-message');
const errorMessage = document.querySelector('.error-message');

/**
 * Show a success message
 * @param {string} message - The message to display
 */
function showSuccess(message) {
  if (successMessage) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 5000);
  }
}

/**
 * Show an error message
 * @param {string} message - The message to display
 */
function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }
}

/**
 * Format date to a readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Create an event card element
 * @param {Object} event - Event data
 * @returns {HTMLElement} - The event card element
 */
function createEventCard(event) {
  const card = document.createElement('div');
  card.className = 'event-card';
  
  card.innerHTML = `
    <div class="event-card-header">
      <h3>${event.title}</h3>
    </div>
    <div class="event-card-body">
      <p>${event.description}</p>
      <p class="event-date">Date: ${formatDate(event.date)}</p>
      <p>Location: ${event.location}</p>
    </div>
    <div class="event-card-footer">
      <p>Created by: ${event.organizer}</p>
    </div>
  `;
  
  return card;
}

/**
 * Load events and display them
 */
async function loadEvents() {
  if (!eventsContainer) return;
  
  try {
    eventsContainer.innerHTML = '<p>Loading events...</p>';
    const events = await getEvents();
    
    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No events found.</p>';
      return;
    }
    
    eventsContainer.innerHTML = '';
    events.forEach(event => {
      const eventCard = createEventCard(event);
      eventsContainer.appendChild(eventCard);
    });
  } catch (error) {
    console.error('Error loading events:', error);
    eventsContainer.innerHTML = '<p>Error loading events. Please try again later.</p>';
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load events if on the events page
  if (window.location.pathname.includes('events.html')) {
    loadEvents();
  }
  
  // Handle subscription form submission
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();
      
      if (!email) {
        showError('Please enter your email address.');
        return;
      }
      
      try {
        const result = await subscribeUser(email);
        showSuccess('Successfully subscribed to event notifications!');
        emailInput.value = '';
      } catch (error) {
        showError('Failed to subscribe. Please try again later.');
      }
    });
  }
  
  // Handle event form submission
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const titleInput = document.getElementById('title');
      const descriptionInput = document.getElementById('description');
      const dateInput = document.getElementById('date');
      const locationInput = document.getElementById('location');
      const organizerInput = document.getElementById('organizer');
      
      const eventData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        date: dateInput.value,
        location: locationInput.value.trim(),
        organizer: organizerInput.value.trim()
      };
      
      if (!eventData.title || !eventData.description || !eventData.date || !eventData.location) {
        showError('Please fill in all required fields.');
        return;
      }
      
      try {
        const result = await createEvent(eventData);
        showSuccess('Event created successfully!');
        eventForm.reset();
      } catch (error) {
        showError('Failed to create event. Please try again later.');
      }
    });
  }
}); 