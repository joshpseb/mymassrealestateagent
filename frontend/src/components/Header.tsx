import { NavLink } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isAuthenticated: boolean;
  onAddPropertyClick: () => void;
  onAddAgentClick: () => void;
}

export const Header = ({
  isAuthenticated,
  onAddPropertyClick,
  onAddAgentClick
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary/10 p-2 rounded-xl">
              <Building2 className="w-6 h-6 text-brand-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight">
              MyMass<span className="text-brand-primary">RealEstateAgent</span>
            </span>
          </div>

          <nav className="hidden md:flex gap-8 h-full items-center">
            <NavLink
              to="/"
              className={({ isActive }) => `text-sm font-semibold transition-all hover:text-brand-primary relative h-full flex items-center ${isActive ? 'text-brand-primary' : 'text-slate-500'}`}
            >
              {({ isActive }) => (
                <>
                  For Sale
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
                </>
              )}
            </NavLink>
            <NavLink
              to="/news"
              className={({ isActive }) => `text-sm font-semibold transition-all hover:text-brand-primary relative h-full flex items-center ${isActive ? 'text-brand-primary' : 'text-slate-500'}`}
            >
              {({ isActive }) => (
                <>
                  Market News
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
                </>
              )}
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `text-sm font-semibold transition-all hover:text-brand-primary relative h-full flex items-center ${isActive ? 'text-brand-primary' : 'text-slate-500'}`}
            >
              {({ isActive }) => (
                <>
                  About
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
                </>
              )}
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/inquiries"
                className={({ isActive }) => `text-sm font-semibold transition-all hover:text-brand-primary relative h-full flex items-center ${isActive ? 'text-brand-primary' : 'text-slate-500'}`}
              >
                {({ isActive }) => (
                  <>
                    Inquiries
                    {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />}
                  </>
                )}
              </NavLink>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <>
                <button
                  onClick={onAddAgentClick}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 cursor-pointer"
                >
                  + Add Agent
                </button>
                <button
                  onClick={onAddPropertyClick}
                  className="text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  + Add Property
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-slate-200 bg-white text-slate-600"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <NavLink to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 font-medium">
            For Sale
          </NavLink>
          <NavLink to="/news" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 font-medium">
            Market News
          </NavLink>
          <NavLink to="/about" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 font-medium">
            About
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/inquiries" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 font-medium">
              Inquiries
            </NavLink>
          )}
          {isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onAddPropertyClick();
                }}
                className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg text-left cursor-pointer"
              >
                + Add Property
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onAddAgentClick();
                }}
                className="text-sm font-semibold text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-left cursor-pointer"
              >
                + Add Agent
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};