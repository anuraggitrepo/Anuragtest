const express = require('express');
const { body, validationResult } = require('express-validator');
const Database = require('../database/db');

const router = express.Router();

// Get all menu items with optional category filter
router.get('/', (req, res) => {
  const { category, available } = req.query;
  let query = `
    SELECT mi.*, c.name as category_name 
    FROM menu_items mi 
    LEFT JOIN categories c ON mi.category_id = c.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (category) {
    conditions.push('c.name = ?');
    params.push(category);
  }
  
  if (available !== undefined) {
    conditions.push('mi.is_available = ?');
    params.push(available === 'true' ? 1 : 0);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY c.name, mi.name';
  
  Database.getDb().all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single menu item by ID
router.get('/:id', (req, res) => {
  const query = `
    SELECT mi.*, c.name as category_name 
    FROM menu_items mi 
    LEFT JOIN categories c ON mi.category_id = c.id 
    WHERE mi.id = ?
  `;
  
  Database.getDb().get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(row);
  });
});

// Create new menu item
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('preparation_time').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    price,
    category_id,
    image_url,
    is_available = true,
    preparation_time = 15,
    ingredients,
    allergens
  } = req.body;

  const query = `
    INSERT INTO menu_items 
    (name, description, price, category_id, image_url, is_available, preparation_time, ingredients, allergens)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  Database.getDb().run(query, [
    name, description, price, category_id, image_url, 
    is_available ? 1 : 0, preparation_time, ingredients, allergens
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: this.lastID, 
      message: 'Menu item created successfully' 
    });
  });
});

// Update menu item
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('preparation_time').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    description,
    price,
    category_id,
    image_url,
    is_available,
    preparation_time,
    ingredients,
    allergens
  } = req.body;

  const query = `
    UPDATE menu_items 
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category_id = COALESCE(?, category_id),
        image_url = COALESCE(?, image_url),
        is_available = COALESCE(?, is_available),
        preparation_time = COALESCE(?, preparation_time),
        ingredients = COALESCE(?, ingredients),
        allergens = COALESCE(?, allergens),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  Database.getDb().run(query, [
    name, description, price, category_id, image_url,
    is_available !== undefined ? (is_available ? 1 : 0) : null,
    preparation_time, ingredients, allergens, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item updated successfully' });
  });
});

// Toggle availability
router.patch('/:id/availability', (req, res) => {
  const { is_available } = req.body;
  
  const query = `
    UPDATE menu_items 
    SET is_available = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  Database.getDb().run(query, [is_available ? 1 : 0, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ 
      message: `Menu item ${is_available ? 'enabled' : 'disabled'} successfully` 
    });
  });
});

// Delete menu item
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM menu_items WHERE id = ?';
  
  Database.getDb().run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  });
});

module.exports = router;