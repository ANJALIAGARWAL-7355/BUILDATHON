import React, { createContext, useState, useCallback, useEffect } from 'react';
import { cartService, customerService } from '../services/api';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize customer
  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      setCurrentCustomer(parseInt(customerId));
      loadCart(parseInt(customerId));
    }
  }, []);

  const loadCart = useCallback(async (customerId) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const response = await cartService.get(customerId);
      setCart(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setCart(null); // No active cart yet
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const setCustomer = useCallback((customerId) => {
    localStorage.setItem('customerId', customerId);
    setCurrentCustomer(customerId);
    loadCart(customerId);
  }, [loadCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!currentCustomer) {
      setError('Please select a customer first');
      return false;
    }
    
    try {
      const response = await cartService.add(currentCustomer, productId, quantity);
      setCart(response.data.cart);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add to cart');
      return false;
    }
  }, [currentCustomer]);

  const removeFromCart = useCallback(async (productId) => {
    if (!cart) return false;
    
    try {
      await cartService.remove(cart.id, productId);
      await loadCart(currentCustomer);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove from cart');
      return false;
    }
  }, [cart, currentCustomer, loadCart]);

  const startCheckout = useCallback(async () => {
    if (!currentCustomer) {
      setError('Please select a customer first');
      return false;
    }
    
    try {
      await cartService.checkout(currentCustomer);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout failed');
      return false;
    }
  }, [currentCustomer]);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  const value = {
    cart,
    currentCustomer,
    loading,
    error,
    setCustomer,
    setCurrentCustomer,
    loadCart,
    addToCart,
    removeFromCart,
    startCheckout,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
