// Estas son las llaves que permiten a tu web escribir en la base de datos
const SUPABASE_URL = "https://pejxmmmvreffllovzjan.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";
// ==========================================
// 1. CONFIGURACIÓN (Reemplaza con tus datos)
// ==========================================
const CLOUD_NAME = "TU_CLOUD_NAME_AQUI"; // Tu nombre de usuario en Cloudinary
const UPLOAD_PRESET = "plantas_preset"; // El preset "Unsigned" que creaste

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const USER_ADMIN = "ilemerinadde";
const PASS_ADMIN = "ilemerinadde";

console.log("App iniciada correctamente");

// ==========================================
// 2. NAVEGACIÓN Y VISTAS
// ==========================================
window.mostrarVista = function(idVista) {
    console.log("Cambiando a:", idVista);
    // Ocultamos todas las secciones
    document.getElementById('vista-pokedex').style.display = 'none';
    document.getElementById('vista-trabajo').style.display = 'none';
    document.getElementById('vista-admin').style.display = 'none';
    
    // Mostramos la sección elegida
    document.getElementById('vista-' + idVista).style.display = 'block';
    
    // Si entra a Pokedex, cargamos los datos automáticamente
    if (idVista === 'pokedex') {
        cargarPokedex();
    }
}

// ==========================================
// 3. SISTEMA DE LOGIN
// ==========================================
window.login = function() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;

    if (u === USER_ADMIN && p === PASS_ADMIN) {
        document.getElementById('login-seccion').style.display = 'none';
        document.getElementById('panel-admin').style.display = 'block';
        console.log("Login exitoso");
    } else {
        alert("Usuario o clave incorrectos");
    }
}

// ==========================================
// 4. FUNCIONES DE ADMINISTRADOR (CARGA)
// ==========================================

// Alternar entre formulario de Planta y Ubicación
window.mostrarFormAdmin = async function(tipo) {
    document.getElementById('form-planta').style.display = (tipo === 'planta') ? 'block' : 'none';
    document.getElementById('form-ubicacion').style.display = (tipo === 'ubicacion') ? 'block' : 'none';

    // Si abre ubicación, llenamos el selector con las plantas que ya existen
    if (tipo === 'ubicacion') {
        const { data } = await _supabase.from('plantas').select('id, nombre_comun');
        const select = document.getElementById('select-plantas-ubicacion');
        if (data) {
            select.innerHTML = data.map(p => `<option value="${p.id}">${p.nombre_comun}</option>`).join('');
        }
    }
}

// Vista previa de la foto en iPhone antes de subir
document.addEventListener('change', e => {
    if (e.target.id === 'foto-planta') {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('img-preview');
            preview.src = event.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(e.target.files[0]);
    }
});

// GUARDAR PLANTA + FOTO (Cloudinary)
window.crearPlanta = async function() {
    const nombre = document.getElementById('nombre-comun').value;
    const cientifico = document.getElementById('nombre-cientifico').value;
    const fotoInput = document.getElementById('foto-planta');

    if (!nombre || fotoInput.files.length === 0) {
        return alert("El nombre y la foto son obligatorios para el registro");
    }

    const file = fotoInput.files[0];
    
    try {
        // A. Subir imagen a Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/dk9faaztd/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error("Error al subir a Cloudinary");
        
        const json = await res.json();
        const urlFotoReal = json.secure_url;

        // B. Guardar datos en Supabase
        const { error } = await _supabase
            .from('plantas')
            .insert([{ 
                nombre_comun: nombre, 
                nombre_cientifico: cientifico,
                foto_url: urlFotoReal 
            }]);

        if (error) throw error;

        alert("✅ Planta y foto guardadas correctamente");
        location.reload(); 

    } catch (err) {
        alert("Hubo un error: " + err.message);
    }
}

// ==========================================
// 5. POKEDEX (MOSTRAR DATOS)
// ==========================================
window.cargarPokedex = async function() {
    const grid = document.getElementById('grid-plantas');
    const { data, error } = await _supabase.from('plantas').select('*');
    
    if (error || !data || data.length === 0) {
        grid.innerHTML = "<p>No hay plantas registradas aún.</p>";
        return;
    }

    grid.innerHTML = data.map(p => {
        // f_auto convierte HEIC de iPhone a JPG/WebP automáticamente
        const fotoOptimizada = p.foto_url ? p.foto_url.replace("/upload/", "/upload/f_auto,q_auto/") : "";
        
        return `
            <div class="card-planta">
                <img src="${fotoOptimizada}" style="width:100%; height:160px; object-fit:cover; border-radius:8px;">
                <h3>${p.nombre_comun}</h3>
                <p><i>${p.nombre_cientifico || ''}</i></p>
            </div>
        `;
    }).join('');
}

// ==========================================
// 6. GPS Y TRABAJO
// ==========================================
let latActual = null;
let lonActual = null;

window.usarGPS = function() {
    const status = document.getElementById('status-gps');
    navigator.geolocation.getCurrentPosition((pos) => {
        latActual = pos.coords.latitude;
        lonActual = pos.coords.longitude;
        status.innerText = `📍 Lat: ${latActual.toFixed(4)}, Lon: ${lonActual.toFixed(4)}`;
    }, () => {
        status.innerText = "⚠️ Error al obtener GPS";
    });
}

window.capturarGPSAdmin = function() {
    navigator.geolocation.getCurrentPosition((pos) => {
        latActual = pos.coords.latitude;
        lonActual = pos.coords.longitude;
        document.getElementById('coords-admin').innerText = `Lat: ${latActual.toFixed(6)}, Lon: ${lonActual.toFixed(6)}`;
    });
}

window.guardarUbicacion = async function() {
    const plantaId = document.getElementById('select-plantas-ubicacion').value;
    const ciudad = document.getElementById('u-ciudad').value;
    const distrito = document.getElementById('u-distrito').value;

    if (!latActual) return alert("Primero captura el GPS");

    const { error } = await _supabase.from('ubicaciones').insert([{
        planta_id: plantaId,
        ciudad: ciudad,
        distrito: distrito,
        latitud: latActual,
        longitud: lonActual
    }]);

    if (error) alert("Error: " + error.message);
    else alert("¡Ubicación guardada con éxito!");
}