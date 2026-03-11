import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
// Thêm thư viện Cloud Firestore
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlxYN-puZO2p8J-XJ6uykETqovyQcpp1s",
    authDomain: "dautay-7a837.firebaseapp.com",
    projectId: "dautay-7a837",
    storageBucket: "dautay-7a837.firebasestorage.app",
    messagingSenderId: "217721270233",
    appId: "1:217721270233:web:58fb7b48141430d57533c8",
    measurementId: "G-J003E8GHS2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Khởi tạo Database
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    const addBtns = document.querySelectorAll('.add-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cart-total');
    // Truy xuất nút Thanh toán
    const checkoutBtn = document.querySelector('.checkout-btn');

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

    // =============== GỬI LÊN FIREBASE ===============
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert("Bạn chưa có sản phẩm nào trong giỏ hàng!");
                return;
            }

            // Thay đổi nút để báo hiệu đang chờ mạng
            checkoutBtn.textContent = 'Đang xử lý...';
            checkoutBtn.disabled = true;

            try {
                // Tạo một bản ghi mới trong bộ sưu tập (Collection) tên là 'orders' trên Firestore
                const docRef = await addDoc(collection(db, "orders"), {
                    items: cart, // Lưu toàn bộ giỏ hàng
                    totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), // Tính tổng tiền
                    createdAt: new Date() // Lưu thời gian đặt
                });

                alert(`Thanh toán thành công! Mã đơn hàng của bạn là: ${docRef.id}`);

                // Trả giỏ hàng về trống sau khi mua xong
                cart = [];
                updateCartUI();
                toggleCart();

            } catch (e) {
                console.error("Lỗi khi thêm bản ghi: ", e);
                alert("Có lỗi xảy ra khi lưu dữ liệu lên hệ thống!");
            } finally {
                // Khôi phục trạng thái nút bấm
                checkoutBtn.textContent = 'Thanh Toán';
                checkoutBtn.disabled = false;
            }
        });
    }
});
