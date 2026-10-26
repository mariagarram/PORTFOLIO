// Contenido de terceros (prototipos de Figma) que solo se carga si la persona lo acepta.
// Figma usa sus propias cookies, así que hasta que se pulsa "Cargar" no se conecta con Figma.
// La elección "recordar" se guarda solo en este navegador y se puede retirar en cookies.html.
(function () {
  var CLAVE = 'garram-consentimiento-figma';

  function leer() {
    try { return localStorage.getItem(CLAVE) === 'si'; } catch (e) { return false; }
  }
  function guardar(valor) {
    try {
      if (valor) localStorage.setItem(CLAVE, 'si');
      else localStorage.removeItem(CLAVE);
    } catch (e) { /* sin almacenamiento: se preguntará cada vez */ }
  }

  function cargar(gate) {
    var frame = gate.parentNode.querySelector('iframe[data-src]');
    if (!frame) return;
    frame.src = frame.getAttribute('data-src');
    frame.removeAttribute('data-src');
    frame.hidden = false;
    gate.remove();
  }

  var gates = document.querySelectorAll('.embed-gate');
  if (gates.length) {
    if (leer()) {
      gates.forEach(cargar);
    } else {
      gates.forEach(function (gate) {
        var btn = gate.querySelector('[data-load]');
        btn.addEventListener('click', function () {
          var recordar = gate.querySelector('[data-remember]');
          if (recordar && recordar.checked) {
            guardar(true);
            document.querySelectorAll('.embed-gate').forEach(cargar);
          } else {
            cargar(gate);
          }
        });
      });
    }
  }

  // Página de cookies: estado actual y botón para retirar el consentimiento
  var estado = document.getElementById('estadoConsentimiento');
  var retirar = document.getElementById('retirarConsentimiento');
  function pinta() {
    if (!estado) return;
    var si = leer();
    estado.textContent = si
      ? 'Has aceptado que los prototipos de Figma se carguen automáticamente en este navegador.'
      : 'No has aceptado la carga automática de Figma. Los prototipos solo se cargan si pulsas el botón en cada uno.';
    if (retirar) retirar.hidden = !si;
  }
  if (retirar) {
    retirar.addEventListener('click', function () { guardar(false); pinta(); });
  }
  pinta();
})();
