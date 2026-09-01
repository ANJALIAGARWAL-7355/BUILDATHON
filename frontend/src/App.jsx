import React, { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import { CartProvider, useCart } from './context/CartContext';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';

function MainLayout() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { cart, removeFromCart } = useCart();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'cart':
        return <CartPage onNavigate={setCurrentPage} />;
      case 'checkout':
        return <CheckoutPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
      />
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Slide-in Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        cart={cart}
        onClose={() => setIsCartDrawerOpen(false)}
        onRemoveItem={removeFromCart}
        onCheckout={() => setCurrentPage('checkout')}
      />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <MainLayout />
    </CartProvider>
  );
}

export default App;
