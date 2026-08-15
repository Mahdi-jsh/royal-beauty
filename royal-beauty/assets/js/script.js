// ========== مدیریت سبد خرید ==========
const Cart = {
    items: JSON.parse(localStorage.getItem('royal_cart') || '[]'),

    save() {
        localStorage.setItem('royal_cart', JSON.stringify(this.items));
        this.updateBadge();
    },

    add(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this.save();
        Toast.show(`${product.name} به سبد خرید اضافه شد`, 'success');
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    update(id, qty) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.qty = Math.max(1, qty);
            this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    total() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    count() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    },

    updateBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = this.count();
            badge.style.display = this.count() > 0 ? 'flex' : 'none';
        }
    }
};

// ========== سیستم نمایش پیام (Toast) ==========
const Toast = {
    show(message, type = 'success') {
        const container = document.querySelector('.toast-container') || this.createContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✓', error: '✕', info: 'ⓘ' };
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.success}</div>
            <div class="toast-text">
                <strong>${type === 'success' ? 'موفقیت‌آمیز' : type === 'error' ? 'خطا' : 'توجه'}</strong>
                <small>${message}</small>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    createContainer() {
        const div = document.createElement('div');
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    }
};

// ========== داده‌های محصولات ==========
const Products = [
    { id: 1, name: 'کرم ضد آفتاب طبیعی SPF50', category: 'مراقبت پوست', price: 850000, oldPrice: 1100000, image: '🌞', badge: 'sale', rating: 4.8 },
    { id: 2, name: 'سرم ویتامین C خالص', category: 'مراقبت پوست', price: 1200000, image: '✨', badge: 'new', rating: 4.9 },
    { id: 3, name: 'ماسک صورت عسل و زردچوبه', category: 'ماسک', price: 450000, image: '🍯', rating: 4.7 },
    { id: 4, name: 'رژ لب مایع مات طبیعی', category: 'آرایش لب', price: 320000, oldPrice: 420000, image: '💄', badge: 'sale', rating: 4.6 },
    { id: 5, name: 'شامپو گیاهی تقویتی', category: 'مراقبت مو', price: 580000, image: '🌿', badge: 'new', rating: 4.8 },
    { id: 6, name: 'کرم دور چشم ضد چروک', category: 'مراقبت پوست', price: 980000, image: '👁️', rating: 4.9 },
    { id: 7, name: 'پالت سایه چشم ۱۲ رنگ', category: 'آرایش چشم', price: 1450000, image: '🎨', rating: 4.7 },
    { id: 8, name: 'روغن آرگان خالص', category: 'مراقبت مو', price: 720000, oldPrice: 900000, image: '🫒', badge: 'sale', rating: 5.0 }
];

// ========== رندر محصولات ==========
function renderProducts(container, products) {
    if (!container) return;
    container.innerHTML = products.map(p => `
        <div class="product-card" data-category="${p.category}">
            <div class="product-image">
                ${p.badge ? `<span class="product-badge ${p.badge === 'new' ? 'new' : ''}">${p.badge === 'sale' ? 'تخفیف' : 'جدید'}</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn" onclick="addToWishlist(${p.id})" title="علاقه‌مندی">♡</button>
                    <button class="product-action-btn" onclick="window.location.href='product.html?id=${p.id}'" title="مشاهده">👁</button>
                </div>
                ${p.image}
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(p.rating))}
                    <span>(${p.rating})</span>
                </div>
                <div class="product-price">
                    <span class="price-current">${formatPrice(p.price)}</span>
                    ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
                </div>
                <button class="product-add-btn" onclick="addToCart(${p.id})">افزودن به سبد</button>
            </div>
        </div>
    `).join('');
}

function formatPrice(price) {
    return price.toLocaleString('fa-IR') + ' تومان';
}

function addToCart(id) {
    const product = Products.find(p => p.id === id);
    if (product) Cart.add(product);
}

function addToWishlist(id) {
    Toast.show('به علاقه‌مندی‌ها اضافه شد', 'info');
}

// ========== منوی موبایل ==========
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    Cart.updateBadge();

    // رندر محصولات در صفحه اصلی
    const featuredGrid = document.getElementById('featured-products');
    if (featuredGrid) {
        renderProducts(featuredGrid, Products.slice(0, 8));
    }

    // رندر محصولات در صفحه فروشگاه
    const shopGrid = document.getElementById('shop-products');
    if (shopGrid) {
        renderShopProducts();
        setupFilters();
    }

    // صفحه محصول
    if (document.querySelector('.product-detail')) {
        loadProductDetail();
    }

    // سبد خرید
    if (document.getElementById('cart-items')) {
        renderCart();
    }

    // فرم‌ها
    setupForms();
});

function renderShopProducts() {
    const shopGrid = document.getElementById('shop-products');
    const products = window.filteredProducts || Products;
    renderProducts(shopGrid, products);
    const counter = document.querySelector('.shop-toolbar .results');
    if (counter) counter.textContent = `${products.length} محصول یافت شد`;
}

function setupFilters() {
    const checkboxes = document.querySelectorAll('.filter-list input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    const sortSelect = document.querySelector('.shop-toolbar select');
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    const selected = Array.from(document.querySelectorAll('.filter-list input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    let filtered = selected.length === 0 
        ? Products 
        : Products.filter(p => selected.includes(p.category));
    
    const sort = document.querySelector('.shop-toolbar select')?.value;
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    
    window.filteredProducts = filtered;
    renderShopProducts();
}

// ========== صفحه جزئیات محصول ==========
function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 1;
    const product = Products.find(p => p.id === id) || Products;
    
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-rating').textContent = `${'★'.repeat(Math.floor(product.rating))} (${product.rating} از ۵)`;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-old-price').textContent = product.oldPrice ? formatPrice(product.oldPrice) : '';
    document.getElementById('product-image').textContent = product.image;
    
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
        addBtn.onclick = () => Cart.add(product);
    }
}

// تغییر تعداد
document.addEventListener('click', e => {
    if (e.target.matches('.qty-plus')) {
        const input = e.target.parentElement.querySelector('input');
        input.value = parseInt(input.value) + 1;
        input.dispatchEvent(new Event('change'));
    }
    if (e.target.matches('.qty-minus')) {
        const input = e.target.parentElement.querySelector('input');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
            input.dispatchEvent(new Event('change'));
        }
    }
});

// ========== سبد خرید ==========
function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    if (Cart.items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="emoji">🛍️</div>
                <h3>سبد خرید شما خالی است</h3>
                <p>محصولات مورد علاقه خود را به سبد خرید اضافه کنید</p>
                <a href="shop.html" class="btn btn-primary">مشاهده محصولات</a>
            </div>
        `;
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }
    
    container.innerHTML = Cart.items.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.image || '🌿'}</div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="meta">دسته: ${item.category}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="qty-minus">−</button>
                    <input type="number" value="${item.qty}" min="1" 
                           onchange="Cart.update(${item.id}, parseInt(this.value)); renderCart();">
                    <button class="qty-plus">+</button>
                </div>
                <button onclick="Cart.remove(${item.id}); renderCart();" 
                        style="color: var(--danger); font-size: 13px;">🗑 حذف</button>
            </div>
        </div>
    `).join('');
    
    const subtotal = Cart.total();
    const shipping = subtotal > 2000000 ? 0 : 50000;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = shipping === 0 ? 'رایگان' : formatPrice(shipping);
    document.getElementById('total').textContent = formatPrice(total);
}

// ========== فرم‌ها ==========
function setupForms() {
    // اعتبارسنجی فرم ورود
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = loginForm.querySelector('[name="email"]').value;
            if (email && email.includes('@')) {
                Toast.show('با موفقیت وارد شدید', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                Toast.show('لطفاً ایمیل معتبر وارد کنید', 'error');
            }
        });
    }

    // فرم ثبت‌نام
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            const pass = registerForm.querySelector('[name="password"]').value;
            const confirm = registerForm.querySelector('[name="confirm"]').value;
            if (pass.length < 6) {
                Toast.show('رمز عبور باید حداقل ۶ کاراکتر باشد', 'error');
                return;
            }
            if (pass !== confirm) {
                Toast.show('رمز عبور و تکرار آن یکسان نیست', 'error');
                return;
            }
            Toast.show('ثبت‌نام با موفقیت انجام شد', 'success');
            setTimeout(() => window.location.href = 'index.html', 1000);
        });
    }

    // فرم تماس
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            Toast.show('پیام شما با موفقیت ارسال شد', 'success');
            contactForm.reset();
        });
    }

    // خبرنامه
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            Toast.show('به خبرنامه ما پیوستید!', 'success');
            form.reset();
        });
    });

    // تسویه حساب
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', e => {
            e.preventDefault();
            Toast.show('سفارش شما با موفقیت ثبت شد', 'success');
            Cart.clear();
            setTimeout(() => window.location.href = 'index.html', 2000);
        });
    }

    // بازیابی رمز
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', e => {
            e.preventDefault();
            Toast.show('لینک بازیابی به ایمیل شما ارسال شد', 'success');
            setTimeout(() => window.location.href = 'login.html', 2000);
        });
    }

    // تب‌ها
    document.querySelectorAll('.tabs-nav').forEach(nav => {
        nav.addEventListener('click', e => {
            if (e.target.matches('.tab-btn')) {
                nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const target = e.target.dataset.tab;
                const parent = nav.closest('.product-tabs');
                parent.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
                const pane = parent.querySelector(`[data-tab-content="${target}"]`);
                if (pane) pane.style.display = 'block';
            }
        });
    });

    // روش پرداخت
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });
}