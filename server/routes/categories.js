const express = require('express');
const { body, validationResult } = require('express-validator');
const Database = require('../database/db');

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  const query = `
    SELECT c.*, COUNT(mi.id) as item_count
    FROM categories c
    LEFT JOIN menu_items mi ON c.id = mi.category_id
    GROUP BY c.id
    ORDER BY c.name
  `;
  
  Database.getDb().all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single category by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM categories WHERE id = ?';
  
  Database.getDb().get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(row);
  });
});

// Create new category
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('name').isLength({ max: 100 }).withMessage('Name must be less than 100 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';

  Database.getDb().run(query, [name, description], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: this.lastID, 
      message: 'Category created successfully' 
    });
  });
});

// Update category
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('name').optional().isLength({ max: 100 }).withMessage('Name must be less than 100 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  const query = `
    UPDATE categories 
    SET name = COALESCE(?, name), description = COALESCE(?, description)
    WHERE id = ?
  `;

  Database.getDb().run(query, [name, description, req.params.id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete category
router.delete('/:id', (req, res) => {
  // First check if category has menu items
  const checkQuery = 'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?';
  
  Database.getDb().get(checkQuery, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing menu items' 
      });
    }
    
    const deleteQuery = 'DELETE FROM categories WHERE id = ?';
    
    Database.getDb().run(deleteQuery, [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

module.exports = router;