import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface PropertyListingsProps {
  properties: Property[];
}

export const PropertyListings = ({ properties }: PropertyListingsProps) => (
  <section className="listings-container">
    <h2>Properties for Sale in Massachusetts</h2>
    <div className="property-grid">
      {properties.map((prop, index) => (
        <PropertyCard key={prop._id || index} property={prop} />
      ))}
    </div>
  </section>
);