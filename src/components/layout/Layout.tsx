import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  BarChart3, 
  Calendar,
  RepeatIcon,
  Wallet, 
  TrendingUp, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/forecast', icon: <TrendingUp size={20} />, label: 'Forecast' },
    { path: '/persons', icon: <Users size={20} />, label: 'Personen' },
    { path: '/accounts', icon: <CreditCard size={20} />, label: 'Konten' },
    { path: '/transactions', icon: <BarChart3 size={20} />, label: 'Transaktionen' },
    { path: '/recurring', icon: <RepeatIcon size={20} />, label: 'Wiederkehrend' },
    { path: '/subscriptions', icon: <Calendar size={20} />, label: 'Abonnements' },
    { path: '/debts', icon: <Wallet size={20} />, label: 'Schulden' },
    { path: '/investments', icon: <TrendingUp size={20} />, label: 'Investitionen' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Einstellungen' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateAndCloseMenu = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-400">Familien Finanzen</h1>
        </div>
        <nav className="flex-1 pt-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-6 py-3 hover:bg-gray-100 transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary-400 font-medium bg-primary-50'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="mr-4">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">Familien Finanzen v1.0.0</p>
        </div>
      </aside>

      {/* Mobile Header and Menu */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between bg-white p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-400">Familien Finanzen</h1>
          <button onClick={toggleMobileMenu} className="text-gray-700">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white h-full w-64 shadow-lg animate-slide-in">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary-400">Familien Finanzen</h1>
                <button onClick={toggleMobileMenu} className="text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <nav className="pt-4">
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <button
                        onClick={() => navigateAndCloseMenu(item.path)}
                        className={`w-full flex items-center px-6 py-3 hover:bg-gray-100 transition-colors duration-200 ${
                          location.pathname === item.path
                            ? 'text-primary-400 font-medium bg-primary-50'
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-4">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-6 border-t border-gray-200 absolute bottom-0 w-full">
                <p className="text-xs text-gray-500">Familien Finanzen v1.0.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;