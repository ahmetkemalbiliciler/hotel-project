import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Rooms from './pages/Rooms';
import Availability from './pages/Availability';
import './App.css';

function App() {
  const auth = useAuth();

  const groups = auth.user?.profile['cognito:groups'];
  const isAdmin = Array.isArray(groups)
    ? groups.includes('ADMIN')
    : groups === 'ADMIN';

  // Loading state
  if (auth.isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (auth.error) {
    return <ErrorMessage message={auth.error.message} />;
  }

  // Not authenticated
  if (!auth.isAuthenticated) {
    return <LoginScreen onLogin={() => auth.signinRedirect()} />;
  }

  // Not admin
  if (!isAdmin) {
    return <AccessDenied onLogout={signOutRedirect} groups={groups} />;
  }

  function signOutRedirect() {
    const clientId = '1o15vekt2a1ihnemat290bdh15';
    const logoutUri = window.location.origin;
    const cognitoDomain = 'https://eu-north-1icdnng3yv.auth.eu-north-1.amazoncognito.com';
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="availability" element={<Availability />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="font-bold text-slate-600">Yükleniyor...</p>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-6">
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-red-600 mb-2">Hata Oluştu</h2>
      <p className="text-slate-600 mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold"
      >
        Tekrar Dene
      </button>
    </div>
  </div>
);

// Login Screen Component
const LoginScreen = ({ onLogin }) => (
  <div className="flex items-center justify-center h-screen bg-slate-900 overflow-hidden relative">
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
    <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10">
      <div className="text-center mb-10">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900">HotelAdmin</h1>
        <p className="text-slate-500 mt-2">Profesyonel Otel Yönetim Paneli</p>
      </div>
      <button
        onClick={onLogin}
        className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
      >
        Admin Paneline Giriş Yap
      </button>
      <p className="text-center text-xs text-slate-400 mt-8 uppercase tracking-widest font-bold">
        Sadece Yetkili Erişim
      </p>
    </div>
  </div>
);

// Access Denied Component
const AccessDenied = ({ onLogout, groups }) => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg text-center border border-red-100">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-4">Erişim Reddedildi</h1>
      <p className="text-slate-600 mb-2">
        Bu alana erişmek için gerekli yetkilere sahip değilsiniz.
      </p>
      <div className="bg-slate-50 p-4 rounded-xl mb-8 text-sm text-slate-400 font-mono">
        Grup: {Array.isArray(groups) ? groups.join(', ') : groups || 'Yok'}
      </div>
      <button
        onClick={onLogout}
        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
      >
        Çıkış Yap
      </button>
    </div>
  </div>
);

export default App;
