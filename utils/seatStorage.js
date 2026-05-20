// Temporary seat reservation storage
let reservedSeats = [];

export const seatStorage = {
  // Add a seat to reserved list
  reserveSeat: (seatNumber) => {
    if (!reservedSeats.includes(seatNumber)) {
      reservedSeats.push(seatNumber);
    }
  },

  // Remove a seat from reserved list
  releaseSeat: (seatNumber) => {
    reservedSeats = reservedSeats.filter(s => s !== seatNumber);
  },

  // Check if seat is reserved
  isReserved: (seatNumber) => {
    return reservedSeats.includes(seatNumber);
  },

  // Get all reserved seats
  getReservedSeats: () => {
    return [...reservedSeats];
  },

  // Clear all reservations
  clearReservations: () => {
    reservedSeats = [];
  },

  // Reserve multiple seats
  reserveSeats: (seatNumbers) => {
    seatNumbers.forEach(seat => {
      if (!reservedSeats.includes(seat)) {
        reservedSeats.push(seat);
      }
    });
  },
};
