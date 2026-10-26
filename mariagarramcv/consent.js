// Aviso de cookies de garram.studio.
// - Estadísticas (Cloudflare Web Analytics): solo se cargan si la persona lo acepta.
// - Contenido externo (prototipos de Figma, que usan sus propias cookies): igual.
// La elección se guarda en este navegador ("garram-cookies") y se puede cambiar
// en cualquier momento desde "Configurar cookies" en el pie o en cookies.html.
(function () {
  // Pega aquí el token de Cloudflare Web Analytics (Panel de Cloudflare > Analytics & Logs > Web Analytics).
  // Mientras esté vacío, el banner funciona igual pero no se mide nada.
  var CF_TOKEN = '';

  var CLAVE = 'garram-cookies';

  function leer() {
    try {
      var v = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (v && typeof v === 'object') return v;
      if (localStorage.getItem('garram-consentimiento-figma') === 'si') return { analitica: false, externo: true };
    } catch (e) {}
    return null;
  }
  function guardar(eleccion) {
    eleccion.fecha = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(eleccion));
      localStorage.removeItem('garram-consentimiento-figma');
    } catch (e) {}
    aplicar(eleccion);
    pintaEstado();
  }

  // ── Activar lo aceptado ──
  var analiticaCargada = false;
  function aplicar(e) {
    if (!e) return;
    if (e.analitica && CF_TOKEN && !analiticaCargada) {
      var s = document.createElement('script');
      s.defer = true;
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
      document.head.appendChild(s);
      analiticaCargada = true;
    }
    if (e.externo) document.querySelectorAll('.embed-gate').forEach(cargarEmbed);
  }

  function cargarEmbed(gate) {
    var frame = gate.parentNode && gate.parentNode.querySelector('iframe[data-src]');
    if (!frame) return;
    frame.src = frame.getAttribute('data-src');
    frame.removeAttribute('data-src');
    frame.hidden = false;
    gate.remove();
  }

  // Botones de cada prototipo de Figma
  document.querySelectorAll('.embed-gate').forEach(function (gate) {
    var btn = gate.querySelector('[data-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var recordar = gate.querySelector('[data-remember]');
      if (recordar && recordar.checked) {
        var actual = leer() || { analitica: false };
        actual.externo = true;
        guardar(actual);
        cerrarBanner();
      } else {
        cargarEmbed(gate);
      }
    });
  });

  // ── Banner ──
  var banner;
  function crearBanner() {
    var e = leer() || { analitica: false, externo: false };
    banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<div class="win-bar"><span class="dots"><b></b><b></b><b></b></span><span class="fname">cookies.txt</span></div>' +
      '<div class="cookie-body">' +
        '<p class="cookie-title">¿Me dejas medir las visitas?</p>' +
        '<p>Uso estadísticas anónimas para saber qué páginas se ven, y algunos proyectos cargan prototipos de Figma, que usa sus propias cookies. Solo se activan si aceptas. <a href="cookies.html">Política de cookies</a></p>' +
        '<div class="cookie-opts" hidden>' +
          '<label><input type="checkbox" checked disabled> <span><strong>Necesarias</strong> Guardan tu elección. Siempre activas.</span></label>' +
          '<label><input type="checkbox" id="ck-analitica"' + (e.analitica ? ' checked' : '') + '> <span><strong>Estadísticas</strong> Cloudflare Web Analytics, sin datos que te identifiquen.</span></label>' +
          '<label><input type="checkbox" id="ck-externo"' + (e.externo ? ' checked' : '') + '> <span><strong>Contenido externo</strong> Prototipos de Figma en las páginas de proyectos.</span></label>' +
        '</div>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="key key-pink" data-c="todo"><kbd>✓</kbd>Aceptar</button>' +
          '<button type="button" class="key" data-c="nada"><kbd>×</kbd>Rechazar</button>' +
          '<button type="button" class="cookie-link" data-c="config">Configurar</button>' +
          '<button type="button" class="key" data-c="guardar" hidden><kbd>⏎</kbd>Guardar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    var opts = banner.querySelector('.cookie-opts');
    banner.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-c]');
      if (!b) return;
      var c = b.getAttribute('data-c');
      if (c === 'todo') { guardar({ analitica: true, externo: true }); cerrarBanner(); }
      if (c === 'nada') { guardar({ analitica: false, externo: false }); cerrarBanner(); }
      if (c === 'config') {
        opts.hidden = false;
        b.hidden = true;
        banner.querySelector('[data-c="guardar"]').hidden = false;
      }
      if (c === 'guardar') {
        guardar({
          analitica: banner.querySelector('#ck-analitica').checked,
          externo: banner.querySelector('#ck-externo').checked
        });
        cerrarBanner();
      }
    });
  }
  function abrirBanner(configurar) {
    if (banner) banner.remove();
    crearBanner();
    if (configurar) banner.querySelector('[data-c="config"]').click();
    var primero = banner.querySelector('button');
    if (primero) primero.focus();
  }
  function cerrarBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  // Enlaces "Configurar cookies" (pie de página y página de cookies)
  document.querySelectorAll('[data-cookies]').forEach(function (el) {
    el.addEventListener('click', function (ev) { ev.preventDefault(); abrirBanner(true); });
  });

  // ── Estado en la página de cookies ──
  function pintaEstado() {
    var estado = document.getElementById('estadoConsentimiento');
    if (!estado) return;
    var e = leer();
    if (!e) { estado.textContent = 'Todavía no has elegido. Verás el aviso de cookies abajo.'; return; }
    estado.textContent = 'Tu elección actual: estadísticas ' + (e.analitica ? 'aceptadas' : 'rechazadas') +
      ', contenido externo ' + (e.externo ? 'aceptado' : 'rechazado') + '.';
  }

  var eleccion = leer();
  if (eleccion) aplicar(eleccion); else crearBanner();
  pintaEstado();
})();
