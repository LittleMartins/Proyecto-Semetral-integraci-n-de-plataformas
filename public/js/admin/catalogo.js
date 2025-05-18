import { auth, db, storage } from '../config/firebase-config.js';
import { 
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Referencias a elementos del DOM
const productForm = document.getElementById('productForm');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const addProductBtn = document.getElementById('addProductBtn');
const productTableBody = document.getElementById('productTableBody');

// Verificar si el usuario es admin
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            window.location.href = '../index.html';
        }
    } else {
        window.location.href = '../iniciar-sesion.html';
    }
});

// Cargar productos
async function loadProducts() {
    try {
        console.log('Iniciando carga de productos...');
        const querySnapshot = await getDocs(collection(db, 'productos'));
        productTableBody.innerHTML = '';
        
        if (querySnapshot.empty) {
            console.log('No se encontraron productos');
            productTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            No hay productos disponibles. ¡Agrega tu primer producto!
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        console.log(`Se encontraron ${querySnapshot.size} productos`);
        
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            console.log('Procesando producto:', product);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.imagen}" alt="${product.nombre}" class="product-thumbnail" 
                         onerror="this.src='../assets/img/placeholder.png'">
                </td>
                <td>
                    <div class="fw-bold">${product.nombre}</div>
                    <small class="text-muted">${product.descripcion ? product.descripcion.substring(0, 50) + (product.descripcion.length > 50 ? '...' : '') : ''}</small>
                </td>
                <td><span class="badge bg-primary">${product.categoria}</span></td>
                <td class="fw-bold">$${product.precio ? product.precio.toLocaleString('es-CL') : '0'}</td>
                <td>
                    <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                        ${product.stock || 0} unidades
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-primary" 
                                onclick="window.editProduct('${doc.id}', '${product.nombre.replace(/'/g, "\\'")}', '${product.categoria}', ${product.precio || 0}, ${product.stock || 0}, '${product.descripcion ? product.descripcion.replace(/'/g, "\\'") : ''}', '${product.imagen}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" 
                                onclick="window.deleteProduct('${doc.id}')">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            `;
            productTableBody.appendChild(row);
        });
        
        console.log('Productos cargados exitosamente');
    } catch (error) {
        console.error('Error al cargar productos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los productos'
        });
    }
}

// Agregar producto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        nombre: document.getElementById('productName').value,
        categoria: document.getElementById('productCategory').value,
        precio: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        descripcion: document.getElementById('productDescription').value
    };

    const imageFile = document.getElementById('productImage').files[0];

    try {
        Swal.fire({
            title: 'Guardando producto...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Subir imagen
        const storageRef = ref(storage, `productos/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // Guardar producto en Firestore
        await addDoc(collection(db, 'productos'), {
            ...formData,
            imagen: imageUrl,
            fechaCreacion: new Date().toISOString()
        });

        productModal.hide();
        productForm.reset();
        loadProducts();

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Producto agregado correctamente'
        });
    } catch (error) {
        console.error('Error al guardar producto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar el producto'
        });
    }
});

// Eliminar producto
window.deleteProduct = async (productId) => {
    try {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, 'productos', productId));
            await loadProducts();
            Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al eliminar el producto'
        });
    }
};

// Mostrar modal para agregar producto
addProductBtn.addEventListener('click', () => {
    productForm.reset();
    productModal.show();
});

// Editar producto
window.editProduct = async (productId, nombre, categoria, precio, stock, descripcion, imagen) => {
    console.log('Editando producto:', { productId, nombre, categoria, precio, stock, descripcion, imagen });
    
    // Llenar el formulario con los datos del producto
    document.getElementById('productName').value = nombre;
    document.getElementById('productCategory').value = categoria;
    document.getElementById('productPrice').value = precio;
    document.getElementById('productStock').value = stock;
    document.getElementById('productDescription').value = descripcion;
    
    // Cambiar el título del modal
    document.querySelector('.modal-title').textContent = 'Editar Producto';
    
    // Mostrar el modal
    productModal.show();
    
    // Modificar el evento submit del formulario para actualizar en lugar de crear
    const originalSubmitHandler = productForm.onsubmit;
    productForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('productName').value,
            categoria: document.getElementById('productCategory').value,
            precio: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            descripcion: document.getElementById('productDescription').value
        };

        try {
            Swal.fire({
                title: 'Actualizando producto...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const imageFile = document.getElementById('productImage').files[0];
            let imageUrl = imagen;

            // Si se subió una nueva imagen, actualizarla
            if (imageFile) {
                // Eliminar la imagen anterior
                const oldImageRef = ref(storage, imagen);
                try {
                    await deleteObject(oldImageRef);
                } catch (error) {
                    console.error('Error al eliminar imagen anterior:', error);
                }

                // Subir la nueva imagen
                const storageRef = ref(storage, `productos/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // Actualizar el producto en Firestore
            await updateDoc(doc(db, 'productos', productId), {
                ...formData,
                imagen: imageUrl,
                fechaActualizacion: new Date().toISOString()
            });

            productModal.hide();
            productForm.reset();
            await loadProducts();

            // Restaurar el manejador original del formulario
            productForm.onsubmit = originalSubmitHandler;
            document.querySelector('.modal-title').textContent = 'Agregar Producto';

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Producto actualizado correctamente'
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el producto'
            });
        }
    };
};

// Cargar productos al iniciar
loadProducts();

// Agregar vista previa de imagen
document.getElementById('productImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let preview = document.getElementById('imagePreview');
            if (!preview) {
                preview = document.createElement('img');
                preview.id = 'imagePreview';
                document.getElementById('productImage').parentNode.appendChild(preview);
            }
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}); 