# 🍽️ Restaurant Management System - Local Deployment Guide

This guide will help you deploy and run the Restaurant Management System on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

## 🚀 Quick Start (Automated)

### For Linux/macOS:
```bash
# Make the script executable and run it
chmod +x deploy-local.sh
./deploy-local.sh
```

### For Windows:
```batch
# Double-click the batch file or run from command prompt
deploy-local.bat
```

The automated script will:
1. Check system requirements
2. Install all dependencies
3. Create necessary directories
4. Start both frontend and backend

## 📖 Manual Installation

If you prefer to install manually, follow these steps:

### 1. Clone or Download the Project
```bash
# If using Git
git clone <repository-url>
cd restaurant-management-system

# Or download and extract the ZIP file
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### 3. Create Required Directories
```bash
mkdir -p server/uploads
mkdir -p server/database
```

### 4. Environment Configuration (Optional)
The application works with default settings, but you can customize by creating a `.env` file in the `server` directory:

```bash
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here_change_in_production
DB_FILE=restaurant.db
```

## 🏃‍♂️ Running the Application

### Option 1: Run Both Frontend and Backend
```bash
npm run dev
```

### Option 2: Run Components Separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## 🌐 Accessing the Application

Once running, you can access:

- **Customer Menu**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Endpoints**: http://localhost:5000/api

### Default Sample Data
The application comes pre-loaded with:
- 5 menu categories (Appetizers, Main Courses, Desserts, Beverages, Salads)
- 6 sample menu items with realistic pricing
- No orders (you can create test orders)

## 🛠️ Deployment Script Options

### Linux/macOS Script (deploy-local.sh)
```bash
./deploy-local.sh                 # Full installation and start
./deploy-local.sh install         # Install dependencies only
./deploy-local.sh start           # Start both frontend and backend
./deploy-local.sh backend         # Start backend only
./deploy-local.sh frontend        # Start frontend only
./deploy-local.sh check           # Check system requirements
./deploy-local.sh help            # Show help
```

### Windows Script (deploy-local.bat)
```batch
deploy-local.bat                  # Full installation and start
deploy-local.bat install          # Install dependencies only
deploy-local.bat start            # Start both frontend and backend
deploy-local.bat backend          # Start backend only
deploy-local.bat frontend         # Start frontend only
deploy-local.bat check            # Check system requirements
deploy-local.bat help             # Show help
```

## 🗄️ Database

The application uses SQLite database which will be automatically created when you first run the server. The database file will be located at:
- `server/database/restaurant.db`

### Database Features:
- Automatic table creation on first run
- Sample data insertion
- No additional database setup required

## 🧪 Testing the Installation

### 1. Test Backend API
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"Restaurant API is running"}
```

### 2. Test Menu Endpoint
```bash
curl http://localhost:5000/api/menu
# Should return JSON array of menu items
```

### 3. Test Frontend
Open your browser and visit http://localhost:3000
- You should see the restaurant menu interface

## 🔧 Troubleshooting

### Common Issues:

#### Port Already in Use
If you get "port already in use" errors:
```bash
# Check what's using the ports
lsof -i :3000  # Check port 3000
lsof -i :5000  # Check port 5000

# Kill processes if needed
kill -9 <PID>
```

#### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database Issues
If you encounter database issues:
```bash
# Delete the database file to reset
rm server/database/restaurant.db

# Restart the server - it will recreate the database
```

### Platform-Specific Issues:

#### Windows
- Use Command Prompt or PowerShell as Administrator if you encounter permission issues
- Ensure Windows Defender or antivirus isn't blocking Node.js

#### macOS
- You might need to install Xcode command line tools:
  ```bash
  xcode-select --install
  ```

#### Linux
- Ensure you have build-essential installed:
  ```bash
  sudo apt update
  sudo apt install build-essential
  ```

## 📁 Project Structure
```
restaurant-management-system/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript interfaces
│   └── package.json
├── server/                    # Node.js backend
│   ├── database/              # Database setup
│   ├── routes/                # API routes
│   ├── .env                   # Environment variables
│   └── package.json
├── deploy-local.sh            # Linux/macOS deployment script
├── deploy-local.bat           # Windows deployment script
├── package.json               # Root package.json
└── README.md                  # Main documentation
```

## 🎯 Usage Guide

### For Customers:
1. Visit http://localhost:3000
2. Browse menu items by category
3. Add items to cart
4. Place order with customer details

### For Admin:
1. Visit http://localhost:3000/admin
2. View dashboard statistics
3. Manage menu items (add/edit/delete)
4. Process orders and update status
5. Manage categories

## 🚀 Production Deployment

For production deployment, consider:
1. Using a process manager like PM2
2. Setting up a reverse proxy (nginx)
3. Using a production database (PostgreSQL/MySQL)
4. Implementing proper authentication
5. Setting up SSL certificates
6. Environment-specific configurations

## 📞 Support

If you encounter any issues during deployment:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify port availability
4. Check the console logs for specific error messages

## 🔄 Stopping the Application

To stop the application:
- Press `Ctrl+C` in the terminal where it's running
- Or close the terminal window

## 📋 Next Steps

After successful deployment:
1. Explore the customer menu interface
2. Test the ordering process
3. Access the admin panel to manage menu items
4. Create test orders and manage their status
5. Customize the menu with your own items

Enjoy your Restaurant Management System! 🍽️