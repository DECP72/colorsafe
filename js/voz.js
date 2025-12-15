// voz.js
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = 'es-ES';
recognition.interimResults = false;

const palabraClave =  localStorage.getItem('palabraClave') || 'auxilio';
let escuchando = false;

function OptenerPalabra() {
    escuchando = true;
    return new Promise((resolve, reject) => {
        
        recognition2 = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition2.lang = "es-AR";
        recognition2.interimResults = false;
        recognition2.continuous = false;

        recognition2.onresult = (event) => {
            const texto = event.results[event.results.length - 1][0].transcript.trim();
            resolve(texto); // <-- AQUÍ se devuelve el texto
        };

        recognition2.onerror = (event) => reject(event.error);

        recognition2.start();
    });
}

function iniciar() {
    escuchando = true;
    recognition.start();
}

function detener() {
    escuchando = false;
    recognition.stop();
}

function detenerAbruptamente() {
    escuchando = false;
    recognition.abort();
}

recognition.onresult = (event) => {
    const texto = event.results[event.results.length - 1][0].transcript;
    if (texto.toLowerCase().includes(palabraClave.toLowerCase())) {
        console.log("Coincide");
        leerTexto("Palabra reconocida");
    }
};

// Reanudar escucha automáticamente si el motor se detuvo solo
recognition.onend = () => {
    if (escuchando) {
        recognition.start();
    }
};

function leerTexto(text) {
    alert(palabraClave); // Mostrar alerta con el texto
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 0.7;
    speech.pitch = 1;
    speech.lang = 'es-ES';

    window.speechSynthesis.speak(speech);


}
