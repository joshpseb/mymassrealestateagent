interface HeaderProps {
    activeView: string;
    setActiveView: (view: string) => void;
    isAdmin: boolean;
    onAdminLogin: () => void;
    onAdminLogout: () => void;
    onAddPropertyClick: () => void;
  }
  
  export const Header = ({ 
    activeView, 
    setActiveView, 
    isAdmin, 
    onAdminLogin, 
    onAdminLogout, 
    onAddPropertyClick 
  }: HeaderProps) => (
    <header>
      <div className="logo">MyMassRealEstateAgent</div>
      <nav>
        <ul>
          <li>
            <button 
              onClick={() => setActiveView('sale')} 
              className={activeView === 'sale' ? 'active' : ''}
            >
              For Sale
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveView('news')} 
              className={activeView === 'news' ? 'active' : ''}
            >
              Real Estate News
            </button>
          </li>
        </ul>
      </nav>
      <div className="admin-controls">
        {isAdmin ? (
          <>
            <button onClick={onAddPropertyClick} className="admin-button">
              Add Property
            </button>
            <button onClick={onAdminLogout} className="admin-button secondary">
              Logout
            </button>
          </>
        ) : (
          <button onClick={onAdminLogin} className="admin-button">
            Admin Login
          </button>
        )}
      </div>
    </header>
  );