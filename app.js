// Estas son las llaves que permiten a tu web escribir en la base de datos
const SUPABASE_URL = "https://pejxmmmvreffllovzjan.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const USER_ADMIN = "ilemerinadde";
const PASS_ADMIN = "ilemerinadde";
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

    if (!nombre) return alert("Pon un nombre");

    const { data, error } = await _supabase
        .from('plantas')
        .insert([{ nombre_comun: nombre, nombre_cientifico: cientifico }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("¡Planta guardada!");
        document.getElementById('nombre-comun').value = "";
        document.getElementById('nombre-cientifico').value = "";
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