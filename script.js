document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    const addBtns = document.querySelectorAll('.add-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cart-total');

    let cart = [];

    // Toggle Cart function
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);

    // Format Currency
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Update the UI representing the cart
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng của bạn đang trống.</p>';
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                count += item.quantity;

                const itemHTML = `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <span class="item-price">${formatMoney(item.price)}</span>
                            <div class="item-controls">
                                <div class="qty-control">
                                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                                </div>
                                <button class="remove-item" data-id="${item.id}"><i class="ri-delete-bin-line"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        cartCount.textContent = count;
        cartTotal.textContent = formatMoney(total);

        // Add Listeners to dynamically created buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, 1));
        });
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(e.target.dataset.id, -1));
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let btnTarget = e.target.closest('.remove-item');
                removeFromCart(btnTarget.dataset.id);
            });
        });
    }

    // Add product to cart
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseInt(card.dataset.price),
                image: card.dataset.image,
                quantity: 1
            };

            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(product);
            }

            updateCartUI();
            
            // Show cart and add bounce animation to the cart icon
            cartSidebar.classList.add('open');
            overlay.classList.add('show');
            
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 200);
        });
    });

    // Update Quantity method
    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartUI();
            }
        }
    }

    // Remove Item method
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    // Initialize UI
    updateCartUI();
});
