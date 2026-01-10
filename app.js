// Estas son las llaves que permiten a tu web escribir en la base de datos
const SUPABASE_URL = "https://pejxmmmvreffllovzjan.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";
// ==========================================
// 1. CONFIGURACIÓN (Reemplaza con tus datos)
// ==========================================
const CLOUD_NAME = "dk9faaztd"; // Tu nombre de usuario en Cloudinary
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
    // 1. CAPTURA DE ELEMENTOS (Buscamos los objetos en el HTML)
    const btnGuardar = document.getElementById('btn-guardar-planta');
    const inputNombre = document.getElementById('nombre-comun');
    const inputCientifico = document.getElementById('nombre-cientifico');
    const inputFoto = document.getElementById('foto-planta');

    // 2. EXTRACCIÓN DE VALORES (Capturamos lo que el usuario escribió/subió)
    const nombreValor = inputNombre ? inputNombre.value.trim() : "";
    const cientificoValor = inputCientifico ? inputCientifico.value.trim() : "";
    const tieneFoto = inputFoto && inputFoto.files.length > 0;

    // 3. VALIDACIÓN DETALLADA (Para saber exactamente qué campo falla)
    if (!nombreValor) {
        return alert("❌ Error: El campo 'Nombre Común' está vacío.");
    }
    if (!tieneFoto) {
        return alert("❌ Error: No has seleccionado ninguna foto.");
    }

    // 4. BLOQUEO DE SEGURIDAD (Evita duplicados)
    if (btnGuardar) {
        if (btnGuardar.disabled) return; 
        btnGuardar.disabled = true;
        btnGuardar.innerText = "Subiendo imagen... ⏳";
    }

    try {
        // 5. PROCESO DE SUBIDA A CLOUDINARY
        const file = inputFoto.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const resCloud = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const jsonCloud = await resCloud.json();
        if (!resCloud.ok) throw new Error("Cloudinary: " + jsonCloud.error.message);

        const urlFotoReal = jsonCloud.secure_url;

        // 6. GUARDAR EN SUPABASE (Tabla: plantas)
        const { data: plantasCreadas, error: errPlanta } = await _supabase
            .from('plantas')
            .insert([{ 
                nombre_comun: nombreValor, 
                nombre_cientifico: cientificoValor,
                foto_url: urlFotoReal 
            }])
            .select('*');

        if (errPlanta) throw errPlanta;
        const nuevaPlanta = plantasCreadas[0];

        // 7. PROCESO DE GPS CON CONFIRMACIÓN
        const deseaUbicacion = confirm("✅ ¡Planta guardada! ¿Deseas registrar la ubicación GPS actual?");
        
        if (deseaUbicacion) {
            if (btnGuardar) btnGuardar.innerText = "Obteniendo GPS... 📍";
            
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { error: errUbi } = await _supabase.from('ubicaciones').insert([{
                    planta_id: nuevaPlanta.id,
                    latitud: pos.coords.latitude,
                    longitud: pos.coords.longitude,
                    ciudad: "Registro Automático",
                    distrito: "Punto de Campo",
                    verificada: false
                }]);
                
                if (errUbi) alert("Planta guardada, pero el GPS falló: " + errUbi.message);
                else alert("¡Todo guardado con éxito! 📍");
                location.reload();
            }, (error) => {
                alert("No se pudo obtener el GPS: " + error.message);
                location.reload();
            }, { enableHighAccuracy: true, timeout: 10000 });
        } else {
            alert("Planta guardada (sin ubicación).");
            location.reload();
        }

    } catch (err) {
        alert("❌ Error crítico: " + err.message);
        
        // 8. RESET DEL BOTÓN (En caso de fallo para permitir reintento)
        if (btnGuardar) {
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Planta";
        }
    }
}; 
// ==========================================
// 5. POKEDEX (MOSTRAR DATOS)
// ==========================================
// Variable global para guardar los datos y que el buscador sea instantáneo
let todasLasPlantas = []; 

window.cargarPokedex = async function() {
    console.log("Cargando datos de la Pokedex...");
    const grid = document.getElementById('grid-plantas');
    
    // Traemos los datos de Supabase
    const { data, error } = await _supabase
        .from('plantas')
        .select('*')
        .order('nombre_comun', { ascending: true }); // Ordenadas alfabéticamente
    
    if (error) {
        console.error("Error en Supabase:", error);
        grid.innerHTML = "<p>Error al cargar los datos.</p>";
        return;
    }

    // Guardamos en la variable global y dibujamos
    todasLasPlantas = data || [];
    renderizarPlantas(todasLasPlantas);
}

// Función encargada de crear el HTML de las tarjetas
function renderizarPlantas(lista) {
    const grid = document.getElementById('grid-plantas');
    
    if (lista.length === 0) {
        grid.innerHTML = "<p style='text-align:center; color:gray;'>No se encontraron plantas.</p>";
        return;
    }

    grid.innerHTML = lista.map(p => {
        // f_auto: formato automático (HEIC a JPG/WebP)
        // q_auto: calidad automática para que cargue rápido en el cel
        const fotoOptimizada = p.foto_url 
            ? p.foto_url.replace("/upload/", "/upload/f_auto,q_auto/") 
            : "https://via.placeholder.com/150?text=Sin+Foto";

        return `
            <div class="card-planta" style="border:1px solid #ddd; border-radius:12px; padding:10px; background:#fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <img src="${fotoOptimizada}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;">
                <h3 style="margin: 10px 0 5px 0; color: #2e7d32;">${p.nombre_comun}</h3>
                <p style="margin:0; font-style:italic; color: #666;">${p.nombre_cientifico || 'S/N científico'}</p>
            </div>
        `;
    }).join('');
}

// Función del Buscador (se activa al escribir en el input)
window.filtrarPlantas = function() {
    const termino = document.getElementById('buscador-planta').value.toLowerCase();
    
    // Filtramos la lista local sin pedir datos a internet otra vez
    const filtradas = todasLasPlantas.filter(p => {
        const nComun = (p.nombre_comun || "").toLowerCase();
        const nCientifico = (p.nombre_cientifico || "").toLowerCase();
        return nComun.includes(termino) || nCientifico.includes(termino);
    });

    renderizarPlantas(filtradas);
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