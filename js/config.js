// js/config.js
const deviceIdSpan = document.getElementById('deviceId');
const cfgStatus = document.getElementById('cfgStatus');
const deleteBtn = document.getElementById('deleteBtn');
const deleteOptions = document.getElementById('deleteOptions');
const sendBtn = document.getElementById('sendBtn');
const changePhoneBtn = document.getElementById('changePhoneBtn');
const IntPalabraClave = document.getElementById('intPalabraClave');

async function OptenerPalabraClave() {
  try {
    const palabraClave = await OptenerPalabra();
    IntPalabraClave.value = palabraClave;
    IntPalabraClave.type = 'text';
    localStorage.setItem('palabraClave', palabraClave);
    cfgStatus.textContent = 'Palabra clave registrada';
  } catch (e) {
    console.error(e);
    cfgStatus.textContent = 'Error al capturar la palabra clave';
  }
}


function readLocal() {
  const id = localStorage.getItem('idUsuario');
  deviceIdSpan.textContent = id ? id : '(sin asignar)';
  const c = JSON.parse(localStorage.getItem('misContactos') || '[]');
  for (let i=1;i<=5;i++) document.getElementById('c'+i).value = c[i-1] || '';
  document.getElementById('personalPhone').value = localStorage.getItem('personalPhone') || '';
  document.getElementById('emergencyPhone').value = localStorage.getItem('emergencyPhone') || '';
  document.getElementById('Nombre').value = localStorage.getItem('Nombre') || '';
  document.getElementById('locText').textContent = localStorage.getItem('locationText') || '(no detectada)';
  if (!id) {
    cfgStatus.textContent = 'Por favor, completa el formulario y presiona Enviar para registrarte.';
    alert(
      'Bienvenido/a.\n\n' +
      'Para comenzar su registro, diga cuál será su palabra clave.\n' +
      'Luego complete el formulario y presione Enviar para registrarse.'
    );
    OptenerPalabraClave();
  }
}

async function getLocation() {
  cfgStatus.textContent = 'Obteniendo ubicación...';
  if (!navigator.geolocation) { cfgStatus.textContent='Geolocalización no soportada'; return; }
  navigator.geolocation.getCurrentPosition(async pos=>{
    const txt = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    localStorage.setItem('locationText', txt);
    localStorage.setItem('locationLat', pos.coords.latitude);
    localStorage.setItem('locationLon', pos.coords.longitude);
    document.getElementById('locText').textContent = txt;
    cfgStatus.textContent = 'Ubicación actualizada';
  }, err=> {
    cfgStatus.textContent = 'No se pudo obtener ubicación';
    console.error(err);
  }, { enableHighAccuracy:true });
}

async function requestNearbyContacts(lat, lon) {
  // Llamada al server que devuelve contactos sugeridos según ubicación
  try {
    const res = await fetch('http://localhost:3000/api/nearby-contacts', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ lat, lon })
    });
    if (!res.ok) return [];
    const j = await res.json();
    return j.contactos || [];
  } catch(e) {
    console.warn('nearby contacts error', e);
    return [];
  }
}

async function guardarOActualizar() {
  const contactos = [];
  for (let i=1;i<=5;i++) {
    const v = document.getElementById('c'+i).value.trim();
    if (v) contactos.push(v);
  }

  const personal = document.getElementById('personalPhone').value.trim();
  const emergency = document.getElementById('emergencyPhone').value.trim();
  const nombre = document.getElementById('Nombre').value.trim();
  const lat = Number(localStorage.getItem('locationLat') || 0);
  const lon = Number(localStorage.getItem('locationLon') || 0);

  // si no hay contactos, pedir sugerencias al servidor
  // let finalContacts = contactos;
  // if (finalContacts.length === 0 && lat && lon) {
  //   cfgStatus.textContent = 'Solicitando contactos cercanos...';
  //   const sugest = await requestNearbyContacts(lat, lon);
  //   if (sugest.length) {
  //     // llenar inputs con sugerencias
  //     for (let i=1;i<=5;i++) {
  //       document.getElementById('c'+i).value = sugest[i-1] || '';
  //     }
  //     finalContacts = sugest;
  //   }
  // }

  // Si no hay id: registrar
  const id = localStorage.getItem('idUsuario');
  if (!id) {
    // enviar registro al server
    cfgStatus.textContent = 'Registrando...';
    try {
      // const res = await fetch('http://localhost:3000/api/register', {
      //   method:'POST',
      //   headers:{'Content-Type':'application/json'},
      //   body: JSON.stringify({ personal, emergency, contactos: finalContacts, lat, lon })
      // });
      const j = "15" //await res.json();
      const deviceID = crypto.randomUUID()
      if (j) {
        localStorage.setItem('idUsuario', j);
        localStorage.setItem("device_id", deviceID);
        //localStorage.setItem('misContactos', JSON.stringify(finalContacts));
        localStorage.setItem('personalPhone', personal);
        localStorage.setItem('emergencyPhone', emergency);
        localStorage.setItem('Nombre', nombre);
        cfgStatus.textContent = '✅ Registrado. ID: ' + j;
        deviceIdSpan.textContent = j;
        iniciar();  
        location.href='index.html';
      } else {
        cfgStatus.textContent = 'Error en registro';
      }
    } catch(e) {
      console.error(e);
      cfgStatus.textContent = 'Error comunicando con servidor';
    }
  } else {
    // actualizar
    cfgStatus.textContent = 'Actualizando...';
    try {
      const res = await fetch('http://localhost:3000/api/update', {
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id, personal, emergency, contactos: finalContacts, lat, lon })
      });
      const j = await res.json();
      if (j && j.ok) {
        localStorage.setItem('misContactos', JSON.stringify(finalContacts));
        localStorage.setItem('personalPhone', personal);
        localStorage.setItem('emergencyPhone', emergency);
        localStorage.setItem('Nombre', nombre);
        cfgStatus.textContent = '✅ Actualizado';
        iniciar();
        location.href='index.html';
      } else cfgStatus.textContent='Error al actualizar';
    } catch(e) {
      console.error(e);
      cfgStatus.textContent='Error comunicando con servidor';
    }
  }
}

function toggleDeleteOptions(show) {
  deleteOptions.style.display = show ? 'block' : 'none';
}

function deleteMyData() {
  const id = localStorage.getItem('idUsuario');
  const idUsuario = localStorage.getItem("idUsuario");
  if (!id) return cfgStatus.textContent='No hay id';
  //fetch('http://localhost:3000/api/delete', {
  //  method:'POST',
  //  headers:{'Content-Type':'application/json'},
  //  body: JSON.stringify({ id, action: 'delete_my_data' })
  //}).then(()=> {
    // limpiar local
    localStorage.removeItem('idUsuario');
    localStorage.removeItem("device_id");
    localStorage.removeItem('misContactos');
    localStorage.removeItem('personalPhone');
    localStorage.removeItem('emergencyPhone');
    localStorage.removeItem('Nombre');
    localStorage.removeItem('locationLat');
    localStorage.removeItem('locationLon');
    localStorage.removeItem('locationText');
    localStorage.removeItem('palabraClave');
    cfgStatus.textContent='Datos borrados';
    deviceIdSpan.textContent='(sin asignar)';
  //}).catch(()=> cfgStatus.textContent='Error borrando');
  toggleDeleteOptions(false);
}

function deleteMyContacts() {
  localStorage.removeItem('misContactos');
  cfgStatus.textContent='Contactos borrados localmente';
  // pedir sugerencias del servidor si hay ubicación
  const lat = Number(localStorage.getItem('locationLat') || 0);
  const lon = Number(localStorage.getItem('locationLon') || 0);
  if (lat && lon) {
    requestNearbyContacts(lat, lon).then(sug => {
      for (let i=1;i<=5;i++) document.getElementById('c'+i).value = sug[i-1] || '';
      cfgStatus.textContent='Contactos sugeridos cargados';
    });
  }
  toggleDeleteOptions(false);
}

function unlockPhoneChange() {
  document.getElementById('personalPhone').disabled = false;
  cfgStatus.textContent = 'Editá tu teléfono y luego presioná Enviar/Actualizar';
  toggleDeleteOptions(false);
}

function changePhone() {
  // habilita manualmente el input para cambiar teléfono
  document.getElementById('personalPhone').disabled = false;
}

sendBtn.addEventListener('click', guardarOActualizar);
deleteBtn.addEventListener('click', ()=> toggleDeleteOptions(true));
changePhoneBtn.addEventListener('click', changePhone);

// inicializar UI con datos locales
readLocal();
