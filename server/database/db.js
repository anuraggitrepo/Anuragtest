const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = process.env.DB_FILE || 'restaurant.db';
const dbPath = path.join(__dirname, DB_FILE);

class Database {
  constructor() {
    this.db = null;
  }

  init() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Categories table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER,
        image_url TEXT,
        is_available BOOLEAN DEFAULT 1,
        preparation_time INTEGER DEFAULT 15,
        ingredients TEXT,
        allergens TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Orders table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        table_number INTEGER,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        special_instructions TEXT,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      )
    `);

    // Insert sample data
    this.insertSampleData();
  }

  insertSampleData() {
    // Insert sample categories
    const categories = [
      ['Appetizers', 'Start your meal with our delicious appetizers'],
      ['Main Courses', 'Hearty and satisfying main dishes'],
      ['Desserts', 'Sweet treats to end your meal'],
      ['Beverages', 'Refreshing drinks and beverages'],
      ['Salads', 'Fresh and healthy salad options']
    ];

    const insertCategory = this.db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
    categories.forEach(category => {
      insertCategory.run(category);
    });
    insertCategory.finalize();

    // Insert sample menu items
    setTimeout(() => {
      const menuItems = [
        ['Caesar Salad', 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan', 12.99, 5, null, 1, 10, 'Romaine lettuce, Caesar dressing, Croutons, Parmesan cheese', 'Contains dairy, gluten'],
        ['Grilled Chicken Breast', 'Juicy grilled chicken breast with herbs and spices', 18.99, 2, null, 1, 25, 'Chicken breast, Herbs, Olive oil, Spices', 'None'],
        ['Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and fresh basil', 16.99, 2, null, 1, 20, 'Pizza dough, Tomato sauce, Mozzarella, Basil', 'Contains gluten, dairy'],
        ['Chocolate Cake', 'Rich and moist chocolate cake with chocolate frosting', 8.99, 3, null, 1, 5, 'Chocolate, Flour, Sugar, Eggs, Butter', 'Contains gluten, dairy, eggs'],
        ['Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 4, null, 1, 2, 'Fresh oranges', 'None'],
        ['Garlic Bread', 'Toasted bread with garlic butter and herbs', 6.99, 1, null, 1, 8, 'Bread, Garlic, Butter, Herbs', 'Contains gluten, dairy']
      ];

      const insertMenuItem = this.db.prepare(`
        INSERT OR IGNORE INTO menu_items 
        (name, description, price, category_id, image_url, is_available, preparation_time, ingredients, allergens) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      menuItems.forEach(item => {
        insertMenuItem.run(item);
      });
      insertMenuItem.finalize();
    }, 100);
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();