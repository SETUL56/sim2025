# 🚀 Entrepreneur Business Simulator

A comprehensive multi-user business simulation platform for educational purposes. Students can create businesses, sell products, trade stocks/crypto, and compete in a global marketplace. Teachers have a separate admin dashboard to monitor all activity.

## ✨ Features

### For Students:
- **Create & Manage Businesses**: Build your own business with custom branding, products, and services
- **Multiple Products**: Add unlimited products/services to your business with different prices
- **Global Marketplace**: Browse and purchase from other students' businesses
- **Business Landing Pages**: Each business has a detailed landing page showcasing all products
- **Stock Trading**: Trade 8 major stocks with live price fluctuations
- **Cryptocurrency**: Invest in 7 cryptocurrencies (BTC, ETH, BNB, SOL, ADA, DOT, MATIC)
- **Portfolio Management**: Track all investments and transaction history
- **Play Money Economy**: Start with $10,000 virtual currency

### For Teachers:
- **Admin Dashboard**: Separate teacher interface (students can't access)
- **Real-time Statistics**: Monitor total businesses, revenue, transactions, and trades
- **Student Activity Tracking**: See what each student is doing
- **Business Leaderboard**: Rank businesses by revenue
- **Transaction Logs**: Complete history of all purchases and trades
- **Export Reports**: Download comprehensive JSON reports
- **Reset Simulation**: Clear all data and start fresh

### Multi-User Support:
- Concurrent access for multiple students
- Real-time data synchronization
- Server-based architecture
- Persistent data storage

## 🚀 Setup Instructions for CodeSandbox

### Method 1: Import from GitHub (Recommended)
1. Upload this entire folder to a GitHub repository
2. Go to [CodeSandbox](https://codesandbox.io)
3. Click "Import from GitHub"
4. Enter your repository URL
5. CodeSandbox will automatically detect it's a Node.js project

### Method 2: Direct Upload
1. Go to [CodeSandbox](https://codesandbox.io)
2. Click "Create Sandbox" → "Import Project"
3. Upload all files maintaining the folder structure:
   ```
   entrepreneur-sim/
   ├── package.json
   ├── server.js
   ├── README.md
   ├── public/
   │   ├── index.html
   │   ├── styles.css
   │   └── app.js
   └── data/ (auto-created)
   ```

### Method 3: Manual Setup
1. Create a new Node.js sandbox in CodeSandbox
2. Copy all files into the appropriate directories
3. Click "Restart Server" in CodeSandbox

## 📦 Installation

The server will automatically install dependencies and create necessary data files on first run.

### Manual Installation (if needed):
```bash
npm install
```

### Start the Server:
```bash
npm start
```

The application will be available at `http://localhost:3000` (or CodeSandbox's provided URL)

## 🔐 Default Login Credentials

### Teacher Account:
- **Username**: `teacher`
- **Password**: `teacher123`

### Student Accounts:
- **Student 1**: `student1` / `student1`
- **Student 2**: `student2` / `student2`
- **Student 3**: `student3` / `student3`

Students can also register new accounts directly from the login page!

## 📁 Project Structure

```
entrepreneur-sim/
├── server.js              # Express server with all API endpoints
├── package.json           # Dependencies
├── README.md             # This file
├── public/               # Frontend files
│   ├── index.html        # Main HTML with all screens
│   ├── styles.css        # Complete styling
│   └── app.js           # Frontend JavaScript logic
└── data/                # Auto-generated data storage
    ├── users.json       # User accounts
    ├── businesses.json  # All businesses
    ├── transactions.json # Transaction history
    └── market.json      # Stock/crypto prices
```

## 🎯 How It Works

### For Students:

1. **Login/Register**
   - Use existing demo accounts or create a new student account
   - Start with $10,000 virtual money

2. **Create a Business**
   - Click "My Business" → "Create Your Business"
   - Fill in business details, choose colors, add a tagline
   - Launch your business!

3. **Add Products**
   - Once business is created, click "Add Product"
   - Add multiple products/services with different prices
   - Each product tracks its own sales and revenue

4. **Visit the Marketplace**
   - Browse all businesses created by other students
   - Click on any business to see its landing page
   - View all products and make purchases

5. **Trade Stocks/Crypto**
   - Go to "Trading" section
   - Buy and sell stocks and cryptocurrencies
   - Prices update every 10 seconds

6. **Track Portfolio**
   - View all your investments
   - See profit/loss for each position
   - Review complete transaction history

### For Teachers:

1. **Login with Teacher Account**
   - Use the teacher credentials to access admin dashboard
   - Students CANNOT see this interface

2. **Monitor Overview**
   - See total students, businesses, revenue
   - View top performing businesses
   - Check most popular business category

3. **Track Students**
   - See each student's balance
   - Monitor their purchases and trades
   - Identify most active students

4. **Review Businesses**
   - See all created businesses
   - Check revenue and sales for each
   - View products offered

5. **Export Data**
   - Click "Export Report" to download full JSON report
   - Contains all statistics, users, businesses, and transactions
   - Use for grading or analysis

6. **Reset Simulation**
   - Click "Reset Simulation" when ready for new class
   - Creates backup before resetting
   - Resets all student balances to $10,000
   - Clears all businesses and transactions

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Register new student

### Users
- `GET /api/user/:userId` - Get user data
- `PUT /api/user/:userId/balance` - Update balance

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/business/:businessId` - Get single business
- `GET /api/businesses/owner/:userId` - Get user's businesses
- `POST /api/business` - Create business
- `PUT /api/business/:businessId` - Update business
- `DELETE /api/business/:businessId` - Delete business

### Products
- `POST /api/business/:businessId/product` - Add product
- `PUT /api/business/:businessId/product/:productId` - Update product
- `DELETE /api/business/:businessId/product/:productId` - Delete product

### Transactions
- `POST /api/purchase` - Purchase product
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/user/:userId` - Get user transactions

### Trading
- `GET /api/market` - Get market data
- `POST /api/market/update` - Update prices (auto-called)
- `POST /api/trade` - Execute trade

### Admin (Teacher Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get statistics
- `POST /api/admin/reset` - Reset simulation

## 🎨 Customization

### Adding More Demo Users
Edit the `initializeDataFiles()` function in `server.js` to add more default users.

### Changing Starting Balance
Modify the `balance: 10000` value in the default users or registration endpoint.

### Adding More Stocks/Crypto
Edit the `market.json` initialization in `server.js`.

### Adjusting Market Update Frequency
Change the interval in `setupMarketUpdates()` function in `app.js` (default: 10 seconds).

## 🐛 Troubleshooting

### Server Won't Start
- Check that all files are in the correct directories
- Ensure `package.json` is in the root folder
- Try deleting `node_modules` and running `npm install` again

### Data Not Saving
- Make sure the `data/` directory has write permissions
- Check browser console for errors
- Verify server is running

### Can't Access Admin Dashboard
- Make sure you're logged in with teacher account (`teacher` / `teacher123`)
- Students cannot access the admin panel by design

### Market Prices Not Updating
- Check browser console for errors
- Ensure server is running properly
- Prices update every 10 seconds automatically

## 📝 Educational Use

This simulator is designed for:
- Entrepreneurship classes
- Economics courses
- Business education programs
- Financial literacy training
- STEM/CTE programs

### Suggested Activities:
1. **Business Competition**: Who can generate the most revenue?
2. **Market Analysis**: Study which products sell best
3. **Investment Challenge**: Best portfolio returns
4. **Case Studies**: Analyze successful student businesses
5. **Marketing Exercise**: Create compelling business descriptions

## 🔒 Security Note

This is an educational tool with basic authentication. For production use:
- Add proper password hashing
- Implement JWT tokens
- Add input validation
- Set up proper session management
- Use a real database (MongoDB, PostgreSQL, etc.)

## 📄 License

This project is for educational use only. Not for commercial purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Test with the demo accounts first

## 🎉 Have Fun!

This is a learning tool - encourage students to be creative with their businesses and experiment with different strategies!

---

**Made for educators and students to learn entrepreneurship, finance, and business management in a fun, interactive way!** 🚀
