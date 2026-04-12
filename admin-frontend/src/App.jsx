import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import CustomersPage from './pages/CustomersPage';
import CateringPage from './pages/CateringPage';
import DiscountsPage from './pages/DiscountsPage';
import SettingsPage from './pages/SettingsPage';
import ContactsPage from './pages/ContactsPage';

const loader = <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:'0.9rem', color:'#aaa' }}>Loading…</div>;

function Guard() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return loader;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <AdminLayout />;
}

function LoginRoute() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return loader;
  if (user && isAdmin) return <Navigate to="/" replace />;
  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<Guard />}>
            <Route index element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/catering" element={<CateringPage />} />
            <Route path="/discounts" element={<DiscountsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
