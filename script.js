// ========== 购物车数据 ==========
let cartItems = JSON.parse(localStorage.getItem('nutribiteCart')) || [];

// ========== 通知 ==========
function showNotification(message) {
    const notification = document.getElementById('notification');
    document.getElementById('notificationText').textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// ========== 更新购物车计数 ==========
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
    localStorage.setItem('nutribiteCart', JSON.stringify(cartItems));
}

// ========== 计算购物车总价 ==========
function calculateCartTotal() {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

// ========== 渲染购物车页面 ==========
function renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some healthy meal bowls to get started!</p>
                <button class="cta-button" id="shopNowFromCart" style="background: var(--primary-green); color: white;">Continue Shopping</button>
            </div>
        `;
        document.getElementById('shopNowFromCart')?.addEventListener('click', () => switchPage('products'));
        return;
    }
    
    let html = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    cartItems.forEach((item, index) => {
        let productImage = 'images/product-chicken.jpg';
        
        if (item.name.includes('Teriyaki')) {
            productImage = 'images/product-teriyaki.jpg';
        } else if (item.name.includes('Sambal')) {
            productImage = 'images/product-sambal.jpg';
        } else if (item.name.includes('Veggie')) {
            productImage = 'images/product-veggie.jpg';
        } else if (item.name.includes('Rendang')) {
            productImage = 'images/product-rendang.jpg';
        } else if (item.name.includes('Salmon')) {
            productImage = 'images/product-salmon.jpg';
        }
        
        html += `
            <tr>
                <td>
                    <div class="cart-product">
                        <div class="cart-product-image" style="background-image: url('${productImage}');"></div>
                        <div>
                            <h4 style="margin-bottom: 5px;">${item.name}</h4>
                            <p style="color: var(--text-light); font-size: 0.9rem;">NutriBite • Ready-to-Heat</p>
                        </div>
                    </div>
                </td>
                <td>RM${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 'decrease')">−</button>
                        <span class="quantity">${item.quantity || 1}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 'increase')">+</button>
                    </div>
                </td>
                <td style="font-weight: 700;">RM${((item.quantity || 1) * item.price).toFixed(2)}</td>
                <td>
                    <span class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i> Remove
                    </span>
                </td>
            </tr>
        `;
    });
    
    const subtotal = calculateCartTotal();
    html += `
            </tbody>
        </table>
        <div class="cart-summary">
            <div>
                <h3>Subtotal: <span class="cart-total">RM${subtotal.toFixed(2)}</span></h3>
            </div>
            <div class="cart-actions">
                <button class="cart-btn continue-btn" onclick="switchPage('products')">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </button>
                <button class="cart-btn checkout-btn" onclick="switchPage('checkout')">
                    Proceed to Checkout <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    
    cartContainer.innerHTML = html;
}

// ========== 更新数量 ==========
window.updateQuantity = function(index, action) {
    if (action === 'increase') {
        cartItems[index].quantity = (cartItems[index].quantity || 1) + 1;
    } else if (action === 'decrease') {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
        } else {
            cartItems.splice(index, 1);
        }
    }
    updateCartCount();
    renderCart();
    updateOrderSummary();
};

// ========== 移除商品 ==========
window.removeFromCart = function(index) {
    cartItems.splice(index, 1);
    updateCartCount();
    renderCart();
    updateOrderSummary();
    showNotification('Item removed from cart');
};

// ========== 更新订单摘要 ==========
function updateOrderSummary() {
    const summaryItems = document.getElementById('orderSummaryItems');
    if (!summaryItems) return;
    
    if (cartItems.length === 0) {
        summaryItems.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Your cart is empty</p>';
        document.getElementById('summarySubtotal').textContent = 'RM0.00';
        document.getElementById('summaryTotal').textContent = 'RM6.00';
        return;
    }
    
    let html = '';
    cartItems.forEach(item => {
        html += `
            <div class="summary-item">
                <span>${item.name} x${item.quantity || 1}</span>
                <span>RM${((item.quantity || 1) * item.price).toFixed(2)}</span>
            </div>
        `;
    });
    
    summaryItems.innerHTML = html;
    
    const subtotal = calculateCartTotal();
    document.getElementById('summarySubtotal').textContent = `RM${subtotal.toFixed(2)}`;
    
    const discountRow = document.getElementById('discountRow');
    if (discountRow && discountRow.style.display === 'flex') {
        const discount = subtotal * 0.2;
        document.getElementById('discountAmount').textContent = `-RM${discount.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `RM${(subtotal + 6 - discount).toFixed(2)}`;
    } else {
        document.getElementById('summaryTotal').textContent = `RM${(subtotal + 6).toFixed(2)}`;
    }
}

// ========== 添加到购物车 ==========
function addToCart(productName, price) {
    const existingItem = cartItems.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cartItems.push({ name: productName, price: price, quantity: 1 });
    }
    updateCartCount();
    showNotification(`✅ ${productName} added to cart!`);
}

// ========== 下载收据 ==========
function downloadReceipt() {
    if (cartItems.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const name = document.getElementById('fullName')?.value || 'Customer';
    const email = document.getElementById('email')?.value || 'N/A';
    const phone = document.getElementById('phone')?.value || 'N/A';
    const address = document.getElementById('address')?.value || 'N/A';
    const city = document.getElementById('city')?.value || 'N/A';
    const state = document.getElementById('state')?.value || 'N/A';
    const postcode = document.getElementById('postcode')?.value || 'N/A';
    
    const subtotal = calculateCartTotal();
    const deliveryFee = 6;
    const discount = document.getElementById('discountRow')?.style.display === 'flex' ? subtotal * 0.2 : 0;
    const total = subtotal + deliveryFee - discount;
    
    const orderId = 'NB' + Date.now();
    const date = new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });
    
    let receiptContent = `═══════════════════════════════════════════
                   NUTRIBITE MALAYSIA
           Fresh. Balanced. Ready in Minutes.
═══════════════════════════════════════════

ORDER RECEIPT
───────────────────────────────────────────
Order ID: ${orderId}
Date: ${date}
Payment Status: Paid

CUSTOMER DETAILS
───────────────────────────────────────────
Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}, ${city}, ${postcode}, ${state}

ORDER ITEMS
───────────────────────────────────────────\n`;
    
    cartItems.forEach(item => {
        receiptContent += `${item.name} x${item.quantity || 1} - RM${((item.quantity || 1) * item.price).toFixed(2)}\n`;
    });
    
    receiptContent += `\n───────────────────────────────────────────
Subtotal: RM${subtotal.toFixed(2)}
Delivery Fee: RM${deliveryFee.toFixed(2)}`;
    
    if (discount > 0) {
        receiptContent += `\nDiscount (NUTRI20): -RM${discount.toFixed(2)}`;
    }
    
    receiptContent += `\n───────────────────────────────────────────
TOTAL: RM${total.toFixed(2)}

Payment Method: Online Banking

Thank you for choosing NutriBite!
We hope you enjoy your meal.

📧 support@nutribite.com
📱 +60 3-1234 5678
🌐 www.nutribite.com

───────────────────────────────────────────
`;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NutriBite_Receipt_${orderId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Receipt downloaded successfully!');
}

// ========== 页面切换 ==========
function switchPage(pageId) {
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'cart') renderCart();
    if (pageId === 'checkout') {
        updateOrderSummary();
        // 重置支付方式选择
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        document.getElementById('creditCardForm').style.display = 'none';
        document.getElementById('onlineBankingForm').style.display = 'none';
        document.getElementById('ewalletForm').style.display = 'none';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 视频控制器 ==========
function initVideoPlayer() {
    const video = document.getElementById('nutribiteVideo');
    if (!video) return;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    video.addEventListener('loadedmetadata', function() {
        timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
    });
    
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    stopBtn.addEventListener('click', function() {
        video.pause();
        video.currentTime = 0;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    volumeSlider.addEventListener('input', function() {
        video.volume = this.value;
    });
    
    video.addEventListener('timeupdate', function() {
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });
    
    fullscreenBtn.addEventListener('click', function() {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });
    
    video.addEventListener('ended', function() {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

// ========== 支付方式逻辑 ==========
function initPaymentMethods() {
    // 支付方式选择
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            document.getElementById('creditCardForm').style.display = 'none';
            document.getElementById('onlineBankingForm').style.display = 'none';
            document.getElementById('ewalletForm').style.display = 'none';
            
            const methodType = this.getAttribute('data-method');
            if (methodType === 'credit') {
                document.getElementById('creditCardForm').style.display = 'block';
            } else if (methodType === 'online') {
                document.getElementById('onlineBankingForm').style.display = 'block';
            } else if (methodType === 'ewallet') {
                document.getElementById('ewalletForm').style.display = 'block';
            }
        });
    });
    
    // 银行选项选择
    document.querySelectorAll('.bank-option').forEach(bank => {
        bank.addEventListener('click', function() {
            document.querySelectorAll('.bank-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Selected: ${this.querySelector('p').textContent}`);
        });
    });
    
    // E-wallet 选项选择
    document.querySelectorAll('.ewallet-option').forEach(wallet => {
        wallet.addEventListener('click', function() {
            document.querySelectorAll('.ewallet-option').forEach(w => w.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Selected: ${this.querySelector('p').textContent}`);
        });
    });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initVideoPlayer();
    initPaymentMethods();
    
    // 导航链接点击
    document.querySelectorAll('.nav-link, [data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) switchPage(pageId);
        });
    });
    
    // Logo点击回首页
    document.getElementById('homeLogo')?.addEventListener('click', () => switchPage('home'));
    
    // 首页Shop Now按钮
    document.getElementById('viewProductsBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('products');
    });
    
    // 添加到购物车
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(productName, price);
        });
    });
    
    // 折扣码
    document.getElementById('applyDiscountBtn')?.addEventListener('click', function() {
        const code = document.getElementById('discountCode')?.value;
        if (code?.toUpperCase() === 'NUTRI20') {
            showNotification('✅ Promo applied! 20% discount');
            document.getElementById('discountRow').style.display = 'flex';
            updateOrderSummary();
        } else {
            showNotification('❌ Invalid promo code');
        }
    });
    
    // 下单按钮
    document.getElementById('placeOrderBtn')?.addEventListener('click', function() {
        if (cartItems.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        
        const name = document.getElementById('fullName')?.value;
        if (!name) {
            showNotification('Please enter your full name');
            return;
        }
        
        const activePayment = document.querySelector('.payment-method.active');
        if (!activePayment) {
            showNotification('Please select a payment method');
            return;
        }
        
        const methodType = activePayment.getAttribute('data-method');
        
        if (methodType === 'credit') {
            const cardNumber = document.getElementById('cardNumber')?.value;
            const expiryDate = document.getElementById('expiryDate')?.value;
            const cvv = document.getElementById('cvv')?.value;
            const cardName = document.getElementById('cardName')?.value;
            
            if (!cardNumber || !expiryDate || !cvv || !cardName) {
                showNotification('Please fill in all card details');
                return;
            }
        } else if (methodType === 'online') {
            const selectedBank = document.querySelector('.bank-option.active');
            if (!selectedBank) {
                showNotification('Please select a bank');
                return;
            }
        } else if (methodType === 'ewallet') {
            const selectedWallet = document.querySelector('.ewallet-option.active');
            if (!selectedWallet) {
                showNotification('Please select an e-wallet');
                return;
            }
        }
        
        showNotification('✅ Order placed successfully! Thank you for choosing NutriBite.');
        
        cartItems = [];
        updateCartCount();
        
        setTimeout(() => switchPage('home'), 2000);
    });
    
    // 下载收据
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        downloadReceipt();
    });
    
    // 社交链接点击
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.href.includes('instagram')) {
                e.preventDefault();
                showNotification('Follow us on social media!');
            }
        });
    });
});
// ========== 在文件末尾添加这个函数 ==========

// ========== 反馈表单提交 ==========
function initFeedbackForm() {
    const submitBtn = document.getElementById('submitFeedbackBtn');
    if (!submitBtn) return;
    
    submitBtn.addEventListener('click', function() {
        const name = document.getElementById('feedbackName')?.value || 'Guest';
        const email = document.getElementById('feedbackEmail')?.value;
        const type = document.getElementById('feedbackType')?.value;
        const message = document.getElementById('feedbackMessage')?.value;
        
        if (!message) {
            showNotification('❌ Please enter your feedback message');
            return;
        }
        
        if (!type || type === 'Select feedback type') {
            showNotification('❌ Please select a feedback type');
            return;
        }
        
        showNotification(`✅ Thank you ${name}! Your feedback has been submitted.`);
        
        // 清空表单
        document.getElementById('feedbackName').value = '';
        document.getElementById('feedbackEmail').value = '';
        document.getElementById('feedbackType').value = 'Select feedback type';
        document.getElementById('feedbackMessage').value = '';
    });
}

// ========== 修改支付方式初始化函数 ==========
function initPaymentMethods() {
    // 支付方式选择 - 纯文字版
    document.querySelectorAll('.payment-method-text').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method-text').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            document.getElementById('creditCardForm').style.display = 'none';
            document.getElementById('onlineBankingForm').style.display = 'none';
            document.getElementById('ewalletForm').style.display = 'none';
            
            const methodType = this.getAttribute('data-method');
            if (methodType === 'credit') {
                document.getElementById('creditCardForm').style.display = 'block';
            } else if (methodType === 'online') {
                document.getElementById('onlineBankingForm').style.display = 'block';
            } else if (methodType === 'ewallet') {
                document.getElementById('ewalletForm').style.display = 'block';
            }
        });
    });
    
    // 银行选项选择 - 纯文字版
    document.querySelectorAll('.bank-option-text').forEach(bank => {
        bank.addEventListener('click', function() {
            document.querySelectorAll('.bank-option-text').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Selected: ${this.textContent}`);
        });
    });
    
    // E-wallet 选项选择 - 纯文字版
    document.querySelectorAll('.ewallet-option-text').forEach(wallet => {
        wallet.addEventListener('click', function() {
            document.querySelectorAll('.ewallet-option-text').forEach(w => w.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Selected: ${this.textContent}`);
        });
    });
}

// ========== 修改下单按钮验证 ==========
// 在 placeOrderBtn 的 click 事件中，找到支付方式验证部分，替换为：

// 在原有的 placeOrderBtn 事件监听器中，修改这部分代码：

/*
// 下单按钮验证部分 - 替换原来的验证代码
const activePayment = document.querySelector('.payment-method-text.active');
if (!activePayment) {
    showNotification('Please select a payment method');
    return;
}

const methodType = activePayment.getAttribute('data-method');

if (methodType === 'credit') {
    // ... 原有的信用卡验证
} else if (methodType === 'online') {
    const selectedBank = document.querySelector('.bank-option-text.active');
    if (!selectedBank) {
        showNotification('Please select a bank');
        return;
    }
} else if (methodType === 'ewallet') {
    const selectedWallet = document.querySelector('.ewallet-option-text.active');
    if (!selectedWallet) {
        showNotification('Please select an e-wallet');
        return;
    }
}
*/

// ========== 在 DOMContentLoaded 中添加反馈表单初始化 ==========
// 找到 document.addEventListener('DOMContentLoaded', function() { ... })
// 在里面添加这一行：

/*
initFeedbackForm();
*/