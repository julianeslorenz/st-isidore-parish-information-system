import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

// Window scroll reset for public and portal pages (the admin shell resets its own scroll container).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
  );
}
