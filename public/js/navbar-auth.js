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

// Función para actualizar la UI basada en el estado de autenticación
function updateUIOnAuth(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');

    if (!authButtons || !userMenu) return; // Si no están los elementos, no hacemos nada

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

// Manejar cierre de sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al cerrar sesión',
                text: 'Por favor, intenta nuevamente',
                confirmButtonColor: '#0066B1'
            });
        }
    });
}

// Limpiar el listener cuando se desmonte el componente
window.addEventListener('unload', () => {
    unsubscribe();
});

// Exportar la función para uso en otros archivos
export { updateUIOnAuth }; 