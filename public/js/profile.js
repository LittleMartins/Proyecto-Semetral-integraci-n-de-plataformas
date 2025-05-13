import { 
    getAuth, 
    onAuthStateChanged, 
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    deleteDoc,
    collection,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytesResumable,
    getDownloadURL,
    deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';
import { app, auth as firebaseAuth, db as firebaseDB, storage as firebaseStorage } from './config/firebase-config.js';

// Inicializar Firebase
const auth = firebaseAuth;
const db = firebaseDB;
const storage = firebaseStorage;

let currentUser = null;

// Datos de comunas por región
const comunasPorRegion = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Alto Hospicio", "Iquique", "Camiña", "Colchane", "Huara", "Pica", "Pozo Almonte"],
    "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Metropolitana": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
    "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
    "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Aysén": ["Coihaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    if (typeof Swal === 'undefined') {
        console.error('SweetAlert2 no está disponible');
        alert(mensaje);
        return;
    }

    const iconoTipo = tipo === 'success' ? 'success' : 
                     tipo === 'error' ? 'error' :
                     tipo === 'warning' ? 'warning' : 'info';
                     
    const colorBoton = tipo === 'success' ? '#28a745' : 
                      tipo === 'error' ? '#dc3545' :
                      tipo === 'warning' ? '#ffc107' : '#17a2b8';

    Swal.fire({
        title: tipo === 'success' ? '¡Éxito!' : 
               tipo === 'error' ? 'Error' :
               tipo === 'warning' ? 'Atención' : 'Información',
        text: mensaje,
        icon: iconoTipo,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: colorBoton
    });
}

// Función para verificar la conexión con Firestore
async function verificarConexionFirestore() {
    try {
        console.log('🔍 Verificando conexión con Firestore...');
        console.log('📊 Estado de db:', db);
        
        if (!db) {
            console.error('❌ db no está inicializado');
            return false;
        }

        if (!currentUser) {
            console.error('❌ Usuario no autenticado');
            return false;
        }

        // Intentar una operación simple en el documento del usuario actual
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        await getDoc(userDocRef);
        
        console.log('✅ Conexión con Firestore verificada');
        return true;
    } catch (error) {
        console.error('❌ Error al verificar conexión:', error);
        return false;
    }
}

// Función para verificar autenticación
function verificarAutenticacion() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Dejar de escuchar después de la primera verificación
            if (user) {
                console.log('✅ Usuario autenticado:', user.uid);
                currentUser = user;
                resolve(true);
            } else {
                console.log('❌ Usuario no autenticado');
                resolve(false);
            }
        });
    });
}

// Función para cargar datos del usuario
async function cargarDatosUsuario(userId) {
    try {
        console.log('🔵 Intentando cargar datos del usuario:', userId);
        
        // Verificar conexión primero
        const conexionOK = await verificarConexionFirestore();
        if (!conexionOK) {
            console.log('❌ No hay conexión con Firestore');
            throw new Error('No se pudo establecer conexión con Firestore');
        }
        console.log('✅ Conexión con Firestore establecida');

        const userDocRef = doc(db, 'usuarios', userId);
        console.log('📄 Referencia del documento:', userDocRef.path);
        
        const userDoc = await getDoc(userDocRef);
        console.log('📋 Estado del documento:', {
            existe: userDoc.exists(),
            id: userDoc.id,
            metadata: userDoc.metadata
        });

        if (userDoc.exists()) {
            const datos = userDoc.data();
            console.log('✅ Datos encontrados:', datos);

            // Asegurarse de que el nombre completo esté actualizado en Auth
            if (datos.nombreCompleto && auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: datos.nombreCompleto
                });
            }

            return datos;
        } else {
            console.log('⚠️ Documento no existe, creando nuevo usuario');
            const nombreCompleto = auth.currentUser?.displayName || '';
            const nuevoUsuario = {
                nombreCompleto: nombreCompleto,
                email: auth.currentUser?.email || '',
                fechaRegistro: new Date().toISOString(),
                ultimaActualizacion: new Date().toISOString(),
                telefono: '',
                region: '',
                comuna: '',
                direccion: '',
                fotoPerfil: auth.currentUser?.photoURL || ''
            };

            console.log('📝 Datos del nuevo usuario:', nuevoUsuario);

            try {
                await setDoc(userDocRef, nuevoUsuario);
                console.log('✅ Nuevo usuario creado exitosamente');

                // Actualizar el displayName en Auth si es necesario
                if (nombreCompleto && auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: nombreCompleto
                    });
                }

                return nuevoUsuario;
            } catch (error) {
                console.error('❌ Error al crear usuario:', error);
                console.error('Detalles del error:', {
                    codigo: error.code,
                    mensaje: error.message,
                    nombre: error.name,
                    stack: error.stack
                });
                throw new Error('No se pudo crear el perfil de usuario');
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        console.error('Detalles del error:', {
            codigo: error.code,
            mensaje: error.message,
            nombre: error.name,
            stack: error.stack
        });
        mostrarAlerta('Error al cargar los datos: ' + error.message, 'error');
        throw error;
    }
}

// Función para actualizar la UI
function actualizarUI(userData) {
    console.log('🔵 Actualizando UI con datos:', userData);
    
    const elementos = {
        // Elementos del formulario
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        region: document.getElementById('region'),
        comuna: document.getElementById('comuna'),
        address: document.getElementById('address'),
        // Elementos de solo lectura
        readOnlyName: document.getElementById('readOnlyName'),
        readOnlyEmail: document.getElementById('readOnlyEmail'),
        readOnlyPhone: document.getElementById('readOnlyPhone'),
        readOnlyRegion: document.getElementById('readOnlyRegion'),
        readOnlyComuna: document.getElementById('readOnlyComuna'),
        readOnlyAddress: document.getElementById('readOnlyAddress'),
        // Elemento del menú de navegación
        navbarUserName: document.querySelector('.user-name')
    };

    // Verificar elementos
    const elementosFaltantes = Object.entries(elementos)
        .filter(([key, element]) => !element)
        .map(([key]) => key);

    if (elementosFaltantes.length > 0) {
        console.error('❌ Elementos no encontrados:', elementosFaltantes.join(', '));
        mostrarAlerta('Error al cargar la interfaz', 'error');
        return;
    }

    // Actualizar valores del formulario
    elementos.fullName.value = userData.nombreCompleto || '';
    elementos.email.value = userData.email || '';
    elementos.phone.value = userData.telefono || '';
    elementos.region.value = userData.region || '';
    
    // Actualizar comunas si hay región seleccionada
    if (userData.region) {
        actualizarComunas(userData.region);
        elementos.comuna.value = userData.comuna || '';
    }
    
    elementos.address.value = userData.direccion || '';

    // Actualizar valores de solo lectura
    elementos.readOnlyName.textContent = userData.nombreCompleto || '-';
    elementos.readOnlyEmail.textContent = userData.email || '-';
    elementos.readOnlyPhone.textContent = userData.telefono || '-';
    elementos.readOnlyRegion.textContent = userData.region || '-';
    elementos.readOnlyComuna.textContent = userData.comuna || '-';
    elementos.readOnlyAddress.textContent = userData.direccion || '-';

    // Actualizar nombre en el menú de navegación
    if (elementos.navbarUserName) {
        elementos.navbarUserName.textContent = userData.nombreCompleto || 'Usuario';
    }

    // Log para verificar la actualización
    console.log('✅ UI actualizada con nombre:', userData.nombreCompleto || 'Usuario');
}

// Función para actualizar las comunas según la región seleccionada
function actualizarComunas(region) {
    const comunaSelect = document.getElementById('comuna');
    comunaSelect.innerHTML = '<option value="">Selecciona una comuna</option>';
    comunaSelect.disabled = !region;

    if (region && comunasPorRegion[region]) {
        comunasPorRegion[region].forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            comunaSelect.appendChild(option);
        });
    }
}

// Función para manejar el envío del formulario de perfil
async function handleProfileSubmit(event) {
    event.preventDefault();
    
    try {
        if (!currentUser) {
            throw new Error('No hay usuario autenticado');
        }

        const formData = {
            nombreCompleto: document.getElementById('fullName').value.trim(),
            telefono: document.getElementById('phone').value.trim(),
            region: document.getElementById('region').value,
            comuna: document.getElementById('comuna').value,
            direccion: document.getElementById('address').value.trim(),
            ultimaActualizacion: new Date().toISOString()
        };

        // Validar campos requeridos
        if (!formData.nombreCompleto) {
            throw new Error('El nombre completo es requerido');
        }

        if (!formData.region) {
            throw new Error('Por favor, selecciona una región');
        }

        if (!formData.comuna) {
            throw new Error('Por favor, selecciona una comuna');
        }

        if (!formData.direccion) {
            throw new Error('La dirección es requerida');
        }

        // Validar formato de dirección
        if (!validarDireccion(formData.direccion)) {
            throw new Error('Por favor, ingresa una dirección válida que incluya calle y número');
        }

        // Actualizar en Firestore
        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        await updateDoc(userDocRef, formData);

        // Actualizar displayName en Auth
        await updateProfile(currentUser, {
            displayName: formData.nombreCompleto
        });

        mostrarAlerta('Perfil actualizado correctamente', 'success');
        
        // Recargar datos
        const userData = await cargarDatosUsuario(currentUser.uid);
        actualizarUI(userData);

        // Volver a la vista de solo lectura
        const formulario = document.getElementById('profileForm');
        const vistaReadOnly = document.getElementById('perfilReadOnly');
        const editarPerfilBtn = document.getElementById('editarPerfilBtn');
        
        formulario.classList.add('d-none');
        vistaReadOnly.classList.remove('d-none');
        editarPerfilBtn.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar mis datos';
        editarPerfilBtn.classList.replace('btn-danger', 'btn-light');

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        mostrarAlerta(error.message, 'error');
    }
}

// Función para validar el formato de la dirección
function validarDireccion(direccion) {
    // Verificar longitud mínima
    if (direccion.length < 5) return false;

    // Verificar que contenga número
    if (!/\d/.test(direccion)) return false;

    // Verificar que contenga texto (calle)
    if (!/[a-zA-Z]/.test(direccion)) return false;

    return true;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando aplicación...');
    
    try {
        // Verificar autenticación primero
        const estaAutenticado = await verificarAutenticacion();
        if (!estaAutenticado) {
            console.log('🔄 Redirigiendo a inicio de sesión...');
            window.location.href = 'iniciar-sesion.html';
            return;
        }

        // Verificar conexión con Firestore
        const conexionOK = await verificarConexionFirestore();
        if (!conexionOK) {
            mostrarAlerta('Error de conexión con la base de datos', 'error');
            return;
        }

        // Cargar datos del usuario
        try {
            console.log('📥 Cargando datos del usuario...');
            const userData = await cargarDatosUsuario(currentUser.uid);
            if (userData) {
                console.log('✅ Datos cargados correctamente');
                actualizarUI(userData);
            }
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            mostrarAlerta('Error al cargar el perfil: ' + error.message, 'error');
        }

    } catch (error) {
        console.error('❌ Error en la inicialización:', error);
        mostrarAlerta('Error al iniciar la aplicación', 'error');
    }

    // Configurar manejadores de eventos
    configurarEventListeners();
});

// Función para configurar los event listeners
function configurarEventListeners() {
    const profileForm = document.getElementById('profileForm');
    const imageInput = document.getElementById('imageInput');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const editarPerfilBtn = document.getElementById('editarPerfilBtn');
    const perfilReadOnly = document.getElementById('perfilReadOnly');

    // Configurar botón de editar perfil
    if (editarPerfilBtn) {
        editarPerfilBtn.addEventListener('click', function() {
            const formulario = document.getElementById('profileForm');
            const vistaReadOnly = document.getElementById('perfilReadOnly');
            
            if (formulario.classList.contains('d-none')) {
                // Mostrar formulario
                formulario.classList.remove('d-none');
                vistaReadOnly.classList.add('d-none');
                editarPerfilBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Cancelar edición';
                editarPerfilBtn.classList.replace('btn-light', 'btn-danger');
            } else {
                // Ocultar formulario
                formulario.classList.add('d-none');
                vistaReadOnly.classList.remove('d-none');
                editarPerfilBtn.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar mis datos';
                editarPerfilBtn.classList.replace('btn-danger', 'btn-light');
                
                // Recargar datos originales
                if (currentUser) {
                    cargarDatosUsuario(currentUser.uid).then(userData => {
                        actualizarUI(userData);
                    }).catch(error => {
                        console.error('Error al recargar datos:', error);
                    });
                }
            }
        });
    }

    // Configurar botones de mostrar/ocultar contraseña
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    if (togglePasswordButtons && togglePasswordButtons.length > 0) {
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = this.querySelector('i');

                if (passwordInput) {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        icon.classList.remove('bi-eye-slash');
                        icon.classList.add('bi-eye');
                    } else {
                        passwordInput.type = 'password';
                        icon.classList.remove('bi-eye');
                        icon.classList.add('bi-eye-slash');
                    }
                }
            });
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    } else {
        console.error('❌ No se encontró el formulario de perfil');
    }

    if (imageInput) {
        imageInput.addEventListener('change', handleImageChange);
    } else {
        console.error('❌ No se encontró el input de imagen');
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    } else {
        console.error('❌ No se encontró el botón de eliminar cuenta');
    }

    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    } else {
        console.error('❌ No se encontró el botón de olvidaste tu contraseña');
    }
}

// Función para manejar la subida de imágenes
async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        console.log('📸 Procesando imagen:', file.name);

        // Validar tipo y tamaño
        if (!file.type.startsWith('image/')) {
            throw new Error('Por favor, selecciona una imagen válida');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('La imagen debe ser menor a 5MB');
        }

        // Mostrar progreso
        const uploadProgress = document.querySelector('.upload-progress');
        const progressBar = document.querySelector('.progress-bar');
        const profileImage = document.getElementById('profileImage');

        if (!uploadProgress || !progressBar || !profileImage) {
            throw new Error('No se encontraron los elementos necesarios');
        }

        uploadProgress.style.display = 'block';
        progressBar.style.width = '0%';

        // Crear referencia en Storage
        const imageRef = ref(storage, `fotos-perfil/${currentUser.uid}`);
        console.log('🔄 Iniciando subida a Storage...');

        // Iniciar subida
        const uploadTask = uploadBytesResumable(imageRef, file);

        uploadTask.on('state_changed',
            // Progreso
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('📊 Progreso:', progress.toFixed(2) + '%');
                progressBar.style.width = progress + '%';
            },
            // Error
            (error) => {
                console.error('❌ Error al subir imagen:', error);
                uploadProgress.style.display = 'none';
                mostrarAlerta('Error al subir la imagen: ' + error.message, 'error');
            },
            // Completado
            async () => {
                try {
                    console.log('✅ Imagen subida correctamente');
                    const downloadURL = await getDownloadURL(imageRef);

                    // Actualizar foto en Auth
                    console.log('🔄 Actualizando perfil en Auth...');
                    await updateProfile(currentUser, {
                        photoURL: downloadURL
                    });

                    // Actualizar en Firestore
                    console.log('💾 Actualizando en Firestore...');
                    const userDocRef = doc(db, 'usuarios', currentUser.uid);
                    await updateDoc(userDocRef, {
                        fotoPerfil: downloadURL,
                        fechaActualizacionFoto: new Date().toISOString()
                    });

                    // Actualizar UI
                    profileImage.src = downloadURL;
                    console.log('✅ Foto de perfil actualizada');
                    mostrarAlerta('¡Foto de perfil actualizada exitosamente!', 'success');
                } catch (error) {
                    console.error('❌ Error al finalizar actualización:', error);
                    mostrarAlerta('Error al actualizar la foto: ' + error.message, 'error');
                } finally {
                    uploadProgress.style.display = 'none';
                }
            }
        );
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarAlerta(error.message, 'error');
    }
}

// Función para manejar el olvido de contraseña
async function handleForgotPassword() {
    try {
        if (!currentUser) {
            throw new Error('No hay usuario autenticado');
        }

        const result = await Swal.fire({
            title: 'Restablecer Contraseña',
            text: 'Se enviará un correo a tu dirección de email para restablecer tu contraseña',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Enviar correo',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await sendPasswordResetEmail(auth, currentUser.email);
            mostrarAlerta('Se ha enviado un correo para restablecer tu contraseña', 'success');
        }
    } catch (error) {
        console.error('Error al enviar correo de restablecimiento:', error);
        mostrarAlerta('Error al enviar el correo. Por favor, intenta más tarde.', 'error');
    }
}

// Eliminar cuenta
deleteAccountBtn.addEventListener('click', async () => {
    try {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará permanentemente tu cuenta y todos tus datos. No podrás recuperarlos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar cuenta',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        const user = auth.currentUser;
        if (!user) throw new Error('No hay usuario autenticado');

        // Eliminar foto de perfil
        if (user.photoURL) {
            const imageRef = ref(storage, `fotos-perfil/${user.uid}`);
            await deleteObject(imageRef).catch(console.error);
        }

        // Eliminar datos de Firestore
        const userDocRef = doc(db, 'usuarios', user.uid);
        await deleteDoc(userDocRef);

        // Eliminar cuenta de Auth
        await deleteUser(user);

        await Swal.fire(
            '¡Cuenta eliminada!',
            'Tu cuenta ha sido eliminada correctamente',
            'success'
        );

        // Redirigir al inicio
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar la cuenta. Por favor, intenta de nuevo más tarde.', 'error');
    }
});

// Formatear teléfono
phoneInput.addEventListener('input', (e) => formatearTelefono(e.target));

// Función para validar teléfono
function validarTelefono(telefono) {
    const telefonoRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return telefonoRegex.test(telefono);
}

// Función para formatear teléfono
function formatearTelefono(input) {
    let telefono = input.value.replace(/\D/g, '');
    if (telefono.length > 0) {
        if (telefono.length <= 3) {
            telefono = `+${telefono}`;
        } else if (telefono.length <= 6) {
            telefono = `+${telefono.slice(0,3)} ${telefono.slice(3)}`;
        } else {
            telefono = `+${telefono.slice(0,3)} ${telefono.slice(3,6)} ${telefono.slice(6,10)}`;
        }
        input.value = telefono;
    }
} 