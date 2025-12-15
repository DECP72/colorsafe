// js/app.js - index + heart + periodic ping

// CORAZON: patrón 20 posiciones (1 = mostrar)
const heartPattern = [
  [0,1,1,0,1,1,0],
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0]
].map(r => r.map(v => v===1));

const correctSequence = ["9","1","1"];
let inputSequence = [];

function shuffle(array) { return array.sort(()=>Math.random()-0.5); }

function createHeart() {
  iniciar();
  const totalTrue = heartPattern.flat().filter(x=>x).length;
  // generar suficientes números 0-9 (se repiten si hace falta)
  const numbers = [];
  for (let i=0;i<totalTrue;i++) numbers.push((i%10).toString());
  const shuffled = shuffle(numbers);

  const heartContainer = document.getElementById('heart');
  heartContainer.innerHTML='';

  let idx=0;
  heartPattern.forEach(row=>{
    row.forEach(cell=>{
      const div = document.createElement('div');
      div.className='cell';
      if (cell) {
        const p = document.createElement('div');
        p.className='part';
        p.dataset.num = shuffled[idx];
        p.textContent = shuffled[idx];
        div.appendChild(p);
        idx++;
      }
      heartContainer.appendChild(div);
    });
  });

  // listeners
  document.querySelectorAll('.part').forEach(p=>{
    p.addEventListener('click', ()=>{
      const num = p.dataset.num;
      inputSequence.push(num);
      p.classList.add('active');
      if (!window.HIDE_SEQUENCE) {
        document.getElementById('status').textContent = 'Secuencia: '+inputSequence.join('');
      }
      if (inputSequence.join('') === correctSequence.join('')) {
        if (!window.HIDE_SEQUENCE) document.getElementById('status').textContent='✅ Acceso concedido';
        setTimeout(()=> location.href='menu.html', 400);
      } else if (inputSequence.length >= correctSequence.length) {
        // si se oculta la secuencia, simplemente limpiar sin mostrar mensaje
        if (!window.HIDE_SEQUENCE) document.getElementById('status').textContent='❌ Código incorrecto. Intenta de nuevo.';
        inputSequence=[];
        document.querySelectorAll('.part').forEach(x=>x.classList.remove('active'));
      }
    });
  });

  // ocultar status si se pidió
  if (window.HIDE_SEQUENCE) {
    const s = document.getElementById('status');
    if (s) s.style.display='none';
  }
}

// ********** PING periódico **********
// envia cada 10 minutos mientras la pagina esté visible.
const PING_INTERVAL_MS = 10*60*1000; // 10 minutos
let pingTimer = null;

async function sendPing() {
  const id = localStorage.getItem('id');
  const personal = localStorage.getItem('personalPhone') || null;
  if (!id) return;
  try {
    await fetch('http://localhost:3000/api/ping', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, personalPhone: personal, ts: Date.now() })
    });
    console.log('ping sent', id);
  } catch(e) {
    console.warn('ping error', e);
  }
}

function startPingLoop() {
  // si ya existe timer, no crear otro
  if (pingTimer) return;
  // enviar inmediatamente y luego cada 10'
  sendPing();
  pingTimer = setInterval(sendPing, PING_INTERVAL_MS);
}

function stopPingLoop() {
  if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
}

// controlar visibilidad de la pestaña para pausar pings si está oculta
document.addEventListener('visibilitychange', ()=>{
  if (document.visibilityState === 'visible') startPingLoop();
  else stopPingLoop();
});

// AL CARGAR index.html
window.addEventListener('load', ()=>{
  // si no hay id, ir a config
  if (!localStorage.getItem('idUsuario')) {
    location.href='config.html';
    return;
  }
  createHeart();
  // arrancar ping si la pestaña está visible
  if (document.visibilityState === 'visible') startPingLoop();
});


