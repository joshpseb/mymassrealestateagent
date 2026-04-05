import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { createProperty, getAuthToken, removeAuthToken } from './services/api';
import { Property } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Modal } from './components/Modal';
import { AddPropertyForm } from './components/AddPropertyForm';
import { AuthModal } from './components/AuthModal';
import { RegisterAgentModal } from './components/RegisterAgentModal';

import { HomePage } from './pages/HomePage';
import { NewsPage } from './pages/NewsPage';

function App() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterAgentModal, setShowRegisterAgentModal] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminName(payload.username);
      } catch (e) {
        setAdminName('Admin');
      }
    }
  }, []);

  const handleAddProperty = async (newProperty: Property) => {
    try {
      await createProperty(newProperty);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setShowAddPropertyModal(false);
    } catch (e: any) {
      alert(`Failed to add property: ${e.message}`);
      console.error(e);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setAdminName(null);
  };

  const handleAuthSuccess = (username: string) => {
    setIsAuthenticated(true);
    setAdminName(username);
    setShowAuthModal(false);
  };

  return (
    <>
      <Header 
        isAuthenticated={isAuthenticated}
        onAddPropertyClick={() => setShowAddPropertyModal(true)}
        onAddAgentClick={() => setShowRegisterAgentModal(true)}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <Footer 
        isAuthenticated={isAuthenticated}
        adminName={adminName}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={handleLogout}
      />
      
      <AnimatePresence>
        {showRegisterAgentModal && (
          <RegisterAgentModal onClose={() => setShowRegisterAgentModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPropertyModal && (
          <Modal title="Add New Property" onClose={() => setShowAddPropertyModal(false)}>
            <AddPropertyForm onAddProperty={handleAddProperty} onClose={() => setShowAddPropertyModal(false)} />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;