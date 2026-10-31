import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('supportdesk_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [devMode, setDevMode] = useState(() => {
    try {
      const stored = localStorage.getItem('supportdesk_devmode');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('supportdesk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('supportdesk_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('supportdesk_devmode', JSON.stringify(devMode));
  }, [devMode]);

  const loginAsAgent = (agent) => {
    const userData = {
      type: 'agent',
      id: agent._id,
      name: agent.name,
      email: agent.email,
      role: agent.role || 'agent',
    };
    setUser(userData);
  };

  const loginAsCustomer = (customer) => {
    const userData = {
      type: 'customer',
      id: customer._id,
      name: customer.name,
      email: customer.email,
      company: customer.company || '',
    };
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleDevMode = () => {
    setDevMode((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAgent: user?.type === 'agent',
        isCustomer: user?.type === 'customer',
        devMode,
        toggleDevMode,
        loginAsAgent,
        loginAsCustomer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
