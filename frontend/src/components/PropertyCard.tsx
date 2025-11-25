import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => (
  <article className="property-card">
    <div className="property-image" style={{ backgroundImage: `url(${property.imageUrl})` }}>
      <div className="property-price">
        {new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD', 
          minimumFractionDigits: 0 
        }).format(property.price)}
      </div>
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