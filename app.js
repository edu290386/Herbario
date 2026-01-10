// Estas son las llaves que permiten a tu web escribir en la base de datos
const SUPABASE_URL = "https://pejxmmmvreffllovzjan.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const USER_ADMIN = "ilemerinadde";
const PASS_ADMIN = "ilemerinadde";
// Ejemplo de cómo mostraremos la foto para que acepte HEIC
const urlOptimizada = planta.foto_url.replace("/upload/", "/upload/f_auto,q_auto/");
// f_auto: convierte HEIC a JPG automáticamente
// q_auto: comprime la foto para que cargue rápido en el campo
console.log("Archivo app.js cargado correctamente");

// --- 2. NAVEGACIÓN (Funciones Globales) ---
window.mostrarVista = function(idVista) {
    console.log("Cambiando a:", idVista);
    document.getElementById('vista-pokedex').style.display = 'none';
    document.getElementById('vista-trabajo').style.display = 'none';
    document.getElementById('vista-admin').style.display = 'none';
    
    document.getElementById('vista-' + idVista).style.display = 'block';
}

// --- 3. ADMINISTRACIÓN ---
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

window.mostrarFormAdmin = function(tipo) {
    document.getElementById('form-planta').style.display = (tipo === 'planta') ? 'block' : 'none';
    // (Añadiremos el de ubicación en el siguiente paso)
}

window.crearPlanta = async function() {
    const nombre = document.getElementById('nombre-comun').value;
    const cientifico = document.getElementById('nombre-cientifico').value;
    const fotoInput = document.getElementById('foto-planta');

    if (!nombre || fotoInput.files.length === 0) {
        return alert("El nombre y la foto son obligatorios");
    }

    const file = fotoInput.files[0];
    
    // --- PASO A: SUBIR A CLOUDINARY ---
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'plantas_preset'); // El nombre que creaste

    try {
        const res = await fetch('https://api.cloudinary.com/v1_1/dk9faaztd/image/upload', {
            method: 'POST',
            body: formData
        });
        const json = await res.json();
        const urlFotoReal = json.secure_url; // Esta es la dirección de la foto en internet

        // --- PASO B: GUARDAR EN SUPABASE CON LA URL REAL ---
        const { error } = await _supabase
            .from('plantas')
            .insert([{ 
                nombre_comun: nombre, 
                nombre_cientifico: cientifico,
                foto_url: urlFotoReal 
            }]);

        if (error) throw error;

        alert("¡Planta y foto guardadas en la nube!");
        location.reload(); // Recarga para limpiar todo

    } catch (err) {
        alert("Error al subir: " + err.message);
    }
}

// --- 4. GPS ---
window.usarGPS = function() {
    const status = document.getElementById('status-gps');
    if (!navigator.geolocation) {
        status.innerText = "GPS no soportado";
    } else {
        status.innerText = "Localizando...";
        navigator.geolocation.getCurrentPosition((pos) => {
            status.innerText = `📍 Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`;
        }, () => {
            status.innerText = "Error al obtener GPS";
        });
    }
}