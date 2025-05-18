// Clase para manejar el carrito de compras
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
    }

    // Cargar el carrito desde localStorage
    loadCart() {
        const savedCart = localStorage.getItem('shopping-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Guardar el carrito en localStorage
    saveCart() {
        localStorage.setItem('shopping-cart', JSON.stringify(this.items));
        this.updateCartDisplay();
    }

    // Agregar un producto al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showAddedToCartNotification();
    }

    // Remover un producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
    }

    // Limpiar el carrito
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Calcular el total del carrito
    getTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
    }

    // Obtener el total de items en el carrito
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Actualizar la visualización del carrito
    updateCartDisplay() {
        // Actualizar el contador del carrito
        const cartCount = document.querySelector('.cart-count');
        const totalItems = this.getTotalItems();
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? '' : 'none';
        }

        // Actualizar el contenido del dropdown
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="text-center py-3">
                        <i class="bi bi-cart-x fs-1 text-muted"></i>
                        <p class="text-muted mb-0">Tu carrito está vacío</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item mb-3">
                        <div class="d-flex align-items-center">
                            <img src="${item.imagen}" alt="${item.nombre}" 
                                style="width: 50px; height: 50px; object-fit: cover;" 
                                class="rounded me-3">
                            <div class="flex-grow-1">
                                <h6 class="mb-0 text-truncate" style="max-width: 150px;">${item.nombre}</h6>
                                <small class="text-muted">
                                    ${item.quantity} x $${item.precio.toLocaleString()}
                                </small>
                            </div>
                            <div class="text-end ms-3">
                                <small class="d-block text-muted">
                                    $${(item.precio * item.quantity).toLocaleString()}
                                </small>
                                <button class="btn btn-sm btn-outline-danger mt-1" onclick="cart.removeItem('${item.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = `$${this.getTotal().toLocaleString()}`;
        }
    }

    // Mostrar notificación de producto agregado
    showAddedToCartNotification() {
        Swal.fire({
            icon: 'success',
            title: '¡Producto agregado!',
            text: 'El producto se agregó al carrito correctamente',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Crear instancia global del carrito
window.cart = new ShoppingCart();

// Exportar la clase para su uso en otros módulos
export default ShoppingCart; 