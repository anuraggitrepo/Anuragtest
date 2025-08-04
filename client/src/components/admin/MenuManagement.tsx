import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  AccessTime,
  Close
} from '@mui/icons-material';
import { MenuItem as MenuItemType, Category } from '../../types';
import { menuApi, categoriesApi } from '../../services/api';

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    preparation_time: '15',
    ingredients: '',
    allergens: '',
    is_available: true
  });
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuApi.getAll(),
        categoriesApi.getAll()
      ]);
      
      setMenuItems(menuResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  const handleOpenDialog = (item?: MenuItemType) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category_id: item.category_id.toString(),
        preparation_time: item.preparation_time.toString(),
        ingredients: item.ingredients || '',
        allergens: item.allergens || '',
        is_available: item.is_available
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        preparation_time: '15',
        ingredients: '',
        allergens: '',
        is_available: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        preparation_time: parseInt(formData.preparation_time)
      };

      if (editingItem) {
        await menuApi.update(editingItem.id, data);
        showNotification('Menu item updated successfully', 'success');
      } else {
        await menuApi.create(data);
        showNotification('Menu item created successfully', 'success');
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      showNotification('Failed to save menu item', 'error');
    }
  };

  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      await menuApi.toggleAvailability(id, !currentStatus);
      showNotification(
        `Menu item ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
        'success'
      );
      fetchData();
    } catch (error) {
      showNotification('Failed to update availability', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuApi.delete(id);
        showNotification('Menu item deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification('Failed to delete menu item', 'error');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Menu Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Menu Item
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading menu items...</Typography>
        ) : (
          <Grid container spacing={3}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary">
                          ${item.price.toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          color={item.is_available ? 'success' : 'error'}
                        >
                          {item.is_available ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Chip 
                      label={item.category_name} 
                      size="small" 
                      color="secondary" 
                      sx={{ mb: 1 }}
                    />
                    
                    {!item.is_available && (
                      <Chip 
                        label="Unavailable" 
                        size="small" 
                        color="error" 
                        sx={{ mb: 1, ml: 1 }}
                      />
                    )}
                    
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
                      <Typography variant="caption" color="warning.main">
                        Allergens: {item.allergens}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenDialog(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {menuItems.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No menu items found
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Your First Menu Item
            </Button>
          </Box>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name *"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Price *"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Preparation Time (minutes)"
                type="number"
                fullWidth
                value={formData.preparation_time}
                onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                inputProps={{ min: '1' }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Ingredients"
                fullWidth
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="e.g., Tomatoes, Cheese, Basil"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Allergens"
                fullWidth
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                placeholder="e.g., Contains dairy, gluten"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                }
                label="Available for ordering"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.price || !formData.category_id}
          >
            {editingItem ? 'Update' : 'Create'}
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
    </Container>
  );
};

export default MenuManagement;