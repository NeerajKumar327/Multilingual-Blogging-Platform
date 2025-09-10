import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/Auth/AuthPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import './i18n';

function App() {
  const { user, initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, []);

  if (!user) {
    return <AuthPage />;
  }

  return <Dashboard />;
}

export default App;