/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Type} from '@google/genai';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';

// Interfaces for our data structures
interface Property {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string;
}

interface Article {
  title: string;
  summary: string;
  date: string;
  imageUrl: string;
}

// Initial property data - no longer fetched from Gemini
const initialProperties: Property[] = [
    {
        "address": "123 Beacon St, Boston, MA",
        "price": 1200000,
        "bedrooms": 2,
        "bathrooms": 2.5,
        "sqft": 1500,
        "description": "Stunning condo in the heart of Beacon Hill with panoramic city views. Recently renovated with high-end finishes.",
        "imageUrl": "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
        "address": "45 Maple Ave, Worcester, MA",
        "price": 450000,
        "bedrooms": 4,
        "bathrooms": 2,
        "sqft": 2200,
        "description": "Spacious single-family home with a large backyard, perfect for a growing family. Close to parks and schools.",
        "imageUrl": "https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
        "address": "78 Ocean Blvd, Revere, MA",
        "price": 650000,
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 1800,
        "description": "Beautiful beachfront property with direct access to Revere Beach. Enjoy stunning ocean views from every room.",
        "imageUrl": "https://images.pexels.com/photos/164558/pexels-photo-164558.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
     {
        "address": "90 University Ave, Cambridge, MA",
        "price": 950000,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "sqft": 1700,
        "description": "Modern townhouse near Harvard Square. Features an open-concept living area and a private rooftop deck.",
        "imageUrl": "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
];


const newsSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The headline of the news article." },
        summary: { type: Type.STRING, description: "A one-paragraph summary of the article." },
        date: { type: Type.STRING, description: "The publication date in 'Month Day, Year' format." },
        imageUrl: { type: Type.STRING, description: "A URL for a relevant stock photo." },
      },
      required: ["title", "summary", "date", "imageUrl"],
    },
};


function App() {
  const [activeView, setActiveView] = useState('sale'); // 'sale' or 'news'
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

        const newsResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Generate a list of 4 recent, fictional but realistic real estate news articles relevant to the Massachusetts market.',
          config: {
            responseMimeType: "application/json",
            responseSchema: newsSchema,
          },
        });
        
        const newsData = JSON.parse(newsResponse.text);
        setNews(newsData);

      } catch (e) {
        console.error(e);
        setError("Failed to fetch news from the Gemini API. Please check your API key and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);
  
  const handleAddProperty = (newProperty: Property) => {
    setProperties([newProperty, ...properties]);
    setShowAddPropertyModal(false);
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
        {loading && activeView === 'news' && <LoadingSpinner />}
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

const Header = ({ activeView, setActiveView, isAdmin, onAdminLogin, onAdminLogout, onAddPropertyClick }) => (
  <header>
    <div className="logo">MyMassRealEstateAgent</div>
    <nav>
      <ul>
        <li><button onClick={() => setActiveView('sale')} className={activeView === 'sale' ? 'active' : ''}>For Sale</button></li>
        <li><button onClick={() => setActiveView('news')} className={activeView === 'news' ? 'active' : ''}>Real Estate News</button></li>
      </ul>
    </nav>
    <div className="admin-controls">
        {isAdmin ? (
            <>
                <button onClick={onAddPropertyClick} className="admin-button">Add Property</button>
                <button onClick={onAdminLogout} className="admin-button secondary">Logout</button>
            </>
        ) : (
            <button onClick={onAdminLogin} className="admin-button">Admin Login</button>
        )}
    </div>
  </header>
);

const PropertyListings = ({ properties }) => (
  <section className="listings-container">
    <h2>Properties for Sale in Massachusetts</h2>
    <div className="property-grid">
      {properties.map((prop, index) => (
        <PropertyCard key={index} property={prop} />
      ))}
    </div>
  </section>
);

const PropertyCard = ({ property }) => (
  <article className="property-card">
    <div className="property-image" style={{ backgroundImage: `url(${property.imageUrl})` }}>
      <div className="property-price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(property.price)}</div>
    </div>
    <div className="property-details">
      <div className="property-specs">
        <span><strong>{property.bedrooms}</strong> bed</span>
        <span className="spec-divider">|</span>
        <span><strong>{property.bathrooms}</strong> bath</span>
        <span className="spec-divider">|</span>
        <span><strong>{property.sqft.toLocaleString()}</strong> sqft</span>
      </div>
      <p className="property-address">{property.address}</p>
      <p className="property-description">{property.description}</p>
    </div>
  </article>
);

const NewsSection = ({ articles, isLoading }) => (
  <section className="news-container">
    <h2>Massachusetts Real Estate News</h2>
    {isLoading ? null : (
      <div className="news-list">
        {articles.map((article, index) => (
          <NewsArticle key={index} article={article} />
        ))}
      </div>
    )}
  </section>
);


const NewsArticle = ({ article }) => (
  <article className="news-article-card">
    <div className="news-image" style={{ backgroundImage: `url(${article.imageUrl})` }}></div>
    <div className="news-content">
      <h3>{article.title}</h3>
      <p className="news-date">{article.date}</p>
      <p className="news-summary">{article.summary}</p>
    </div>
  </article>
);

const Modal = ({ title, onClose, children }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h2>{title}</h2>
                <button onClick={onClose} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
                {children}
            </div>
        </div>
    </div>
);

const AddPropertyForm = ({ onAddProperty, onClose }) => {
    const [formData, setFormData] = useState({
        address: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        description: '',
        imageUrl: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newProperty = {
            ...formData,
            price: parseInt(formData.price, 10),
            bedrooms: parseInt(formData.bedrooms, 10),
            bathrooms: parseFloat(formData.bathrooms),
            sqft: parseInt(formData.sqft, 10),
        };
        // Basic validation
        if (Object.values(newProperty).some(val => val === '' || isNaN(val as number))) {
            alert('Please fill out all fields correctly.');
            return;
        }
        onAddProperty(newProperty);
    };

    return (
        <form onSubmit={handleSubmit} className="add-property-form">
            <div className="form-group">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="form-group-row">
                <div className="form-group">
                    <label htmlFor="price">Price (USD)</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="sqft">Sqft</label>
                    <input type="number" id="sqft" name="sqft" value={formData.sqft} onChange={handleChange} required />
                </div>
            </div>
             <div className="form-group-row">
                <div className="form-group">
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="bathrooms">Bathrooms</label>
                    <input type="number" step="0.5" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} required />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required></textarea>
            </div>
            <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Property</button>
            </div>
        </form>
    );
};


const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Generating latest real estate news...</p>
  </div>
);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);