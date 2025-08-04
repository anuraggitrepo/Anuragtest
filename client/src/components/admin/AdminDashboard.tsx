import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  Restaurant,
  ListAlt,
  Category,
  TrendingUp,
  AttachMoney,
  ShoppingCart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { OrderStats } from '../../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ManagementCard = ({ title, description, icon, onClick }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
  }) => (
    <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Restaurant Admin Dashboard
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Manage your restaurant operations efficiently
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Today's Statistics
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value={loading ? '...' : stats?.total_orders || 0}
              icon={<ShoppingCart fontSize="large" />}
              color="primary.main"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Orders"
              value={loading ? '...' : stats?.pending_orders || 0}
              icon={<TrendingUp fontSize="large" />}
              color="warning.main"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue"
              value={loading ? '...' : `$${(stats?.total_revenue || 0).toFixed(2)}`}
              icon={<AttachMoney fontSize="large" />}
              color="success.main"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Order Value"
              value={loading ? '...' : `$${(stats?.average_order_value || 0).toFixed(2)}`}
              icon={<TrendingUp fontSize="large" />}
              color="info.main"
            />
          </Grid>
        </Grid>

        {/* Quick Order Status */}
        {stats && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {stats.pending_orders}
                  </Typography>
                  <Typography variant="caption">Pending</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {stats.preparing_orders}
                  </Typography>
                  <Typography variant="caption">Preparing</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {stats.ready_orders}
                  </Typography>
                  <Typography variant="caption">Ready</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.delivered_orders}
                  </Typography>
                  <Typography variant="caption">Delivered</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Management Sections */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Management
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <ManagementCard
              title="Menu Management"
              description="Add, edit, and manage your menu items and pricing"
              icon={<Restaurant fontSize="large" />}
              onClick={() => navigate('/admin/menu')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <ManagementCard
              title="Order Management"
              description="View and manage customer orders and their status"
              icon={<ListAlt fontSize="large" />}
              onClick={() => navigate('/admin/orders')}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <ManagementCard
              title="Category Management"
              description="Organize your menu items into categories"
              icon={<Category fontSize="large" />}
              onClick={() => navigate('/admin/categories')}
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/admin/orders')}
              startIcon={<ListAlt />}
            >
              View Orders
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/admin/menu')}
              startIcon={<Restaurant />}
            >
              Manage Menu
            </Button>
            <Button 
              variant="outlined" 
              onClick={fetchStats}
              startIcon={<TrendingUp />}
            >
              Refresh Stats
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;