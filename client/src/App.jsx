import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminOrders from './pages/admin/AdminOrders';
import AdminMenu from './pages/admin/AdminMenu';
import AdminDeals from './pages/admin/AdminDeals';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import EmberCursor from './components/EmberCursor';
import TouchFireBurst from './components/TouchFireBurst';
import LoadingScreen from './components/LoadingScreen';
import AmbientSound from './components/AmbientSound';

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <LoadingScreen />
      <AmbientSound />
      <EmberCursor />
      <TouchFireBurst />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard-lbq-a8f2c9d1/login" element={<AdminLogin />} />
        <Route path="/dashboard-lbq-a8f2c9d1" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#F5F5F0',
            border: '1px solid rgba(192,57,43,0.3)',
            fontFamily: "'Lora', serif",
          },
          success: { iconTheme: { primary: '#E67E22', secondary: '#fff' } },
          error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
    </CartProvider>
  );
}

export default App
