import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert
} from '@mui/material';
import {
  Add,
  ShoppingCart,
  AccessTime,
  Info,
  Close
} from '@mui/icons-material';
import { MenuItem, Category } from '../../types';
import { menuApi, categoriesApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import Cart from './Cart';

const CustomerMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  
  const { addItem, state: cartState } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuApi.getAll({ available: true }),
        categoriesApi.getAll()
      ]);
      
      setMenuItems(menuResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Failed to load menu data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_name === selectedCategory);

  const handleAddToCart = (menuItem: MenuItem) => {
    addItem(menuItem, 1);
  };

  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading menu...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Our Menu
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Discover our delicious selection of freshly prepared dishes
        </Typography>

        {/* Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Items" value="all" />
            {categories.map((category) => (
              <Tab 
                key={category.id} 
                label={category.name} 
                value={category.name}
              />
            ))}
          </Tabs>
        </Box>

        {/* Menu Items Grid */}
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h3">
                      {item.name}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={item.category_name} 
                    size="small" 
                    color="secondary" 
                    sx={{ mb: 1 }}
                  />
                  
                  {item.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="caption">
                      {item.preparation_time} min
                    </Typography>
                  </Box>
                  
                  {item.allergens && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="warning.main">
                        <Info fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                        {item.allergens}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available}
                    fullWidth
                  >
                    {item.is_available ? 'Add to Cart' : 'Unavailable'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No items found in this category
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Cart Button */}
      <Fab
        color="primary"
        aria-label="cart"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCartOpen(true)}
      >
        <Badge badgeContent={cartState.items.length} color="secondary">
          <ShoppingCart />
        </Badge>
      </Fab>

      {/* Cart Dialog */}
      <Dialog 
        open={cartOpen} 
        onClose={() => setCartOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Shopping Cart
            <IconButton onClick={() => setCartOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Cart onClose={() => setCartOpen(false)} />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CustomerMenu;