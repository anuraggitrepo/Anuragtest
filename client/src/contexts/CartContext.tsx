import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number; special_instructions?: string } }
  | { type: 'REMOVE_ITEM'; payload: { menuItemId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: number; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, quantity: number, special_instructions?: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity, special_instructions } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.menu_item.id === menuItem.id && 
                item.special_instructions === special_instructions
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        const newItem: CartItem = {
          menu_item: menuItem,
          quantity,
          special_instructions
        };
        const updatedItems = [...state.items, newItem];
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        item => item.menu_item.id !== action.payload.menuItemId
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { menuItemId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { menuItemId } });
      }

      const updatedItems = state.items.map(item =>
        item.menu_item.id === menuItemId
          ? { ...item, quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0
      };

    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.menu_item.price * item.quantity), 0);
};

const initialState: CartState = {
  items: [],
  total: 0
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (menuItem: MenuItem, quantity: number, special_instructions?: string) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { menuItem, quantity, special_instructions } 
    });
  };

  const removeItem = (menuItemId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (menuItemId: number): number => {
    const item = state.items.find(item => item.menu_item.id === menuItemId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};