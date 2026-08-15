// ==========================================
// Royal Beauty - Main JavaScript
// ==========================================

// ============ Cart Management ============
const Cart = {
    items: JSON.parse(localStorage.getItem('royal-cart')) || [],
    
    save() {
        localStorage.setItem('royal-cart', JSON.stringify(this.items));
        this.updateBadge();
    },
    
    add(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) existing.quantity += 1;
        else this.items.push({ ...product, quantity: 1 });
        this.save();
        showToast(`${product.name} به سبد خرید اضافه شد ✓`);
    },
    
    remove(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        renderCart();
    },
    
    updateQty(id, qty) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(1, qty);
            this.save();
            renderCart();
        }
    },
    
    clear() {
        this.items = [];
        this.save();
    },
    
    getTotal() { return this.items.reduce((s, i) => s + i.price * i.quantity, 0); },
    getCount() { return this.items.reduce((s, i) => s + i.quantity, 0); },
    
    updateBadge() {
        document.querySelectorAll('.cart-badge').forEach(badge => {
            const count = this.getCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};

// ============ Toast Notification ============
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ Render Cart ============
function renderCart() {
    const list = document.querySelector('.cart-items-list');
    if (!list) return;
    
    if (Cart.items.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:3rem;">
                <i class="fas fa-shopping-bag" style="font-size:4rem; color:var(--gray-light); margin-bottom:1rem;"></i>
                <h4>سبد خرید شما خالی است</h4>
                <p style="color:var(--gray);">برای مشاهده محصولات به فروشگاه بروید</p>
                <a href="shop.html" class="btn btn-primary" style="margin-top:1rem;">مشاهده محصولات</a>
            </div>`;
        updateSummary(0);
        return;
    }
    
    list.innerHTML = Cart.items.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h5>${item.name}</h5>
                <p>${item.price.toLocaleString('fa-IR')} تومان</p>
            </div>
            <div class="quantity-selector">
                <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                <input type="number" class="qty-input" value="${item.quantity}" data-id="${item.id}" readonly>
                <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total" style="font-weight:700;color:var(--primary);">
                ${(item.price * item.quantity).toLocaleString('fa-IR')} تومان
            </div>
            <button class="remove-btn" data-id="${item.id}" style="background:transparent;border:none;color:var(--danger);cursor:pointer;font-size:1.1rem;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateSummary(Cart.getTotal());
}

function updateSummary(subtotal) {
    const shipping = subtotal > 0 ? 50000 : 0;
    const total = subtotal + shipping;
    document.querySelectorAll('.summary-subtotal').forEach(el => {
        el.textContent = subtotal.toLocaleString('fa-IR') + ' تومان';
    });
    document.querySelectorAll('.summary-shipping').forEach(el => {
        el.textContent = shipping.toLocaleString('fa-IR') + ' تومان';
    });
    document.querySelectorAll('.summary-total').forEach(el => {
        el.textContent = total.toLocaleString('fa-IR') + ' تومان';
    });
}

// ============ Mobile Menu ============
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const close = document.querySelector('.mobile-menu-close');
    
    toggle?.addEventListener('click', () => {
        menu?.classList.add('active');
        overlay?.classList.add('active');
    });
    close?.addEventListener('click', closeMobile);
    overlay?.addEventListener('click', closeMobile);
    
    function closeMobile() {
        menu?.classList.remove('active');
        overlay?.classList.remove('active');
    }
}

// ============ Add to Cart ============
function initAddToCart() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;
        e.preventDefault();
        Cart.add({
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: parseInt(btn.dataset.price),
            image: btn.dataset.image
        });
    });
}

// ============ Quantity / Remove ============
function initCartActions() {
    document.addEventListener('click', e => {
        const btn = e.target.closest('.qty-btn');
        if (btn) {
            const id = btn.dataset.id;
            const item = Cart.items.find(i => i.id === id);
            if (!item) return;
            if (btn.dataset.action === 'increase') item.quantity++;
            else if (btn.dataset.action === 'decrease' && item.quantity > 1) item.quantity--;
            Cart.save();
            renderCart();
            return;
        }
        const remove = e.target.closest('.remove-btn');
        if (remove) Cart.remove(remove.dataset.id);
    });
}

// ============ Form Validation ============
function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (form.checkValidity()) {
                showToast('عملیات با موفقیت انجام شد ✓');
                setTimeout(() => form.submit(), 1200);
            } else {
                showToast('لطفاً فیلدها را کامل کنید', 'error');
            }
        });
    });
}

// ============ Product Filter ============
function initFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.filter;
            document.querySelectorAll('.product-card').forEach(p => {
                p.style.display = (cat === 'all' || p.dataset.category === cat) ? '' : 'none';
            });
        });
    });
}

// ============ Product Gallery ============
function initGallery() {
    const thumbs = document.querySelectorAll('.thumbnail');
    const main = document.querySelector('.main-image img');
    thumbs.forEach(t => t.addEventListener('click', () => {
        thumbs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        if (main) main.src = t.querySelector('img').src;
    }));
}

// ============ Tabs ============
function initTabs() {
    document.querySelectorAll('.tabs-nav').forEach(nav => {
        nav.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const target = link.dataset.tab;
                document.querySelectorAll('.tab-pane').forEach(p => {
                    p.style.display = p.id === target ? '' : 'none';
                });
            });
        });
    });
}

// ============ Payment Method ============
function initPayment() {
    document.querySelectorAll('.payment-method').forEach(m => {
        m.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(x => x.classList.remove('active'));
            m.classList.add('active');
            const radio = m.querySelector('input');
            if (radio) radio.checked = true;
        });
    });
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
    initMobileMenu();
    initAddToCart();
    initCartActions();
    initForms();
    initFilter();
    initGallery();
    initTabs();
    initPayment();
    renderCart();
    
    // Search
    document.querySelector('.search-toggle')?.addEventListener('click', () => {
        const q = prompt('جستجوی محصول:');
        if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
});