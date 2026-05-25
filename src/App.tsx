import { useState } from 'react';
import { api } from './services/api';

import FrontPage from './components/FrontPage';
import Showcase from './components/Showcase';
import AdminLogin from './components/AdminLogin';
import Admin from './components/Admin';
import UserDashboard from './components/UserDashboard';

type Page = 'frontpage' | 'showcase' | 'login' | 'admin' | 'user';

export default function App() {
  const user = api.getUser();

  const [page, setPage] = useState<Page>(
    api.isLoggedIn()
      ? user?.role === 'admin'
        ? 'admin'
        : 'user'
      : 'frontpage'
  );

  const handleLoginSuccess = () => {
    const u = api.getUser();
    setPage(u?.role === 'admin' ? 'admin' : 'user');
  };

  if (page === 'frontpage') {
    return (
      <FrontPage
        onEnterShowcase={() => setPage('showcase')}
        onAdmin={() => setPage('login')}
      />
    );
  }

  if (page === 'showcase') {
    return <Showcase onAdmin={() => setPage('login')} />;
  }

  if (page === 'login') {
    return (
      <AdminLogin
        onSuccess={handleLoginSuccess}
        onBack={() => setPage('frontpage')}
      />
    );
  }

  if (page === 'user') {
    return (
      <UserDashboard
        onLogout={() => {
          api.logout();
          setPage('frontpage');
        }}
        onBackToShowcase={() => setPage('showcase')}
      />
    );
  }

  return (
    <Admin
      onBack={() => setPage('frontpage')}
      onLogout={() => {
        api.logout();
        setPage('frontpage');
      }}
    />
  );
}
