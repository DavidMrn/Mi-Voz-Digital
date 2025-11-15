// API Base URL
const API_URL = 'http://localhost:3000/api';

// Estado global
let currentUser = null;
let currentFilter = 'all';
let votedItems = JSON.parse(localStorage.getItem('votedItems') || '[]');

// Filtros del líder
let leaderFilters = {
    comuna: '',
    categoria: '',
    tipo: '',
    estado: ''
};

// Datos de usuarios almacenados localmente
let usuariosCiudadanos = JSON.parse(localStorage.getItem('usuariosCiudadanos') || '[]');

// Credenciales del administrador (en producción esto estaría en el servidor)
// Se permite persistir en localStorage para poder cambiar/guardar la contraseña localmente
const DEFAULT_ADMIN = { usuario: 'admin', password: 'Admin123', nombre: 'Líder Local' };
let ADMIN_CREDENTIALS = JSON.parse(localStorage.getItem('adminCredentials')) || DEFAULT_ADMIN;

// Guardar admin por defecto si no existe
if (!localStorage.getItem('adminCredentials')) {
    localStorage.setItem('adminCredentials', JSON.stringify(DEFAULT_ADMIN));
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkSession();
});

function setupEventListeners() {
    // Form de login ciudadano
    const formLoginCiudadano = document.getElementById('form-login-ciudadano');
    if (formLoginCiudadano) {
        formLoginCiudadano.addEventListener('submit', handleLoginCiudadano);
    }

    // Form de registro ciudadano
    const formRegisterCiudadano = document.getElementById('form-register-ciudadano');
    if (formRegisterCiudadano) {
        formRegisterCiudadano.addEventListener('submit', handleRegisterCiudadano);
    }

    // Form de login líder
    const formLoginLider = document.getElementById('form-login-lider');
    if (formLoginLider) {
        formLoginLider.addEventListener('submit', handleLoginLider);
    }

    // Form de reporte
    const formReporte = document.getElementById('form-reporte');
    if (formReporte) {
        formReporte.addEventListener('submit', handleReporteSubmit);
    }
    // Form de propuesta
    const formPropuesta = document.getElementById('form-propuesta');
    if (formPropuesta) {
        formPropuesta.addEventListener('submit', handlePropuestaSubmit);
    }

    // Preview de imagen
    const reporteFoto = document.getElementById('reporte-foto');
    if (reporteFoto) {
        reporteFoto.addEventListener('change', handleImagePreview);
    }
}

async function handleRegisterCiudadano(e) {
    e.preventDefault();

    const nombre = document.getElementById('register-nombre').value.trim();
    const usuario = document.getElementById('register-usuario').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    // Validaciones
    if (nombre.length < 3) {
        alert('❌ El nombre debe tener al menos 3 caracteres');
        return;
    }

    if (usuario.length < 4) {
        alert('❌ El usuario debe tener al menos 4 caracteres');
        return;
    }

    if (password.length < 6) {
        alert('❌ La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== passwordConfirm) {
        alert('❌ Las contraseñas no coinciden');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, usuario, password })
        });

        if (res.ok) {
            const data = await res.json();

            // Guardar en cache local para UI
            const nuevoUsuario = { id: data.usuario.id, nombre: data.usuario.nombre, usuario: data.usuario.usuario };
            usuariosCiudadanos.push(nuevoUsuario);
            localStorage.setItem('usuariosCiudadanos', JSON.stringify(usuariosCiudadanos));

            alert('✅ Cuenta creada exitosamente. Por favor inicia sesión.');
            document.getElementById('form-register-ciudadano').reset();
            toggleAuthForm();
        } else {
            const err = await res.json();
            alert('❌ ' + (err.error || 'Error al registrar'));
        }
    } catch (error) {
        console.error('Registro error:', error);
        alert('❌ Error en la conexión al servidor');
    }
}

// ============= AUTENTICACIÓN CIUDADANO =============

function showLoginType(tipo) {
    if (tipo === 'ciudadano') {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('ciudadano-login-screen').classList.add('active');
        document.getElementById('login-form-container').classList.add('active');
        document.getElementById('register-form-container').classList.remove('active');
    } else {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('lider-login-screen').classList.add('active');
    }
}

function toggleAuthForm() {
    document.getElementById('login-form-container').classList.toggle('active');
    document.getElementById('register-form-container').classList.toggle('active');
}

function backToMainLogin() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('ciudadano-login-screen').classList.remove('active');
    document.getElementById('lider-login-screen').classList.remove('active');
    
    // Limpiar formularios
    document.getElementById('form-login-ciudadano')?.reset();
    document.getElementById('form-register-ciudadano')?.reset();
    document.getElementById('form-login-lider')?.reset();
}

async function handleLoginCiudadano(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('login-usuario').value.trim();
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = {
                tipo: 'ciudadano',
                nombre: data.usuario.nombre,
                usuario: data.usuario.usuario,
                id: data.usuario.id
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // update local cache of usuariosCiudadanos
            if (!usuariosCiudadanos.find(u => u.usuario === currentUser.usuario)) {
                usuariosCiudadanos.push({ id: currentUser.id, nombre: currentUser.nombre, usuario: currentUser.usuario });
                localStorage.setItem('usuariosCiudadanos', JSON.stringify(usuariosCiudadanos));
            }

            document.getElementById('ciudadano-login-screen').classList.remove('active');
            document.getElementById('ciudadano-dashboard').classList.add('active');
            document.getElementById('user-name').textContent = currentUser.nombre || currentUser.usuario;
            loadPanel();
        } else {
            const err = await res.json();
            alert('❌ ' + (err.error || 'Usuario o contraseña incorrectos'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Error en la conexión al servidor');
    }
}



// ============= AUTENTICACIÓN ADMINISTRADOR =============

function handleLoginLider(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('lider-usuario').value.trim();
    const password = document.getElementById('lider-password').value;
    
    // Validar credenciales del administrador
    if (usuario === ADMIN_CREDENTIALS.usuario && password === ADMIN_CREDENTIALS.password) {
        // Login exitoso
        currentUser = {
            tipo: 'lider',
            // usar nombre guardado en credenciales si existe
            nombre: ADMIN_CREDENTIALS.nombre || usuario,
            usuario: usuario,
            id: Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        document.getElementById('lider-login-screen').classList.remove('active');
        document.getElementById('lider-dashboard').classList.add('active');
        document.getElementById('leader-name').textContent = currentUser.nombre;
        loadLeaderPanel();
    } else {
        alert('❌ Usuario o contraseña de administrador incorrectos');
    }
}

// ============= LOGOUT =============

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('ciudadano-dashboard').classList.remove('active');
    document.getElementById('lider-dashboard').classList.remove('active');
    document.getElementById('ciudadano-login-screen').classList.remove('active');
    document.getElementById('lider-login-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
}

function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.tipo === 'ciudadano') {
            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('ciudadano-login-screen').classList.remove('active');
            document.getElementById('ciudadano-dashboard').classList.add('active');
            document.getElementById('user-name').textContent = currentUser.nombre;
            loadPanel();
        } else {
            document.getElementById('login-screen').classList.remove('active');
            document.getElementById('lider-login-screen').classList.remove('active');
            document.getElementById('lider-dashboard').classList.add('active');
            document.getElementById('leader-name').textContent = currentUser.nombre;
            loadLeaderPanel();
        }
    }
}

// Tabs
function showTab(tabName) {
    // Remover active de todos los tabs
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar el tab seleccionado
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    if (tabName === 'panel') {
        loadPanel();
    }
}

// Geolocalización
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('reporte-lat').value = position.coords.latitude.toFixed(4);
                document.getElementById('reporte-lng').value = position.coords.longitude.toFixed(4);
                alert('📍 Ubicación obtenida correctamente');
            },
            (error) => {
                alert('❌ No se pudo obtener la ubicación: ' + error.message);
            }
        );
    } else {
        alert('❌ Tu navegador no soporta geolocalización');
    }
}

// Preview de imagen
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('reporte-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Submit Reporte
async function handleReporteSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Debes iniciar sesión para enviar un reporte');
        return;
    }

    const formData = {
        tipo: 'reporte',
        titulo: document.getElementById('reporte-titulo').value,
        descripcion: document.getElementById('reporte-descripcion').value,
        comuna: document.getElementById('reporte-comuna').value,
        latitud: document.getElementById('reporte-lat').value,
        longitud: document.getElementById('reporte-lng').value,
        imagen: document.getElementById('reporte-preview').querySelector('img')?.src || null,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        votos: 0,
        autor: currentUser.nombre || currentUser.usuario,
        autorUsuario: currentUser.usuario
    };
    
    try {
        const response = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('✅ Reporte enviado exitosamente');
            e.target.reset();
            document.getElementById('reporte-preview').innerHTML = '';
            showTab('panel');
            loadPanel();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al enviar el reporte');
    }
}

// Submit Propuesta
async function handlePropuestaSubmit(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Debes iniciar sesión para publicar una propuesta');
        return;
    }

    const formData = {
        tipo: 'propuesta',
        titulo: document.getElementById('propuesta-titulo').value,
        descripcion: document.getElementById('propuesta-descripcion').value,
        comuna: document.getElementById('propuesta-comuna').value,
        categoria: document.getElementById('propuesta-categoria').value,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        votos: 0,
        autor: currentUser.nombre || currentUser.usuario,
        autorUsuario: currentUser.usuario
    };
    
    try {
        const response = await fetch(`${API_URL}/propuestas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('✅ Propuesta publicada exitosamente');
            e.target.reset();
            showTab('panel');
            loadPanel();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al publicar la propuesta');
    }
}

// Cargar Panel
async function loadPanel() {
    try {
        const [reportesRes, propuestasRes] = await Promise.all([
            fetch(`${API_URL}/reportes`),
            fetch(`${API_URL}/propuestas`)
        ]);
        
        const reportes = await reportesRes.json();
        const propuestas = await propuestasRes.json();
        
        const allItems = [...reportes, ...propuestas];
        displayItems(allItems, 'items-list');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('items-list').innerHTML = '<p>Error al cargar los datos</p>';
    }
}

// Cargar Panel de Líder
async function loadLeaderPanel() {
    try {
        const [reportesRes, propuestasRes] = await Promise.all([
            fetch(`${API_URL}/reportes`),
            fetch(`${API_URL}/propuestas`)
        ]);
        
        const reportes = await reportesRes.json();
        const propuestas = await propuestasRes.json();
        
        const allItems = [...reportes, ...propuestas];
        
        // Actualizar estadísticas (sin filtros)
        document.getElementById('stat-reportes').textContent = reportes.length;
        document.getElementById('stat-propuestas').textContent = propuestas.length;
        document.getElementById('stat-pendientes').textContent = 
            allItems.filter(i => i.estado === 'pendiente').length;
        document.getElementById('stat-resueltos').textContent = 
            allItems.filter(i => i.estado === 'resuelto').length;
        
        // Aplicar filtros
        const filteredItems = applyLeaderFiltersToItems(allItems);
        
        // Mostrar items con filtros aplicados
        displayItems(filteredItems, 'leader-items-list', true);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar items
function displayItems(items, containerId, isLeader = false) {
    const container = document.getElementById(containerId);
    
    // Aplicar filtros
    let filteredItems = items;
    if (currentFilter === 'recent') {
        filteredItems = items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } else if (currentFilter === 'popular') {
        filteredItems = items.sort((a, b) => b.votos - a.votos);
    }
    
    if (filteredItems.length === 0) {
        container.innerHTML = '<p>No hay reportes o propuestas disponibles</p>';
        return;
    }
    
    container.innerHTML = filteredItems.map(item => {
        const isVoted = votedItems.includes(item.id);
        const comunaNombre = getComunaNombre(item.comuna);
        
        return `
            <div class="item-card">
                <div class="item-header">
                    <span class="item-type type-${item.tipo}">${item.tipo === 'reporte' ? '📍 Reporte' : '💡 Propuesta'}</span>
                    <span class="item-status status-${item.estado}">${getEstadoLabel(item.estado)}</span>
                </div>
                
                <h3 class="item-title">${item.titulo}</h3>
                <p class="item-description">${item.descripcion.substring(0, 150)}...</p>
                
                <div class="item-meta">
                    <span>📍 ${comunaNombre}</span>
                    <span>📅 ${formatDate(item.fecha)}</span>
                    <span>👤 ${item.autor || item.autorUsuario || 'Anónimo'}</span>
                </div>
                
                ${item.imagen ? `<img src="${item.imagen}" class="item-image" alt="Foto del reporte">` : ''}
                
                ${isLeader ? `
                    <div class="leader-actions">
                        <button class="btn-status pendiente" onclick="changeStatus('${item.id}', '${item.tipo}', 'pendiente')">⏳ Pendiente</button>
                        <button class="btn-status en-proceso" onclick="changeStatus('${item.id}', '${item.tipo}', 'en-proceso')">🔄 En Proceso</button>
                        <button class="btn-status resuelto" onclick="changeStatus('${item.id}', '${item.tipo}', 'resuelto')">✅ Resuelto</button>
                    </div>
                ` : `
                    <div class="item-actions">
                        <button class="btn-vote ${isVoted ? 'voted' : ''}" onclick="voteItem('${item.id}', '${item.tipo}')">
                            👍 ${item.votos} ${isVoted ? 'Votado' : 'Votar'}
                        </button>
                        <button class="btn-view" onclick="viewDetails('${item.id}', '${item.tipo}')">Ver más</button>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

// Votar item
async function voteItem(id, tipo) {
    console.log('voteItem llamado con id:', id, 'tipo:', tipo);
    
    if (votedItems.includes(id)) {
        alert('Ya has votado por este item');
        return;
    }
    
    try {
        const endpoint = tipo === 'reporte' ? 'reportes' : 'propuestas';
        const url = `${API_URL}/${endpoint}/${id}/votar`;
        console.log('Enviando POST a:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (response.ok) {
            votedItems.push(id);
            localStorage.setItem('votedItems', JSON.stringify(votedItems));
            alert('¡Voto registrado!');
            loadPanel();
        } else {
            alert('Error: ' + (data.error || 'No se pudo registrar el voto'));
        }
    } catch (error) {
        console.error('Error al votar:', error);
        alert('Error al votar: ' + error.message);
    }
}

// Cambiar estado (Líder)
async function changeStatus(id, tipo, nuevoEstado) {
    try {
        const endpoint = tipo === 'reporte' ? 'reportes' : 'propuestas';
        const response = await fetch(`${API_URL}/${endpoint}/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        if (response.ok) {
            alert(`✅ Estado actualizado a: ${getEstadoLabel(nuevoEstado)}`);
            loadLeaderPanel();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar el estado');
    }
}

// Filtros
function filterItems(filter) {
    currentFilter = filter;
    
    // Actualizar botones
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadPanel();
}

// Ver detalles
function viewDetails(id, tipo) {
    // Implementar modal con detalles completos
    alert('Función de ver detalles - ID: ' + id);
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// ============= FILTROS DEL LÍDER =============

function applyLeaderFilters() {
    // Obtener valores de los selects
    leaderFilters.comuna = document.getElementById('filter-comuna-leader').value;
    leaderFilters.categoria = document.getElementById('filter-categoria-leader').value;
    leaderFilters.tipo = document.getElementById('filter-tipo-leader').value;
    leaderFilters.estado = document.getElementById('filter-estado-leader').value;
    
    // Recargar el panel con los filtros aplicados
    loadLeaderPanel();
}

function resetLeaderFilters() {
    // Limpiar todos los filtros
    leaderFilters = { comuna: '', categoria: '', tipo: '', estado: '' };
    
    // Resetear los valores de los selects
    document.getElementById('filter-comuna-leader').value = '';
    document.getElementById('filter-categoria-leader').value = '';
    document.getElementById('filter-tipo-leader').value = '';
    document.getElementById('filter-estado-leader').value = '';
    
    // Recargar panel sin filtros
    loadLeaderPanel();
}

function applyLeaderFiltersToItems(items) {
    // Aplicar filtros a la lista de items
    return items.filter(item => {
        const comunaMatch = !leaderFilters.comuna || item.comuna === leaderFilters.comuna;
        const categoriaMatch = !leaderFilters.categoria || item.categoria === leaderFilters.categoria;
        const tipoMatch = !leaderFilters.tipo || item.tipo === leaderFilters.tipo;
        const estadoMatch = !leaderFilters.estado || item.estado === leaderFilters.estado;
        
        return comunaMatch && categoriaMatch && tipoMatch && estadoMatch;
    });
}

// Utilidades
function getComunaNombre(numero) {
    const comunas = {
        '1': 'Popular', '2': 'Santa Cruz', '3': 'Manrique', '4': 'Aranjuez',
        '5': 'Castilla', '6': 'Doce de Octubre', '7': 'Robledo', '8': 'Villa Hermosa',
        '9': 'Buenos Aires', '10': 'La Candelaria', '11': 'Laureles-Estadio',
        '12': 'La América', '13': 'San Javier', '14': 'El Poblado',
        '15': 'Guayabal', '16': 'Belén'
    };
    return `Comuna ${numero} - ${comunas[numero]}`;
}

function getEstadoLabel(estado) {
    const labels = {
        'pendiente': '⏳ Pendiente',
        'en-proceso': '🔄 En Proceso',
        'resuelto': '✅ Resuelto'
    };
    return labels[estado] || estado;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-CO');
}