import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Close,
  Visibility,
  Person,
  Phone,
  Email,
  TableRestaurant,
  Notes
} from '@mui/icons-material';
import { Order } from '../../types';
import { ordersApi } from '../../services/api';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchOrders();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll(
        statusFilter !== 'all' ? { status: statusFilter, limit: 100 } : { limit: 100 }
      );
      setOrders(response.data);
    } catch (error) {
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const response = await ordersApi.getById(order.id!);
      setSelectedOrder(response.data);
      setDetailsOpen(true);
    } catch (error) {
      showNotification('Failed to load order details', 'error');
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      showNotification(`Order status updated to ${newStatus}`, 'success');
      fetchOrders();
      
      // Update selected order if it's open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'delivered': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusSteps = (currentStatus: Order['status']) => {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    return steps.filter(step => 
      step !== 'cancelled' && 
      (steps.indexOf(step) > steps.indexOf(currentStatus) || step === currentStatus)
    );
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Management
        </Typography>

        {/* Status Overview */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Quick Status Overview</Typography>
          <Grid container spacing={2}>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <Grid item xs={6} sm={4} md={2} key={status}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color={`${getStatusColor(status as Order['status'])}.main`}>
                    {count}
                  </Typography>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {status}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={statusFilter} 
            onChange={(_, newValue) => setStatusFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Orders" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Confirmed" value="confirmed" />
            <Tab label="Preparing" value="preparing" />
            <Tab label="Ready" value="ready" />
            <Tab label="Delivered" value="delivered" />
            <Tab label="Cancelled" value="cancelled" />
          </Tabs>
        </Box>

        {loading ? (
          <Typography>Loading orders...</Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredOrders.map((order) => (
              <Grid item xs={12} sm={6} md={4} key={order.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6">
                        Order #{order.id}
                      </Typography>
                      <Chip 
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Person fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      {order.customer_name}
                    </Typography>
                    
                    {order.table_number && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <TableRestaurant fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                        Table {order.table_number}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" gutterBottom>
                      Items: {order.item_count || 0}
                    </Typography>
                    
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${order.total_amount.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.created_at!).toLocaleString()}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                      
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id!, e.target.value as Order['status'])}
                            displayEmpty
                          >
                            {getStatusSteps(order.status).map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </MenuItem>
                            ))}
                            <MenuItem value="cancelled">Cancel</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredOrders.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No orders found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Order Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Order #{selectedOrder?.id} Details
            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <Person fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                    <strong>Name:</strong> {selectedOrder.customer_name}
                  </Typography>
                  
                  {selectedOrder.customer_phone && (
                    <Typography variant="body2" gutterBottom>
                      <Phone fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      <strong>Phone:</strong> {selectedOrder.customer_phone}
                    </Typography>
                  )}
                  
                  {selectedOrder.customer_email && (
                    <Typography variant="body2" gutterBottom>
                      <Email fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      <strong>Email:</strong> {selectedOrder.customer_email}
                    </Typography>
                  )}
                  
                  {selectedOrder.table_number && (
                    <Typography variant="body2" gutterBottom>
                      <TableRestaurant fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                      <strong>Table:</strong> {selectedOrder.table_number}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Order Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Order Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> 
                    <Chip 
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status) as any}
                      size="small"
                      sx={{ ml: 1, textTransform: 'capitalize' }}
                    />
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Order Time:</strong> {new Date(selectedOrder.created_at!).toLocaleString()}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Amount:</strong> ${selectedOrder.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                <List>
                  {selectedOrder.items?.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={`${item.name} x${item.quantity}`}
                        secondary={
                          <>
                            <Typography variant="body2">
                              ${item.price.toFixed(2)} each - Total: ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                            {item.special_instructions && (
                              <Typography variant="caption" color="text.secondary">
                                Note: {item.special_instructions}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {/* Special Notes */}
              {selectedOrder.notes && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <Notes fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                    Special Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedOrder.notes}
                  </Typography>
                </Grid>
              )}

              {/* Status Update */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Update Status</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getStatusSteps(selectedOrder.status).map((status) => (
                      <Button
                        key={status}
                        variant={status === selectedOrder.status ? 'contained' : 'outlined'}
                        onClick={() => handleStatusUpdate(selectedOrder.id!, status as Order['status'])}
                        disabled={status === selectedOrder.status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleStatusUpdate(selectedOrder.id!, 'cancelled')}
                    >
                      Cancel Order
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
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
    </Container>
  );
};

export default OrderManagement;