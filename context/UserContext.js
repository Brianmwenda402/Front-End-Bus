import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

const DEFAULT_USER = {
  fullName: 'Brian Mwenda',
  email: 'brian@transitx.zm',
  phone: '+260 97 000 0000',
  nrc: '000000/00/0',
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null, // 'User' or 'Admin'
    userId: null,
    loginTime: null,
    email: null,
  });
  const [tickets, setTickets] = useState([
    {
      id: 'demo-1',
      status: 'Confirmed',
      schedule: {
        busName: 'UBZ',
        from: 'Lusaka',
        to: 'Ndola',
        date: '16/05/2026',
        depart: '6:30 AM',
        seatNumbers: ['2A', '2B'],
        pricePerSeat: 190,
      },
      passengers: [{ fullName: 'Brian Mwenda', nrc: '000000/00/0' }],
      totalAmount: 380,
    },
  ]);

  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }));
  }, []);

  const login = useCallback((userData, role = 'User', userId = null) => {
    const newAuthState = {
      isAuthenticated: true,
      userRole: role,
      userId: userId,
      loginTime: new Date().toISOString(),
      email: userData.email,
    };
    setAuthState(newAuthState);
    setUser(userData);
    return newAuthState;
  }, []);

  const register = useCallback((userData, role = 'User', userId = null) => {
    const newAuthState = {
      isAuthenticated: true,
      userRole: role,
      userId: userId,
      loginTime: new Date().toISOString(),
      email: userData.email,
    };
    setAuthState(newAuthState);
    setUser(userData);
    return newAuthState;
  }, []);

  const addTicket = useCallback((ticket) => {
    const entry = {
      id: `ticket-${Date.now()}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      ...ticket,
    };
    setTickets(prev => [entry, ...prev]);
    return entry;
  }, []);

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userId: null,
      loginTime: null,
      email: null,
    });
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: updateUser, 
      authState,
      login,
      register,
      tickets, 
      addTicket, 
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
