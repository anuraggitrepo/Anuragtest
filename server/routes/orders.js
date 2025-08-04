const express = require('express');
const { body, validationResult } = require('express-validator');
const Database = require('../database/db');

const router = express.Router();

// Get all orders with optional status filter
router.get('/', (req, res) => {
  const { status, limit = 50 } = req.query;
  let query = `
    SELECT o.*, 
           COUNT(oi.id) as item_count,
           GROUP_CONCAT(mi.name || ' (x' || oi.quantity || ')') as items
    FROM orders o 
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
  `;
  
  const params = [];
  
  if (status) {
    query += ' WHERE o.status = ?';
    params.push(status);
  }
  
  query += ` 
    GROUP BY o.id 
    ORDER BY o.created_at DESC 
    LIMIT ?
  `;
  params.push(parseInt(limit));
  
  Database.getDb().all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single order with full details
router.get('/:id', (req, res) => {
  const orderQuery = 'SELECT * FROM orders WHERE id = ?';
  
  Database.getDb().get(orderQuery, [req.params.id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const itemsQuery = `
      SELECT oi.*, mi.name, mi.description, mi.preparation_time
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `;
    
    Database.getDb().all(itemsQuery, [req.params.id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        ...order,
        items: items
      });
    });
  });
});

// Create new order
router.post('/', [
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menu_item_id').isInt({ min: 1 }).withMessage('Valid menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    customer_name,
    customer_phone,
    customer_email,
    table_number,
    notes,
    items
  } = req.body;

  // Start transaction
  Database.getDb().serialize(() => {
    Database.getDb().run('BEGIN TRANSACTION');

    try {
      // Calculate total amount
      let totalAmount = 0;
      let processedItems = 0;
      const itemsData = [];

      // Validate items and calculate total
      items.forEach((item, index) => {
        const priceQuery = 'SELECT price, is_available FROM menu_items WHERE id = ?';
        
        Database.getDb().get(priceQuery, [item.menu_item_id], (err, menuItem) => {
          if (err) {
            Database.getDb().run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          
          if (!menuItem) {
            Database.getDb().run('ROLLBACK');
            return res.status(400).json({ error: `Menu item ${item.menu_item_id} not found` });
          }
          
          if (!menuItem.is_available) {
            Database.getDb().run('ROLLBACK');
            return res.status(400).json({ error: `Menu item ${item.menu_item_id} is not available` });
          }
          
          const itemTotal = menuItem.price * item.quantity;
          totalAmount += itemTotal;
          
          itemsData.push({
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            price: menuItem.price,
            special_instructions: item.special_instructions
          });
          
          processedItems++;
          
          // When all items are processed, create the order
          if (processedItems === items.length) {
            const orderQuery = `
              INSERT INTO orders (customer_name, customer_phone, customer_email, table_number, total_amount, notes)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            Database.getDb().run(orderQuery, [
              customer_name, customer_phone, customer_email, table_number, totalAmount, notes
            ], function(err) {
              if (err) {
                Database.getDb().run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              const orderId = this.lastID;
              let insertedItems = 0;
              
              // Insert order items
              itemsData.forEach(itemData => {
                const itemQuery = `
                  INSERT INTO order_items (order_id, menu_item_id, quantity, price, special_instructions)
                  VALUES (?, ?, ?, ?, ?)
                `;
                
                Database.getDb().run(itemQuery, [
                  orderId, itemData.menu_item_id, itemData.quantity, 
                  itemData.price, itemData.special_instructions
                ], (err) => {
                  if (err) {
                    Database.getDb().run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                  }
                  
                  insertedItems++;
                  
                  if (insertedItems === itemsData.length) {
                    Database.getDb().run('COMMIT');
                    res.status(201).json({
                      id: orderId,
                      total_amount: totalAmount,
                      message: 'Order created successfully'
                    });
                  }
                });
              });
            });
          }
        });
      });
    } catch (error) {
      Database.getDb().run('ROLLBACK');
      res.status(500).json({ error: 'Failed to create order' });
    }
  });
});

// Update order status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;
  
  const query = `
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  Database.getDb().run(query, [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: `Order status updated to ${status}` });
  });
});

// Get order statistics
router.get('/stats/summary', (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
      COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
      COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
      SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue,
      AVG(CASE WHEN status = 'delivered' THEN total_amount ELSE NULL END) as average_order_value
    FROM orders 
    WHERE DATE(created_at) = DATE('now')
  `;
  
  Database.getDb().get(statsQuery, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stats);
  });
});

// Cancel order
router.delete('/:id', (req, res) => {
  const query = `
    UPDATE orders 
    SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
    WHERE id = ? AND status IN ('pending', 'confirmed')
  `;
  
  Database.getDb().run(query, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
    }
    res.json({ message: 'Order cancelled successfully' });
  });
});

module.exports = router;