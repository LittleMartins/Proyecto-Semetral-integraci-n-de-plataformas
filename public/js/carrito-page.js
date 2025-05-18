// Importar la clase del carrito
import ShoppingCart from './cart.js';

class CartPage {
    constructor() {
        this.cart = window.cart;
        this.initializeElements();
        this.setupEventListeners();
        this.renderCart();
    }

    initializeElements() {
        this.cartItemsContainer = document.getElementById('cart-items-container');
        this.emptyCartMessage = document.getElementById('empty-cart-message');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTax = document.getElementById('cart-tax');
        this.cartTotal = document.getElementById('cart-total');
        this.checkoutButton = document.getElementById('checkout-button');
        this.clearCartButton = document.getElementById('clear-cart-button');
    }

    setupEventListeners() {
        this.clearCartButton.addEventListener('click', () => this.handleClearCart());
        this.checkoutButton.addEventListener('click', () => this.handleCheckout());
    }

    renderCart() {
        const items = this.cart.items;
        
        if (items.length === 0) {
            this.showEmptyCartMessage();
            return;
        }

        this.hideEmptyCartMessage();
        this.renderItems(items);
        this.updateTotals();
    }

    renderItems(items) {
        this.cartItemsContainer.innerHTML = items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image img-fluid rounded">
                    </div>
                    <div class="col-md-4">
                        <h5 class="mb-1">${item.nombre}</h5>
                        <p class="text-muted mb-0">Precio unitario: $${item.precio.toLocaleString()}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="quantity-control input-group">
                            <button class="btn btn-outline-secondary" onclick="cartPage.updateItemQuantity('${item.id}', ${item.quantity - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control text-center" value="${item.quantity}" 
                                   min="1" onchange="cartPage.updateItemQuantity('${item.id}', this.value)">
                            <button class="btn btn-outline-secondary" onclick="cartPage.updateItemQuantity('${item.id}', ${item.quantity + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <p class="h5 mb-0">$${(item.precio * item.quantity).toLocaleString()}</p>
                    </div>
                    <div class="col-md-1 text-end">
                        <button class="btn btn-outline-danger btn-sm" onclick="cartPage.removeItem('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateTotals() {
        const subtotal = this.cart.getTotal();
        const tax = subtotal * 0.19; // IVA 19%
        const total = subtotal + tax;

        this.cartSubtotal.textContent = `$${subtotal.toLocaleString()}`;
        this.cartTax.textContent = `$${tax.toLocaleString()}`;
        this.cartTotal.textContent = `$${total.toLocaleString()}`;

        // Habilitar/deshabilitar botón de checkout
        this.checkoutButton.disabled = subtotal === 0;
    }

    showEmptyCartMessage() {
        this.cartItemsContainer.style.display = 'none';
        this.emptyCartMessage.style.display = 'block';
        this.updateTotals();
    }

    hideEmptyCartMessage() {
        this.cartItemsContainer.style.display = 'block';
        this.emptyCartMessage.style.display = 'none';
    }

    updateItemQuantity(productId, newQuantity) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }
        this.cart.updateQuantity(productId, newQuantity);
        this.renderCart();
    }

    removeItem(productId) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar este producto del carrito?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart.removeItem(productId);
                this.renderCart();
                Swal.fire(
                    '¡Eliminado!',
                    'El producto ha sido eliminado del carrito.',
                    'success'
                );
            }
        });
    }

    handleClearCart() {
        if (this.cart.items.length === 0) {
            Swal.fire('El carrito ya está vacío', '', 'info');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminarán todos los productos del carrito",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, vaciar carrito',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart.clearCart();
                this.renderCart();
                Swal.fire(
                    '¡Carrito vaciado!',
                    'Todos los productos han sido eliminados.',
                    'success'
                );
            }
        });
    }

    handleCheckout() {
        if (this.cart.items.length === 0) {
            Swal.fire('El carrito está vacío', 'Agrega productos antes de continuar', 'info');
            return;
        }

        // Aquí puedes agregar la lógica para proceder al checkout
        Swal.fire({
            title: 'Procesando el pedido',
            text: 'Serás redirigido al proceso de pago...',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            // Aquí puedes redirigir a la página de checkout
            // window.location.href = 'checkout.html';
        });
    }
}

// Crear instancia global de la página del carrito
window.cartPage = new CartPage(); 