const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BUSINESSES_FILE = path.join(DATA_DIR, 'businesses.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const MARKET_FILE = path.join(DATA_DIR, 'market.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data files
function initializeDataFiles() {
    const defaultUsers = [
        {
            id: 'teacher-1',
            username: 'teacher',
            password: 'teacher123',
            role: 'teacher',
            name: 'Mr. Smith',
            balance: 0
        },
        {
            id: 'student-1',
            username: 'student1',
            password: 'student1',
            role: 'student',
            name: 'Alex Johnson',
            balance: 10000
        },
        {
            id: 'student-2',
            username: 'student2',
            password: 'student2',
            role: 'student',
            name: 'Maria Garcia',
            balance: 10000
        },
        {
            id: 'student-3',
            username: 'student3',
            password: 'student3',
            role: 'student',
            name: 'James Chen',
            balance: 10000
        }
    ];
    
    // Always write default users on startup to ensure they exist
    if (!fs.existsSync(USERS_FILE)) {
        console.log('Creating users file with default accounts...');
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    } else {
        // Check if default users exist, if not add them
        const existingUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        let updated = false;
        
        defaultUsers.forEach(defaultUser => {
            const exists = existingUsers.find(u => u.username === defaultUser.username);
            if (!exists) {
                console.log(`Adding missing default user: ${defaultUser.username}`);
                existingUsers.push(defaultUser);
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(USERS_FILE, JSON.stringify(existingUsers, null, 2));
        }
    }

    if (!fs.existsSync(BUSINESSES_FILE)) {
        fs.writeFileSync(BUSINESSES_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(TRANSACTIONS_FILE)) {
        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(MARKET_FILE)) {
        const defaultMarket = {
            stocks: [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.5 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.30, change: -1.2 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.80, change: 3.7 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.90, change: 1.8 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.20, change: -4.5 },
                { symbol: 'META', name: 'Meta Platforms', price: 512.60, change: 2.9 },
                { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.30, change: 5.2 },
                { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.40, change: 1.1 }
            ],
            crypto: [
                { symbol: 'BTC', name: 'Bitcoin', price: 68500.00, change: 3.4 },
                { symbol: 'ETH', name: 'Ethereum', price: 3800.00, change: 2.1 },
                { symbol: 'BNB', name: 'Binance Coin', price: 625.50, change: -0.8 },
                { symbol: 'SOL', name: 'Solana', price: 145.20, change: 6.7 },
                { symbol: 'ADA', name: 'Cardano', price: 0.65, change: 1.5 },
                { symbol: 'DOT', name: 'Polkadot', price: 7.85, change: -2.3 },
                { symbol: 'MATIC', name: 'Polygon', price: 0.92, change: 4.2 }
            ]
        };
        fs.writeFileSync(MARKET_FILE, JSON.stringify(defaultMarket, null, 2));
    }
}

initializeDataFiles();

// Helper functions
function readJSON(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API Routes

// Authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt - Username: ${username}`);
    
    const users = readJSON(USERS_FILE);
    console.log(`Total users in database: ${users.length}`);
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        console.log(`✅ Login successful for: ${username} (${user.role})`);
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        console.log(`❌ Login failed for: ${username}`);
        const userExists = users.find(u => u.username === username);
        if (userExists) {
            console.log('Username exists but password incorrect');
        } else {
            console.log('Username not found');
        }
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Test endpoint to check what users exist (REMOVE IN PRODUCTION)
app.get('/api/test/users', (req, res) => {
    const users = readJSON(USERS_FILE);
    const userList = users.map(u => ({
        username: u.username,
        role: u.role,
        name: u.name
    }));
    res.json({ 
        total: users.length,
        users: userList,
        message: 'Default logins: teacher/teacher123 or student1/student1'
    });
});

// Register new student
app.post('/api/register', (req, res) => {
    const { username, password, name } = req.body;
    const users = readJSON(USERS_FILE);
    
    if (users.find(u => u.username === username)) {
        return res.json({ success: false, message: 'Username already exists' });
    }
    
    const newUser = {
        id: uuidv4(),
        username,
        password,
        name,
        role: 'student',
        balance: 10000
    };
    
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// Get user data
app.get('/api/user/:userId', (req, res) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === req.params.userId);
    
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Update user balance
app.put('/api/user/:userId/balance', (req, res) => {
    const { balance } = req.body;
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.params.userId);
    
    if (userIndex !== -1) {
        users[userIndex].balance = balance;
        writeJSON(USERS_FILE, users);
        res.json({ success: true, balance: users[userIndex].balance });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Get all businesses
app.get('/api/businesses', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    res.json(businesses);
});

// Get single business
app.get('/api/business/:businessId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const business = businesses.find(b => b.id === req.params.businessId);
    
    if (business) {
        res.json(business);
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Get businesses by owner
app.get('/api/businesses/owner/:userId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const userBusinesses = businesses.filter(b => b.ownerId === req.params.userId);
    res.json(userBusinesses);
});

// Create business
app.post('/api/business', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    
    const newBusiness = {
        id: uuidv4(),
        ...req.body,
        revenue: 0,
        totalSales: 0,
        created: new Date().toISOString()
    };
    
    businesses.push(newBusiness);
    writeJSON(BUSINESSES_FILE, businesses);
    res.json({ success: true, business: newBusiness });
});

// Update business
app.put('/api/business/:businessId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const businessIndex = businesses.findIndex(b => b.id === req.params.businessId);
    
    if (businessIndex !== -1) {
        businesses[businessIndex] = {
            ...businesses[businessIndex],
            ...req.body,
            id: req.params.businessId
        };
        writeJSON(BUSINESSES_FILE, businesses);
        res.json({ success: true, business: businesses[businessIndex] });
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Delete business
app.delete('/api/business/:businessId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const filteredBusinesses = businesses.filter(b => b.id !== req.params.businessId);
    
    if (businesses.length !== filteredBusinesses.length) {
        writeJSON(BUSINESSES_FILE, filteredBusinesses);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Add product to business
app.post('/api/business/:businessId/product', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const businessIndex = businesses.findIndex(b => b.id === req.params.businessId);
    
    if (businessIndex !== -1) {
        const newProduct = {
            id: uuidv4(),
            ...req.body,
            sales: 0,
            revenue: 0
        };
        
        if (!businesses[businessIndex].products) {
            businesses[businessIndex].products = [];
        }
        
        businesses[businessIndex].products.push(newProduct);
        writeJSON(BUSINESSES_FILE, businesses);
        res.json({ success: true, product: newProduct });
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Update product
app.put('/api/business/:businessId/product/:productId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const businessIndex = businesses.findIndex(b => b.id === req.params.businessId);
    
    if (businessIndex !== -1) {
        const productIndex = businesses[businessIndex].products.findIndex(p => p.id === req.params.productId);
        
        if (productIndex !== -1) {
            businesses[businessIndex].products[productIndex] = {
                ...businesses[businessIndex].products[productIndex],
                ...req.body,
                id: req.params.productId
            };
            writeJSON(BUSINESSES_FILE, businesses);
            res.json({ success: true, product: businesses[businessIndex].products[productIndex] });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Delete product
app.delete('/api/business/:businessId/product/:productId', (req, res) => {
    const businesses = readJSON(BUSINESSES_FILE);
    const businessIndex = businesses.findIndex(b => b.id === req.params.businessId);
    
    if (businessIndex !== -1) {
        businesses[businessIndex].products = businesses[businessIndex].products.filter(
            p => p.id !== req.params.productId
        );
        writeJSON(BUSINESSES_FILE, businesses);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Business not found' });
    }
});

// Purchase product
app.post('/api/purchase', (req, res) => {
    const { buyerId, businessId, productId, quantity } = req.body;
    
    const users = readJSON(USERS_FILE);
    const businesses = readJSON(BUSINESSES_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);
    
    const buyer = users.find(u => u.id === buyerId);
    const business = businesses.find(b => b.id === businessId);
    
    if (!buyer || !business) {
        return res.status(404).json({ error: 'Buyer or business not found' });
    }
    
    const product = business.products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const totalCost = product.price * quantity;
    
    if (buyer.balance < totalCost) {
        return res.json({ success: false, message: 'Insufficient funds' });
    }
    
    // Update buyer balance
    const buyerIndex = users.findIndex(u => u.id === buyerId);
    users[buyerIndex].balance -= totalCost;
    
    // Update seller balance
    const sellerIndex = users.findIndex(u => u.id === business.ownerId);
    if (sellerIndex !== -1) {
        users[sellerIndex].balance += totalCost;
    }
    
    // Update business stats
    const businessIndex = businesses.findIndex(b => b.id === businessId);
    businesses[businessIndex].revenue += totalCost;
    businesses[businessIndex].totalSales += quantity;
    
    // Update product stats
    const productIndex = businesses[businessIndex].products.findIndex(p => p.id === productId);
    businesses[businessIndex].products[productIndex].sales += quantity;
    businesses[businessIndex].products[productIndex].revenue += totalCost;
    
    // Create transaction
    const transaction = {
        id: uuidv4(),
        type: 'purchase',
        buyerId,
        buyerName: buyer.name,
        sellerId: business.ownerId,
        sellerName: business.ownerName,
        businessId,
        businessName: business.name,
        productId,
        productName: product.name,
        quantity,
        pricePerUnit: product.price,
        totalAmount: totalCost,
        timestamp: new Date().toISOString()
    };
    
    transactions.push(transaction);
    
    writeJSON(USERS_FILE, users);
    writeJSON(BUSINESSES_FILE, businesses);
    writeJSON(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, transaction, newBalance: users[buyerIndex].balance });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    const transactions = readJSON(TRANSACTIONS_FILE);
    res.json(transactions);
});

// Get user transactions
app.get('/api/transactions/user/:userId', (req, res) => {
    const transactions = readJSON(TRANSACTIONS_FILE);
    const userTransactions = transactions.filter(
        t => t.buyerId === req.params.userId || t.sellerId === req.params.userId
    );
    res.json(userTransactions);
});

// Market data (stocks and crypto)
app.get('/api/market', (req, res) => {
    const market = readJSON(MARKET_FILE);
    res.json(market);
});

// Update market prices (simulated fluctuation)
app.post('/api/market/update', (req, res) => {
    const market = readJSON(MARKET_FILE);
    
    market.stocks.forEach(stock => {
        const changePercent = (Math.random() - 0.5) * 2;
        stock.price *= (1 + changePercent / 100);
        stock.change = changePercent;
    });
    
    market.crypto.forEach(crypto => {
        const changePercent = (Math.random() - 0.5) * 4;
        crypto.price *= (1 + changePercent / 100);
        crypto.change = changePercent;
    });
    
    writeJSON(MARKET_FILE, market);
    res.json(market);
});

// Trading
app.post('/api/trade', (req, res) => {
    const { userId, assetType, symbol, action, quantity } = req.body;
    
    const users = readJSON(USERS_FILE);
    const market = readJSON(MARKET_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const asset = assetType === 'stock' 
        ? market.stocks.find(s => s.symbol === symbol)
        : market.crypto.find(c => c.symbol === symbol);
    
    if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
    }
    
    const totalCost = asset.price * quantity;
    
    if (action === 'buy') {
        if (users[userIndex].balance < totalCost) {
            return res.json({ success: false, message: 'Insufficient funds' });
        }
        users[userIndex].balance -= totalCost;
    } else if (action === 'sell') {
        users[userIndex].balance += totalCost;
    }
    
    const transaction = {
        id: uuidv4(),
        type: action === 'buy' ? 'buy' : 'sell',
        userId,
        userName: users[userIndex].name,
        assetType,
        symbol,
        assetName: asset.name,
        quantity,
        price: asset.price,
        totalAmount: totalCost,
        timestamp: new Date().toISOString()
    };
    
    transactions.push(transaction);
    
    writeJSON(USERS_FILE, users);
    writeJSON(TRANSACTIONS_FILE, transactions);
    
    res.json({ success: true, transaction, newBalance: users[userIndex].balance });
});

// Admin: Get all users
app.get('/api/admin/users', (req, res) => {
    const users = readJSON(USERS_FILE);
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
});

// Admin: Get statistics
app.get('/api/admin/stats', (req, res) => {
    const users = readJSON(USERS_FILE);
    const businesses = readJSON(BUSINESSES_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);
    
    const totalRevenue = businesses.reduce((sum, b) => sum + b.revenue, 0);
    const totalTransactions = transactions.filter(t => t.type === 'purchase').length;
    const totalTrades = transactions.filter(t => t.type === 'buy' || t.type === 'sell').length;
    
    const categoryCount = {};
    businesses.forEach(b => {
        categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
    });
    
    const mostPopularCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, Object.keys(categoryCount)[0] || 'None');
    
    res.json({
        totalStudents: users.filter(u => u.role === 'student').length,
        totalBusinesses: businesses.length,
        totalRevenue,
        totalTransactions,
        totalTrades,
        mostPopularCategory,
        categoryBreakdown: categoryCount
    });
});

// Admin: Reset simulation
app.post('/api/admin/reset', (req, res) => {
    // Backup current data
    const timestamp = Date.now();
    const backupDir = path.join(DATA_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupDir);
    
    fs.copyFileSync(USERS_FILE, path.join(backupDir, 'users.json'));
    fs.copyFileSync(BUSINESSES_FILE, path.join(backupDir, 'businesses.json'));
    fs.copyFileSync(TRANSACTIONS_FILE, path.join(backupDir, 'transactions.json'));
    
    // Reset data
    const users = readJSON(USERS_FILE);
    users.forEach(user => {
        if (user.role === 'student') {
            user.balance = 10000;
        }
    });
    
    writeJSON(USERS_FILE, users);
    writeJSON(BUSINESSES_FILE, []);
    writeJSON(TRANSACTIONS_FILE, []);
    
    res.json({ success: true, message: 'Simulation reset successfully' });
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 Entrepreneur Simulator Server Started!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log('');
    console.log('📚 DEFAULT LOGIN CREDENTIALS:');
    console.log('');
    console.log('   👨‍🏫 TEACHER LOGIN:');
    console.log('   Username: teacher');
    console.log('   Password: teacher123');
    console.log('');
    console.log('   👨‍🎓 STUDENT LOGIN (Demo Account):');
    console.log('   Username: student1');
    console.log('   Password: student1');
    console.log('');
    console.log('   Other demo students: student2/student2, student3/student3');
    console.log('');
    console.log('🔧 TROUBLESHOOTING:');
    console.log(`   Visit: http://localhost:${PORT}/api/test/users`);
    console.log('   To see all available users');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Ready for students! Share the URL with your class.');
    console.log('═══════════════════════════════════════════════════════════════');
});
