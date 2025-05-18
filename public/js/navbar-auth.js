import { auth, db } from './config/firebase-config.js';
import { 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    getDoc,
    collection 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Función para inicializar la UI de autenticación
function initializeAuthUI() {
    console.log('🔧 Inicializando UI de autenticación...');
    // Esperar a que el navbar se cargue
    const checkNavbar = setInterval(() => {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (authButtons && userMenu) {
            console.log('✅ Elementos del navbar encontrados');
            clearInterval(checkNavbar);
            setupLogoutButton();
        }
    }, 100);
}

// Función para configurar el botón de cerrar sesión
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('🔍 Botón de cerrar sesión encontrado');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🔄 Iniciando proceso de cierre de sesión...');
            try {
                await signOut(auth);
                console.log('✅ Sesión cerrada exitosamente');
                // Redirigir a la página de inicio
                const currentPath = window.location.pathname;
                const isInViews = currentPath.includes('/views/');
                const redirectPath = isInViews ? 'index.html' : '../views/index.html';
                console.log('🔄 Redirigiendo a:', redirectPath);
                window.location.href = redirectPath;
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cerrar sesión',
                        text: 'Por favor, intenta nuevamente',
                        confirmButtonColor: '#0066B1'
                    });
                } else {
                    alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
                }
            }
        });
    } else {
        console.warn('⚠️ No se encontró el botón de cerrar sesión');
    }
}

// Función para actualizar la UI basada en el estado de autenticación
function updateUIOnAuth(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');

    if (!authButtons || !userMenu) {
        console.warn('⚠️ Elementos del navbar no encontrados');
        return;
    }

    if (user) {
        // Usuario autenticado
        authButtons.classList.add('d-none');
        userMenu.classList.remove('d-none');
        
        if (userNameSpan) {
            // Actualizar nombre de usuario
            const usuariosRef = collection(db, 'usuarios');
            const userDocRef = doc(usuariosRef, user.uid);
            
            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        userNameSpan.textContent = docSnap.data().nombreCompleto || user.email;
                    } else {
                        userNameSpan.textContent = user.email;
                    }
                })
                .catch((error) => {
                    console.error("Error al obtener datos del usuario:", error);
                    userNameSpan.textContent = user.email;
                });
        }

        // Actualizar el contador del carrito
        if (window.cart) {
            window.cart.updateCartDisplay();
        }
    } else {
        // Usuario no autenticado
        authButtons.classList.remove('d-none');
        userMenu.classList.add('d-none');
    }
}

// Escuchar cambios en el estado de autenticación
const unsubscribe = onAuthStateChanged(auth, (user) => {
    updateUIOnAuth(user);
});

// Limpiar el listener cuando se desmonte el componente
window.addEventListener('unload', () => {
    unsubscribe();
});

// Exportar las funciones necesarias
export { updateUIOnAuth, initializeAuthUI }; 

