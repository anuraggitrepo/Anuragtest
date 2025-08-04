import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout
} from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';

interface CartProps {
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ onClose }) => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    table_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleQuantityChange = (menuItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(menuItemId);
    } else {
      updateQuantity(menuItemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!orderForm.customer_name.trim()) {
      setNotification({
        open: true,
        message: 'Customer name is required',
        severity: 'error'
      });
      return;
    }

    if (state.items.length === 0) {
      setNotification({
        open: true,
        message: 'Cart is empty',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const orderData: Partial<Order> = {
        customer_name: orderForm.customer_name,
        customer_phone: orderForm.customer_phone || undefined,
        customer_email: orderForm.customer_email || undefined,
        table_number: orderForm.table_number ? parseInt(orderForm.table_number) : undefined,
        notes: orderForm.notes || undefined,
        items: state.items.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          price: item.menu_item.price,
          special_instructions: item.special_instructions
        }))
      };

      const response = await ordersApi.create(orderData);
      
      setNotification({
        open: true,
        message: `Order #${response.data.id} placed successfully! Total: $${response.data.total_amount.toFixed(2)}`,
        severity: 'success'
      });
      
      clearCart();
      setCheckoutOpen(false);
      onClose();
      
      // Reset form
      setOrderForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        table_number: '',
        notes: ''
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to place order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add some delicious items from our menu!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <List>
        {state.items.map((item, index) => (
          <React.Fragment key={`${item.menu_item.id}-${index}`}>
            <ListItem>
              <ListItemText
                primary={item.menu_item.name}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      ${item.menu_item.price.toFixed(2)} each
                    </Typography>
                    {item.special_instructions && (
                      <Typography variant="caption" color="text.secondary">
                        Note: {item.special_instructions}
                      </Typography>
                    )}
                  </>
                }
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.menu_item.id, item.quantity - 1)}
                >
                  <Remove />
                </IconButton>
                
                <Typography sx={{ minWidth: 24, textAlign: 'center' }}>
                  {item.quantity}
                </Typography>
                
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(item.menu_item.id, item.quantity + 1)}
                >
                  <Add />
                </IconButton>
                
                <IconButton
                  color="error"
                  onClick={() => removeItem(item.menu_item.id)}
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Typography variant="body1" sx={{ ml: 2, minWidth: 80, textAlign: 'right' }}>
                ${(item.menu_item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
            
            {index < state.items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" color="primary">
          ${state.total.toFixed(2)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<ShoppingCartCheckout />}
        onClick={() => setCheckoutOpen(true)}
        fullWidth
        size="large"
      >
        Place Order
      </Button>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Customer Name *"
                fullWidth
                value={orderForm.customer_name}
                onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                fullWidth
                value={orderForm.customer_phone}
                onChange={(e) => setOrderForm({ ...orderForm, customer_phone: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Table Number"
                type="number"
                fullWidth
                value={orderForm.table_number}
                onChange={(e) => setOrderForm({ ...orderForm, table_number: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={orderForm.customer_email}
                onChange={(e) => setOrderForm({ ...orderForm, customer_email: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Special Notes"
                multiline
                rows={3}
                fullWidth
                value={orderForm.notes}
                onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : `Place Order - $${state.total.toFixed(2)}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;