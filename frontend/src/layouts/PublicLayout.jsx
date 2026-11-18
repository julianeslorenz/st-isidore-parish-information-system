import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/navigation/PublicHeader.jsx';
import PublicFooter from '../components/navigation/PublicFooter.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2">Skip to content</a>
      <PublicHeader />
      <main id="main" className="flex-1"><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
