import CONFIG from '../config/config';

const API_BASE_URL = `${CONFIG.API_BASE_URL}/api`;

const parseErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error || data?.message || `Request failed with status ${response.status}`;
  } catch (error) {
    return `Request failed with status ${response.status}`;
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const bookingsApi = {
  getTripSeatsStatus: (tripId) => request(`/bookings/trip/${tripId}/seats`),
  createBooking: (payload) =>
    request('/bookings/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default {
  bookingsApi,
};
