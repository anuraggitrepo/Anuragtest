# Restaurant Management System

A full-stack restaurant management application built with Node.js, Express, SQLite, React, and TypeScript. This system allows restaurant owners to manage their menu, track food item availability, and handle customer orders efficiently.

## Features

### Customer Features
- **Menu Browsing**: View categorized menu items with descriptions, prices, and preparation times
- **Food Item Filtering**: Filter menu items by category and availability
- **Shopping Cart**: Add items to cart with quantity and special instructions
- **Order Placement**: Place orders with customer information and delivery details
- **Allergen Information**: View allergen information for each menu item

### Admin Features
- **Dashboard**: Overview of order statistics and quick status monitoring
- **Menu Management**: Add, edit, delete, and toggle availability of menu items
- **Order Management**: View and update order status in real-time
- **Category Management**: Organize menu items into categories
- **Inventory Tracking**: Track food item availability

## Tech Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data persistence
- **Express Validator** for input validation
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here_change_in_production
DB_FILE=restaurant.db
```

### 3. Start the Application

```bash
# From the root directory, start both server and client
npm run dev

# Or start them separately:
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the client
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Database Schema

The application uses SQLite with the following tables:

### Categories
- `id` (Primary Key)
- `name` (Unique)
- `description`
- `created_at`

### Menu Items
- `id` (Primary Key)
- `name`
- `description`
- `price`
- `category_id` (Foreign Key)
- `image_url`
- `is_available`
- `preparation_time`
- `ingredients`
- `allergens`
- `created_at`
- `updated_at`

### Orders
- `id` (Primary Key)
- `customer_name`
- `customer_phone`
- `customer_email`
- `table_number`
- `total_amount`
- `status`
- `notes`
- `created_at`
- `updated_at`

### Order Items
- `id` (Primary Key)
- `order_id` (Foreign Key)
- `menu_item_id` (Foreign Key)
- `quantity`
- `price`
- `special_instructions`

## API Endpoints

### Menu Items
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get specific menu item
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `PATCH /api/menu/:id/availability` - Toggle availability
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Get order statistics
- `DELETE /api/orders/:id` - Cancel order

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Usage Guide

### For Customers
1. Visit the main menu page
2. Browse items by category or view all items
3. Add desired items to your cart
4. Review cart and place order with your details
5. Receive order confirmation with order number

### For Restaurant Staff/Admin
1. Access the admin panel from the navigation
2. View dashboard for daily statistics and order overview
3. Manage menu items (add, edit, delete, toggle availability)
4. Process orders by updating their status
5. Organize menu with categories

## Order Status Flow
1. **Pending** - Order received, awaiting confirmation
2. **Confirmed** - Order confirmed by restaurant
3. **Preparing** - Kitchen is preparing the order
4. **Ready** - Order is ready for pickup/delivery
5. **Delivered** - Order has been delivered to customer
6. **Cancelled** - Order was cancelled

## Sample Data
The application comes with pre-populated sample data including:
- 5 menu categories (Appetizers, Main Courses, Desserts, Beverages, Salads)
- 6 sample menu items with realistic pricing and descriptions
- Allergen information and preparation times

## Development

### Project Structure
```
restaurant-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript interfaces
├── server/                 # Node.js backend
│   ├── database/           # Database setup and models
│   ├── routes/             # API route handlers
│   └── index.js           # Server entry point
└── package.json           # Root package configuration
```

### Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend client
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for all packages

## Security Features
- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- CORS configuration for secure cross-origin requests
- Helmet.js for security headers
- Error handling middleware

## Future Enhancements
- User authentication and role-based access
- Payment integration
- Real-time order updates with WebSockets
- Image upload for menu items
- Email notifications
- Reporting and analytics
- Multi-location support
- Mobile app development

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License
This project is licensed under the MIT License.
