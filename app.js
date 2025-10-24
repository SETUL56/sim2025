// Global state
let currentUser = null;
let currentBusiness = null;
let allBusinesses = [];
let marketData = { stocks: [], crypto: [] };
let userPortfolio = { stocks: {}, crypto: {} };
let selectedColor = '#667eea';

// API Base URL
const API_URL = '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupColorPicker();
    setupMarketUpdates();
});

// ========== AUTHENTICATION ==========

async function testConnection() {
    showToast('Testing server connection...');
    try {
        const response = await fetch(`${API_URL}/api/test/users`);
        const data = await response.json();
        
        console.log('Server test response:', data);
        
        let message = `✅ Server Connected!\n\n`;
        message += `Found ${data.total} users:\n`;
        data.users.forEach(u => {
            message += `• ${u.username} (${u.role})\n`;
        });
        
        alert(message + '\nCredentials:\n' + data.message);
        showToast('✅ Server is working! Use the credentials shown.', 'success');
    } catch (error) {
        console.error('Connection test failed:', error);
        alert('❌ Cannot connect to server!\n\nPlease check:\n1. Server is running\n2. No console errors (F12)\n3. Correct URL\n\nError: ' + error.message);
        showToast('❌ Server connection failed! Check console.', 'error');
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showToast('Please enter username and password', 'error');
        return;
    }

    console.log('Attempting login with username:', username);

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`Welcome, ${currentUser.name}!`);
            
            if (currentUser.role === 'teacher') {
                showTeacherDashboard();
            } else {
                showStudentDashboard();
            }
        } else {
            console.error('Login failed:', data.message);
            showToast(data.message || 'Invalid username or password. Try: teacher/teacher123 or student1/student1', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Connection error. Please check if the server is running.', 'error');
    }
}

async function register() {
    const name = document.getElementById('registerName').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!name || !username || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast('Account created successfully!');
            showStudentDashboard();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    currentBusiness = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('studentScreen').classList.remove('active');
    document.getElementById('teacherScreen').classList.remove('active');
    
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    
    showToast('Logged out successfully');
}

// ========== DASHBOARD MANAGEMENT ==========

async function showStudentDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('studentScreen').classList.add('active');
    
    document.getElementById('studentName').textContent = currentUser.name;
    await updateStudentBalance();
    await loadStudentBusiness();
    await loadMarketplace();
    await loadMarketData();
}

async function showTeacherDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('teacherScreen').classList.add('active');
    
    document.getElementById('teacherName').textContent = currentUser.name;
    await loadAdminData();
}

function showStudentSection(sectionName) {
    document.querySelectorAll('#studentScreen .section').forEach(s => s.classList.remove('active'));
    document.getElementById(`student-${sectionName}`).classList.add('active');
    
    document.querySelectorAll('#studentScreen .nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (sectionName === 'marketplace') {
        loadMarketplace();
    } else if (sectionName === 'trading') {
        renderTradingMarkets();
    } else if (sectionName === 'portfolio') {
        renderPortfolio();
    }
}

function showTeacherSection(sectionName) {
    document.querySelectorAll('#teacherScreen .section').forEach(s => s.classList.remove('active'));
    document.getElementById(`teacher-${sectionName}`).classList.add('active');
    
    document.querySelectorAll('#teacherScreen .nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

async function updateStudentBalance() {
    try {
        const response = await fetch(`${API_URL}/api/user/${currentUser.id}`);
        const userData = await response.json();
        currentUser.balance = userData.balance;
        document.getElementById('studentBalance').textContent = `💰 Balance: $${userData.balance.toFixed(2)}`;
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

// ========== BUSINESS MANAGEMENT ==========

async function loadStudentBusiness() {
    try {
        const response = await fetch(`${API_URL}/api/businesses/owner/${currentUser.id}`);
        const businesses = await response.json();
        
        if (businesses.length > 0) {
            currentBusiness = businesses[0];
            showBusinessDashboard();
        } else {
            document.getElementById('noBusiness').style.display = 'block';
            document.getElementById('businessDashboard').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading business:', error);
    }
}

function showBusinessDashboard() {
    document.getElementById('noBusiness').style.display = 'none';
    document.getElementById('businessDashboard').style.display = 'block';
    
    document.getElementById('businessTitle').textContent = currentBusiness.name;
    
    // Render stats
    const statsHTML = `
        <div class="stat-card">
            <h3>Total Revenue</h3>
            <div class="value">$${currentBusiness.revenue.toFixed(2)}</div>
        </div>
        <div class="stat-card secondary">
            <h3>Total Sales</h3>
            <div class="value">${currentBusiness.totalSales}</div>
        </div>
        <div class="stat-card">
            <h3>Products</h3>
            <div class="value">${currentBusiness.products?.length || 0}</div>
        </div>
    `;
    document.getElementById('businessStats').innerHTML = statsHTML;
    
    // Render products
    renderProducts();
    renderRecentSales();
}

function renderProducts() {
    const products = currentBusiness.products || [];
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No products yet. Add your first product!</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <span class="business-category">${product.category || 'product'}</span>
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <div class="price">$${product.price.toFixed(2)}</div>
            <div class="stats">
                <span>💰 Revenue: $${(product.revenue || 0).toFixed(2)}</span>
                <span>📦 Sales: ${product.sales || 0}</span>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="editProduct('${product.id}')" class="btn btn-secondary" style="flex: 1;">Edit</button>
                <button onclick="deleteProduct('${product.id}')" class="btn btn-danger" style="flex: 1;">Delete</button>
            </div>
        </div>
    `).join('');
}

async function renderRecentSales() {
    try {
        const response = await fetch(`${API_URL}/api/transactions/user/${currentUser.id}`);
        const transactions = await response.json();
        
        const sales = transactions.filter(t => t.type === 'purchase' && t.sellerId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        const container = document.getElementById('recentSales');
        
        if (sales.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No sales yet</p>';
            return;
        }
        
        const table = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales.map(sale => `
                        <tr>
                            <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
                            <td>${sale.productName}</td>
                            <td>${sale.buyerName}</td>
                            <td>${sale.quantity}</td>
                            <td>$${sale.totalAmount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = table;
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function showCreateBusiness() {
    if (currentBusiness) {
        // Edit mode
        document.getElementById('bizName').value = currentBusiness.name;
        document.getElementById('bizCategory').value = currentBusiness.category;
        document.getElementById('bizDescription').value = currentBusiness.description;
        document.getElementById('bizTagline').value = currentBusiness.tagline || '';
        selectedColor = currentBusiness.color || '#667eea';
        
        document.querySelectorAll('.color-option').forEach((opt, idx) => {
            opt.classList.remove('selected');
            if (opt.dataset.color === selectedColor) {
                opt.classList.add('selected');
            }
        });
    }
    
    document.getElementById('businessFormModal').classList.add('active');
}

function closeBusinessForm() {
    document.getElementById('businessFormModal').classList.remove('active');
    document.getElementById('businessForm').reset();
}

async function saveBusiness(event) {
    event.preventDefault();
    
    const businessData = {
        name: document.getElementById('bizName').value,
        category: document.getElementById('bizCategory').value,
        description: document.getElementById('bizDescription').value,
        tagline: document.getElementById('bizTagline').value,
        color: selectedColor,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        products: currentBusiness?.products || []
    };
    
    try {
        let response;
        if (currentBusiness) {
            // Update existing business
            response = await fetch(`${API_URL}/api/business/${currentBusiness.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessData)
            });
        } else {
            // Create new business
            response = await fetch(`${API_URL}/api/business`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentBusiness = data.business;
            showToast(currentBusiness.id ? '✅ Business updated!' : '🚀 Business created!');
            closeBusinessForm();
            showBusinessDashboard();
        } else {
            showToast('Failed to save business', 'error');
        }
    } catch (error) {
        console.error('Error saving business:', error);
        showToast('Failed to save business', 'error');
    }
}

function showAddProduct() {
    document.getElementById('productFormModal').classList.add('active');
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('active');
    document.getElementById('productForm').reset();
}

async function saveProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value
    };
    
    try {
        const response = await fetch(`${API_URL}/api/business/${currentBusiness.id}/product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Product added!');
            closeProductForm();
            await loadStudentBusiness();
        } else {
            showToast('Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/business/${currentBusiness.id}/product/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Product deleted');
            await loadStudentBusiness();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    }
}

// ========== MARKETPLACE ==========

async function loadMarketplace() {
    try {
        const response = await fetch(`${API_URL}/api/businesses`);
        allBusinesses = await response.json();
        filterAndRenderMarketplace();
    } catch (error) {
        console.error('Error loading marketplace:', error);
    }
}

function filterAndRenderMarketplace() {
    const search = document.getElementById('marketSearch')?.value.toLowerCase() || '';
    const category = document.getElementById('marketCategory')?.value || '';
    
    let filtered = allBusinesses.filter(b => {
        const matchesSearch = !search || 
            b.name.toLowerCase().includes(search) ||
            b.description.toLowerCase().includes(search);
        const matchesCategory = !category || b.category === category;
        return matchesSearch && matchesCategory;
    });
    
    const container = document.getElementById('marketplaceGrid');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px; grid-column: 1/-1;">No businesses found</p>';
        return;
    }
    
    container.innerHTML = filtered.map(business => `
        <div class="business-card" onclick="showBusinessLanding('${business.id}')">
            <div class="business-header" style="background: linear-gradient(135deg, ${business.color} 0%, #764ba2 100%);">
                <h3>${business.name}</h3>
                <div class="tagline">${business.tagline || ''}</div>
            </div>
            <div class="business-content">
                <span class="business-category">${business.category}</span>
                <p>${business.description}</p>
                <div class="business-stats">
                    <span>💰 $${business.revenue.toFixed(2)}</span>
                    <span>📦 ${business.totalSales} sales</span>
                    <span>🏷️ ${business.products?.length || 0} products</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function showBusinessLanding(businessId) {
    try {
        const response = await fetch(`${API_URL}/api/business/${businessId}`);
        const business = await response.json();
        
        const products = business.products || [];
        
        const content = `
            <div class="business-landing">
                <div class="landing-hero" style="background: linear-gradient(135deg, ${business.color} 0%, #764ba2 100%);">
                    <h1>${business.name}</h1>
                    <div class="tagline">${business.tagline || ''}</div>
                </div>
                
                <div class="landing-content">
                    <div class="landing-section">
                        <h2>About Us</h2>
                        <p style="font-size: 16px; line-height: 1.6;">${business.description}</p>
                        <div style="margin-top: 15px;">
                            <span class="business-category">${business.category}</span>
                            <span style="margin-left: 15px; color: #999;">By ${business.ownerName}</span>
                        </div>
                    </div>
                    
                    <div class="landing-section">
                        <h2>Our Products & Services</h2>
                        ${products.length === 0 ? '<p style="color: #999;">No products available yet</p>' : ''}
                        <div class="landing-products">
                            ${products.map(product => `
                                <div class="landing-product">
                                    <span class="category-badge">${product.category || 'product'}</span>
                                    <h3>${product.name}</h3>
                                    <p>${product.description}</p>
                                    <div class="price">$${product.price.toFixed(2)}</div>
                                    <div class="product-stats">
                                        <span>💰 Revenue: $${(product.revenue || 0).toFixed(2)}</span>
                                        <span>📦 ${product.sales || 0} sold</span>
                                    </div>
                                    <div class="quantity-selector">
                                        <button onclick="changeQuantity('${product.id}', -1)">-</button>
                                        <input type="number" id="qty-${product.id}" value="1" min="1" readonly>
                                        <button onclick="changeQuantity('${product.id}', 1)">+</button>
                                    </div>
                                    <button onclick="purchaseProduct('${businessId}', '${product.id}')" class="btn btn-primary" style="width: 100%;">
                                        🛒 Buy Now
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="landing-section">
                        <h2>Business Stats</h2>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>Total Revenue</h3>
                                <div class="value">$${business.revenue.toFixed(2)}</div>
                            </div>
                            <div class="stat-card secondary">
                                <h3>Total Sales</h3>
                                <div class="value">${business.totalSales}</div>
                            </div>
                            <div class="stat-card">
                                <h3>Products</h3>
                                <div class="value">${products.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('businessLandingContent').innerHTML = content;
        document.getElementById('businessLandingModal').classList.add('active');
    } catch (error) {
        console.error('Error loading business landing:', error);
        showToast('Failed to load business', 'error');
    }
}

function closeBusinessLanding() {
    document.getElementById('businessLandingModal').classList.remove('active');
}

function changeQuantity(productId, delta) {
    const input = document.getElementById(`qty-${productId}`);
    const currentValue = parseInt(input.value) || 1;
    const newValue = Math.max(1, currentValue + delta);
    input.value = newValue;
}

async function purchaseProduct(businessId, productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    try {
        const response = await fetch(`${API_URL}/api/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyerId: currentUser.id,
                businessId,
                productId,
                quantity
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ Purchase successful!`);
            currentUser.balance = data.newBalance;
            updateStudentBalance();
            closeBusinessLanding();
            loadMarketplace();
            
            if (currentBusiness) {
                await loadStudentBusiness();
            }
        } else {
            showToast(data.message || 'Purchase failed', 'error');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        showToast('Purchase failed', 'error');
    }
}

// ========== TRADING ==========

async function loadMarketData() {
    try {
        const response = await fetch(`${API_URL}/api/market`);
        marketData = await response.json();
        renderTradingMarkets();
    } catch (error) {
        console.error('Error loading market data:', error);
    }
}

function setupMarketUpdates() {
    setInterval(async () => {
        try {
            await fetch(`${API_URL}/api/market/update`, { method: 'POST' });
            await loadMarketData();
        } catch (error) {
            console.error('Error updating market:', error);
        }
    }, 10000); // Update every 10 seconds
}

function showTradingTab(tab) {
    document.querySelectorAll('.trading-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${tab}Tab`).classList.add('active');
    event.target.classList.add('active');
}

function renderTradingMarkets() {
    renderStocks();
    renderCrypto();
}

function renderStocks() {
    const container = document.getElementById('stocksList');
    if (!container) return;
    
    container.innerHTML = marketData.stocks.map(stock => `
        <div class="trading-item">
            <div class="trading-info">
                <div class="trading-symbol">${stock.symbol}</div>
                <div class="trading-name">${stock.name}</div>
                <div class="trading-price">$${stock.price.toFixed(2)}</div>
                <div class="trading-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '▲' : '▼'} ${Math.abs(stock.change).toFixed(2)}%
                </div>
            </div>
            <div class="trading-controls">
                <input type="number" id="stock-qty-${stock.symbol}" value="1" min="1">
                <button onclick="trade('stock', '${stock.symbol}', 'buy')" class="btn btn-primary">Buy</button>
                <button onclick="trade('stock', '${stock.symbol}', 'sell')" class="btn btn-danger">Sell</button>
            </div>
        </div>
    `).join('');
}

function renderCrypto() {
    const container = document.getElementById('cryptoList');
    if (!container) return;
    
    container.innerHTML = marketData.crypto.map(crypto => `
        <div class="trading-item">
            <div class="trading-info">
                <div class="trading-symbol">${crypto.symbol}</div>
                <div class="trading-name">${crypto.name}</div>
                <div class="trading-price">$${crypto.price.toFixed(2)}</div>
                <div class="trading-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
                    ${crypto.change >= 0 ? '▲' : '▼'} ${Math.abs(crypto.change).toFixed(2)}%
                </div>
            </div>
            <div class="trading-controls">
                <input type="number" id="crypto-qty-${crypto.symbol}" value="1" min="1">
                <button onclick="trade('crypto', '${crypto.symbol}', 'buy')" class="btn btn-primary">Buy</button>
                <button onclick="trade('crypto', '${crypto.symbol}', 'sell')" class="btn btn-danger">Sell</button>
            </div>
        </div>
    `).join('');
}

async function trade(assetType, symbol, action) {
    const quantityInput = document.getElementById(`${assetType}-qty-${symbol}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    try {
        const response = await fetch(`${API_URL}/api/trade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                assetType,
                symbol,
                action,
                quantity
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`✅ ${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol}`);
            currentUser.balance = data.newBalance;
            updateStudentBalance();
            
            // Update portfolio
            if (!userPortfolio[assetType + 's']) {
                userPortfolio[assetType + 's'] = {};
            }
            
            if (action === 'buy') {
                if (!userPortfolio[assetType + 's'][symbol]) {
                    userPortfolio[assetType + 's'][symbol] = { quantity: 0, avgPrice: 0 };
                }
                const current = userPortfolio[assetType + 's'][symbol];
                const totalQuantity = current.quantity + quantity;
                current.avgPrice = ((current.avgPrice * current.quantity) + (data.transaction.price * quantity)) / totalQuantity;
                current.quantity = totalQuantity;
            } else {
                if (userPortfolio[assetType + 's'][symbol]) {
                    userPortfolio[assetType + 's'][symbol].quantity -= quantity;
                    if (userPortfolio[assetType + 's'][symbol].quantity <= 0) {
                        delete userPortfolio[assetType + 's'][symbol];
                    }
                }
            }
        } else {
            showToast(data.message || 'Trade failed', 'error');
        }
    } catch (error) {
        console.error('Trade error:', error);
        showToast('Trade failed', 'error');
    }
}

async function renderPortfolio() {
    try {
        const response = await fetch(`${API_URL}/api/transactions/user/${currentUser.id}`);
        const transactions = await response.json();
        
        // Calculate holdings from transactions
        const holdings = {};
        
        transactions.forEach(t => {
            if (t.type === 'buy' || t.type === 'sell') {
                const key = `${t.assetType}-${t.symbol}`;
                if (!holdings[key]) {
                    holdings[key] = {
                        assetType: t.assetType,
                        symbol: t.symbol,
                        name: t.assetName,
                        quantity: 0,
                        totalCost: 0
                    };
                }
                
                if (t.type === 'buy') {
                    holdings[key].quantity += t.quantity;
                    holdings[key].totalCost += t.totalAmount;
                } else {
                    holdings[key].quantity -= t.quantity;
                    holdings[key].totalCost -= t.totalAmount;
                }
            }
        });
        
        // Remove zero holdings
        Object.keys(holdings).forEach(key => {
            if (holdings[key].quantity <= 0) {
                delete holdings[key];
            }
        });
        
        // Calculate portfolio value
        let totalValue = currentUser.balance;
        const holdingsArray = Object.values(holdings);
        
        holdingsArray.forEach(holding => {
            const currentAsset = holding.assetType === 'stock' 
                ? marketData.stocks.find(s => s.symbol === holding.symbol)
                : marketData.crypto.find(c => c.symbol === holding.symbol);
            
            if (currentAsset) {
                totalValue += currentAsset.price * holding.quantity;
            }
        });
        
        // Render stats
        const statsHTML = `
            <div class="stat-card">
                <h3>Cash Balance</h3>
                <div class="value">$${currentUser.balance.toFixed(2)}</div>
            </div>
            <div class="stat-card secondary">
                <h3>Investments</h3>
                <div class="value">$${(totalValue - currentUser.balance).toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Total Portfolio</h3>
                <div class="value">$${totalValue.toFixed(2)}</div>
            </div>
        `;
        document.getElementById('portfolioStats').innerHTML = statsHTML;
        
        // Render holdings
        const holdingsContainer = document.getElementById('holdingsList');
        
        if (holdingsArray.length === 0) {
            holdingsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No investments yet</p>';
        } else {
            const table = `
                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Avg Price</th>
                            <th>Current Price</th>
                            <th>Value</th>
                            <th>P/L</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${holdingsArray.map(holding => {
                            const currentAsset = holding.assetType === 'stock' 
                                ? marketData.stocks.find(s => s.symbol === holding.symbol)
                                : marketData.crypto.find(c => c.symbol === holding.symbol);
                            
                            const avgPrice = holding.totalCost / holding.quantity;
                            const currentValue = currentAsset ? currentAsset.price * holding.quantity : 0;
                            const pl = currentValue - holding.totalCost;
                            const plPercent = (pl / holding.totalCost) * 100;
                            
                            return `
                                <tr>
                                    <td><strong>${holding.symbol}</strong><br><small>${holding.name}</small></td>
                                    <td>${holding.assetType}</td>
                                    <td>${holding.quantity}</td>
                                    <td>$${avgPrice.toFixed(2)}</td>
                                    <td>$${currentAsset ? currentAsset.price.toFixed(2) : '0.00'}</td>
                                    <td>$${currentValue.toFixed(2)}</td>
                                    <td style="color: ${pl >= 0 ? 'var(--secondary)' : 'var(--danger)'}; font-weight: bold;">
                                        ${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}<br>
                                        <small>(${plPercent.toFixed(2)}%)</small>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            holdingsContainer.innerHTML = table;
        }
        
        // Render transaction history
        const historyContainer = document.getElementById('transactionHistory');
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);
        
        if (recentTransactions.length === 0) {
            historyContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No transactions yet</p>';
        } else {
            const table = `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Details</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentTransactions.map(t => {
                            let details = '';
                            if (t.type === 'purchase') {
                                details = `${t.quantity}x ${t.productName} from ${t.businessName}`;
                            } else {
                                details = `${t.quantity} ${t.symbol} (${t.assetType})`;
                            }
                            
                            return `
                                <tr>
                                    <td>${new Date(t.timestamp).toLocaleString()}</td>
                                    <td><span class="business-category">${t.type}</span></td>
                                    <td>${details}</td>
                                    <td style="color: ${t.type === 'sell' ? 'var(--secondary)' : 'var(--danger)'}; font-weight: bold;">
                                        ${t.type === 'sell' ? '+' : '-'}$${t.totalAmount.toFixed(2)}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            historyContainer.innerHTML = table;
        }
    } catch (error) {
        console.error('Error rendering portfolio:', error);
    }
}

// ========== TEACHER DASHBOARD ==========

async function loadAdminData() {
    try {
        const [statsRes, usersRes, businessesRes, transactionsRes] = await Promise.all([
            fetch(`${API_URL}/api/admin/stats`),
            fetch(`${API_URL}/api/admin/users`),
            fetch(`${API_URL}/api/businesses`),
            fetch(`${API_URL}/api/transactions`)
        ]);
        
        const stats = await statsRes.json();
        const users = await usersRes.json();
        const businesses = await businessesRes.json();
        const transactions = await transactionsRes.json();
        
        renderAdminStats(stats);
        renderLeaderboard(businesses);
        renderStudentsList(users.filter(u => u.role === 'student'), transactions);
        renderAllBusinesses(businesses);
        renderAllTransactions(transactions);
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

function renderAdminStats(stats) {
    const html = `
        <div class="stat-card">
            <h3>Total Students</h3>
            <div class="value">${stats.totalStudents}</div>
        </div>
        <div class="stat-card">
            <h3>Total Businesses</h3>
            <div class="value">${stats.totalBusinesses}</div>
        </div>
        <div class="stat-card secondary">
            <h3>Total Revenue</h3>
            <div class="value">$${stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Transactions</h3>
            <div class="value">${stats.totalTransactions}</div>
        </div>
        <div class="stat-card">
            <h3>Trades</h3>
            <div class="value">${stats.totalTrades}</div>
        </div>
        <div class="stat-card">
            <h3>Top Category</h3>
            <div class="value" style="font-size: 20px; text-transform: capitalize;">${stats.mostPopularCategory}</div>
        </div>
    `;
    document.getElementById('adminStats').innerHTML = html;
}

function renderLeaderboard(businesses) {
    const sorted = businesses
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Business</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Sales</th>
                    <th>Products</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((b, idx) => `
                    <tr>
                        <td><strong>${idx + 1}</strong></td>
                        <td>${b.name}</td>
                        <td>${b.ownerName}</td>
                        <td>${b.category}</td>
                        <td><strong>$${b.revenue.toFixed(2)}</strong></td>
                        <td>${b.totalSales}</td>
                        <td>${b.products?.length || 0}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('leaderboard').innerHTML = html;
}

function renderStudentsList(students, transactions) {
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Balance</th>
                    <th>Businesses</th>
                    <th>Purchases</th>
                    <th>Trades</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => {
                    const purchases = transactions.filter(t => t.type === 'purchase' && t.buyerId === student.id).length;
                    const trades = transactions.filter(t => (t.type === 'buy' || t.type === 'sell') && t.userId === student.id).length;
                    
                    return `
                        <tr>
                            <td><strong>${student.name}</strong></td>
                            <td>$${student.balance.toFixed(2)}</td>
                            <td>-</td>
                            <td>${purchases}</td>
                            <td>${trades}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('studentsList').innerHTML = html;
}

function renderAllBusinesses(businesses) {
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>Category</th>
                    <th>Products</th>
                    <th>Revenue</th>
                    <th>Sales</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                ${businesses.map(b => `
                    <tr>
                        <td><strong>${b.name}</strong></td>
                        <td>${b.ownerName}</td>
                        <td>${b.category}</td>
                        <td>${b.products?.length || 0}</td>
                        <td>$${b.revenue.toFixed(2)}</td>
                        <td>${b.totalSales}</td>
                        <td>${new Date(b.created).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('allBusinesses').innerHTML = html;
}

function renderAllTransactions(transactions) {
    const sorted = transactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50);
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>From/To</th>
                    <th>Details</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(t => {
                    let details = '';
                    let parties = '';
                    
                    if (t.type === 'purchase') {
                        details = `${t.quantity}x ${t.productName}`;
                        parties = `${t.buyerName} → ${t.sellerName}`;
                    } else {
                        details = `${t.quantity} ${t.symbol}`;
                        parties = t.userName;
                    }
                    
                    return `
                        <tr>
                            <td>${new Date(t.timestamp).toLocaleString()}</td>
                            <td><span class="business-category">${t.type}</span></td>
                            <td>${parties}</td>
                            <td>${details}</td>
                            <td><strong>$${t.totalAmount.toFixed(2)}</strong></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('allTransactions').innerHTML = html;
}

async function exportReport() {
    try {
        const [statsRes, usersRes, businessesRes, transactionsRes] = await Promise.all([
            fetch(`${API_URL}/api/admin/stats`),
            fetch(`${API_URL}/api/admin/users`),
            fetch(`${API_URL}/api/businesses`),
            fetch(`${API_URL}/api/transactions`)
        ]);
        
        const report = {
            generatedDate: new Date().toISOString(),
            stats: await statsRes.json(),
            users: await usersRes.json(),
            businesses: await businessesRes.json(),
            transactions: await transactionsRes.json()
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entrepreneur-report-${Date.now()}.json`;
        a.click();
        
        showToast('📊 Report exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export report', 'error');
    }
}

async function refreshData() {
    showToast('Refreshing data...');
    await loadAdminData();
    showToast('✅ Data refreshed!');
}

async function resetSimulation() {
    if (!confirm('⚠️ Are you sure? This will reset the entire simulation and cannot be undone!')) return;
    if (!confirm('Final confirmation: All student data will be lost. Continue?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/admin/reset`, { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Simulation reset successfully!');
            setTimeout(() => location.reload(), 2000);
        } else {
            showToast('Reset failed', 'error');
        }
    } catch (error) {
        console.error('Reset error:', error);
        showToast('Reset failed', 'error');
    }
}

// ========== UTILITIES ==========

function setupColorPicker() {
    document.querySelectorAll('.color-option').forEach((option, index) => {
        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0'];
        option.dataset.color = colors[index];
        
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color;
        });
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Setup search and filter listeners
document.addEventListener('DOMContentLoaded', () => {
    const marketSearch = document.getElementById('marketSearch');
    const marketCategory = document.getElementById('marketCategory');
    
    if (marketSearch) {
        marketSearch.addEventListener('input', filterAndRenderMarketplace);
    }
    
    if (marketCategory) {
        marketCategory.addEventListener('change', filterAndRenderMarketplace);
    }
});
