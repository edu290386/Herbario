// Estas son las llaves que permiten a tu web escribir en la base de datos
const SUPABASE_URL = "https://pejxmmmvreffllovzjan.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlanhtbW12cmVmZmxsb3Z6amFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTQ4MzgsImV4cCI6MjA4MzU5MDgzOH0.XiZddvHzJBN8nbwEgA_BHUDyKzF0_EdFLFg-S4n5acU";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Usuario y contraseña que definimos
const USER_ADMIN = "ilemerinadde";
const PASS_ADMIN = "ilemerinadde";

// Función para cambiar entre las pestañas (Pokedex, Trabajo, Admin)
function mostrarVista(idVista) {
    // Ocultamos todas las vistas primero
    document.getElementById('vista-pokedex').style.display = 'none';
    document.getElementById('vista-trabajo').style.display = 'none';
    document.getElementById('vista-admin').style.display = 'none';
    
    // Mostramos solo la que queremos
    document.getElementById('vista-' + idVista).style.display = 'block';
}

console.log("Conexión con Supabase lista");