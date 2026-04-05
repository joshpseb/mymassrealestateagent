interface FooterProps {
  isAuthenticated: boolean;
  adminName: string | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Footer = ({ isAuthenticated, adminName, onLoginClick, onLogoutClick }: FooterProps) => {
  return (
    <footer className="mt-auto py-12 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-slate-400 mb-6 font-medium">
          &copy; {new Date().getFullYear()} MyMassRealEstateAgent. All rights reserved.
        </p>
        
        <div>
          {isAuthenticated ? (
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs text-slate-400 font-medium">
                Logged in as <strong className="text-slate-700">{adminName}</strong>
              </span>
              <button 
                onClick={onLogoutClick} 
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:shadow hover:bg-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="text-xs font-medium text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
            >
              Agent Portal
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
