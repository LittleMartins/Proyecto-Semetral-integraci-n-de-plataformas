import { productosAPI } from './config/firebase-config.js';

// Cargar productos en el catálogo
async function cargarProductos() {
    try {
        const productos = await productosAPI.obtenerProductos();
        renderizarProductos(productos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// Función para renderizar los productos en el HTML
function renderizarProductos(productos) {
    const contenedor = document.getElementById('productGrid');
    contenedor.innerHTML = '';
    
    productos.forEach(producto => {
        const card = `
            <div class="col-md-3 mb-4">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${producto.imagenes[0]}" alt="${producto.nombre}">
                        <span class="stock-badge">${producto.stock > 0 ? 'En Stock' : 'Sin Stock'}</span>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${producto.categoria}</div>
                        <h3 class="product-title">${producto.nombre}</h3>
                        <div class="product-price">$${producto.precio.retail.toLocaleString()}</div>
                        <div class="product-actions">
                            <button class="btn btn-primary btn-sm" ${producto.stock <= 0 ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus"></i> Agregar
                            </button>
                            <button class="btn btn-outline-light btn-sm">
                                <i class="bi bi-eye"></i> Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += card;
    });
}

// Inicializar el catálogo cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarProductos); 