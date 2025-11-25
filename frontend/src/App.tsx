import { useEffect, useState } from 'react';
import { getProperties, createProperty } from './services/api';
import { getNews } from './services/api';
import { Property, Article } from './types';
import { Header } from './components/Header';
import { PropertyListings } from './components/PropertyListings';
import { NewsSection } from './components/NewsSection';
import { Modal } from './components/Modal';
import { AddPropertyForm } from './components/AddPropertyForm';

function App() {
  const [activeView, setActiveView] = useState('sale');
  const [properties, setProperties] = useState<Property[]>([]);
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // Load properties from API on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProperties(1, 50);
        setProperties(data.properties || []);
      } catch (e) {
        console.error(e);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    loadProperties();
  }, []);

  // Load news from API when news view is active
  useEffect(() => {
    const fetchNewsData = async () => {
      if (activeView !== 'news') return;
      
      try {
        setLoading(true);
        setError(null);
        const newsData = await getNews();
        setNews(newsData);
      } catch (e) {
        console.error(e);
        setError("Failed to fetch news from the API.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, [activeView]);
  
  const handleAddProperty = async (newProperty: Property) => {
    try {
      const created = await createProperty(newProperty);
      setProperties([created, ...properties]);
      setShowAddPropertyModal(false);
    } catch (e) {
      alert('Failed to add property');
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView}
        isAdmin={isAdmin}
        onAdminLogin={() => setIsAdmin(true)}
        onAdminLogout={() => setIsAdmin(false)}
        onAddPropertyClick={() => setShowAddPropertyModal(true)}
      />
      <main>
        {error && <div className="error-message">{error}</div>}
        
        {activeView === 'sale' 
          ? <PropertyListings properties={properties} />
          : <NewsSection articles={news} isLoading={loading} />
        }
      </main>
      
      {showAddPropertyModal && (
        <Modal title="Add New Property" onClose={() => setShowAddPropertyModal(false)}>
          <AddPropertyForm onAddProperty={handleAddProperty} onClose={() => setShowAddPropertyModal(false)} />
        </Modal>
      )}
    </div>
  );
}

export default App;