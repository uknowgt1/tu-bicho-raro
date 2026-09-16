/* ============================================================
   Tu Bicho Raro — motor del sitio
   Sin dependencias externas. Todo funciona en el navegador.
   ============================================================ */
(function () {
  "use strict";

  var D = window.BICHO_DATA;
  if (!D) { return; }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn); } }

  /* ---------------------------------------------------------
     1. Almacenamiento local seguro
     --------------------------------------------------------- */
  var KEY_METRICAS = "bichoRaro.metricas.v1";
  var KEY_COLECCION = "bichoRaro.coleccion.v1";
  var KEY_RECORD = "bichoRaro.recordContrarreloj.v1";
  var KEY_ALIAS = "bichoRaro.alias.v1";

  function leer(clave, porDefecto) {
    try {
      var raw = window.localStorage.getItem(clave);
      if (raw === null || raw === undefined) { return porDefecto; }
      return JSON.parse(raw);
    } catch (e) { return porDefecto; }
  }
  function guardar(clave, valor) {
    try { window.localStorage.setItem(clave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  }
  function borrarDatos() {
    try {
      [KEY_METRICAS, KEY_COLECCION, KEY_RECORD, KEY_ALIAS].forEach(function (k) {
        window.localStorage.removeItem(k);
      });
      return true;
    } catch (e) { return false; }
  }

  function hoyISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + dia;
  }
  function diasDesdeEpoch() {
    var d = new Date();
    var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(utc / 86400000);
  }
  function formatearSegundos(s) {
    if (s < 60) { return (Math.round(s * 10) / 10).toString().replace(".", ",") + " s"; }
    var m = Math.floor(s / 60);
    var r = Math.round(s % 60);
    return m + " min " + r + " s";
  }

  /* ---------------------------------------------------------
     2. Métricas de uso (solo en este dispositivo)
     --------------------------------------------------------- */
  var metricas = leer(KEY_METRICAS, null);
  if (!metricas || typeof metricas !== "object") {
    metricas = {
      version: 1,
      visitas: 0, sesiones: 0, testIniciados: 0, testCompletados: 0,
      compartidos: 0, enlacesAbiertos: 0, contrarrelojPartidas: 0,
      segundosTotales: 0, muestrasTiempo: 0,
      porBicho: {}, dias: {}, log: []
    };
  }
  // Compatibilidad con versiones anteriores del registro
  ["visitas", "sesiones", "testIniciados", "testCompletados", "compartidos",
   "enlacesAbiertos", "contrarrelojPartidas", "segundosTotales", "muestrasTiempo"].forEach(function (k) {
    if (typeof metricas[k] !== "number") { metricas[k] = 0; }
  });
  if (!metricas.porBicho || typeof metricas.porBicho !== "object") { metricas.porBicho = {}; }
  if (!metricas.dias || typeof metricas.dias !== "object") { metricas.dias = {}; }
  if (!Array.isArray(metricas.log)) { metricas.log = []; }

  function persistir() { guardar(KEY_METRICAS, metricas); }
  function anotar(evento, detalle) {
    metricas.log.unshift({ t: Date.now(), e: evento, d: String(detalle || "") });
    if (metricas.log.length > 80) { metricas.log.length = 80; }
  }

  function registrarVisita() {
    metricas.visitas++;
    var hoy = hoyISO();
    metricas.dias[hoy] = (metricas.dias[hoy] || 0) + 1;
    var enSesion = false;
    try { enSesion = window.sessionStorage.getItem("bichoRaro.sesion") === "1"; } catch (e) { enSesion = false; }
    if (!enSesion) {
      metricas.sesiones++;
      try { window.sessionStorage.setItem("bichoRaro.sesion", "1"); } catch (e) { /* sessão anónima */ }
      anotar("Sesión nueva", "Primera visita de esta pestaña");
    }
    anotar("Visita", "Página cargada");
    persistir();
  }

  function rachaActual() {
    var claves = Object.keys(metricas.dias).sort();
    if (!claves.length) { return 0; }
    function aDias(iso) {
      var p = iso.split("-");
      return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000);
    }
    var set = {};
    claves.forEach(function (k) { set[aDias(k)] = true; });
    var hoy = diasDesdeEpoch();
    var inicio = set[hoy] ? hoy : (set[hoy - 1] ? hoy - 1 : null);
    if (inicio === null) { return 0; }
    var n = 0, d = inicio;
    while (set[d]) { n++; d--; }
    return n;
  }

  /* ---------------------------------------------------------
     3. Cifrado ligero del resultado para la URL
     --------------------------------------------------------- */
  function b64url(txt) {
    try {
      return window.btoa(txt).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) { return ""; }
  }
  function de64url(txt) {
    try {
      var b = String(txt).replace(/-/g, "+").replace(/_/g, "/");
      while (b.length % 4) { b += "="; }
      return window.atob(b);
    } catch (e) { return null; }
  }
  function codificarRespuestas(respuestas) {
    return b64url("v1:" + respuestas.join(""));
  }
  function decodificarRespuestas(codigo) {
    var plano = de64url(codigo);
    if (!plano) { return null; }
    var m = /^v1:([0-3]{10})$/.exec(plano);
    if (!m) { return null; }
    return m[1].split("").map(function (c) { return parseInt(c, 10); });
  }
  function limpiarAlias(s) {
    var t = String(s || "")
      .replace(/[<>&"'`\\\/{}[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // Recorte por puntos de código: nunca partir un emoji por la mitad (evita URIError al codificar)
    return Array.from(t).slice(0, 18).join("");
  }
  function urlBase() {
    var u = window.location.href;
    var i = u.indexOf("#"); if (i >= 0) { u = u.slice(0, i); }
    var j = u.indexOf("?"); if (j >= 0) { u = u.slice(0, j); }
    return u;
  }
  function urlResultado(respuestas, alias, esReto) {
    var u = urlBase() + "?r=" + encodeURIComponent(codificarRespuestas(respuestas));
    var a = limpiarAlias(alias);
    if (a) { u += "&n=" + encodeURIComponent(a); }
    if (esReto) { u += "&t=1"; }
    return u + "#/resultado";
  }

  /* ---------------------------------------------------------
     4. Cálculo del bicho
     --------------------------------------------------------- */
  function hashTexto(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function bichoPorId(id) {
    for (var i = 0; i < D.bichos.length; i++) {
      if (D.bichos[i].id === id) { return D.bichos[i]; }
    }
    return D.bichos[0];
  }
  function calcularBicho(respuestas) {
    var puntos = {};
    for (var i = 0; i < respuestas.length; i++) {
      var pregunta = D.preguntas[i];
      if (!pregunta) { continue; }
      var opcion = pregunta.opciones[respuestas[i]];
      if (!opcion) { continue; }
      opcion.ids.forEach(function (id) { puntos[id] = (puntos[id] || 0) + 1; });
    }
    var clave = respuestas.join("");
    var mejor = null, mejorMarca = -1;
    D.bichos.forEach(function (b) {
      var p = puntos[b.id] || 0;
      var desempate = hashTexto(clave + "|" + b.id) % 997;
      var marca = p * 10000 + desempate;
      if (marca > mejorMarca) { mejorMarca = marca; mejor = b; }
    });
    return { bicho: mejor || D.bichos[0], puntos: puntos };
  }
  function bichoDelDia() {
    var idx = diasDesdeEpoch() % D.bichos.length;
    return D.bichos[idx];
  }

  /* ---------------------------------------------------------
     5. Ilustración SVG determinista de cada bicho
     --------------------------------------------------------- */
  function generadorSemilla(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function bichoSVG(bicho, tam) {
    var R = generadorSemilla(hashTexto(bicho.id));
    var size = tam || 120;
    var c = bicho.color;
    var tinta = "#221A14";
    var cx = 60, cy = 64;
    var rx = 36 + Math.round(R() * 5);
    var ry = 34 + Math.round(R() * 6);
    var tipo = Math.floor(R() * 3); // 0 antenas, 1 orejas, 2 cuernos
    var nManchas = Math.floor(R() * 3);
    var partes = [];

    partes.push('<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" role="img" aria-label="Ilustración de ' + bicho.nombre + '">');

    // Adornos de la cabeza
    if (tipo === 0) {
      for (var a = 0; a < 2; a++) {
        var dir = a === 0 ? -1 : 1;
        var bx = cx + dir * 16;
        var by = cy - ry + 6;
        var tx = bx + dir * 14;
        var ty = by - 26;
        partes.push('<path d="M' + bx + ',' + by + ' Q' + (bx + dir * 4) + ',' + (by - 16) + ' ' + tx + ',' + ty + '" fill="none" stroke="' + tinta + '" stroke-width="5" stroke-linecap="round"/>');
        partes.push('<circle cx="' + tx + '" cy="' + ty + '" r="7" fill="' + c + '" stroke="' + tinta + '" stroke-width="4"/>');
      }
    } else if (tipo === 1) {
      [-1, 1].forEach(function (dir) {
        var ex = cx + dir * (rx - 12);
        partes.push('<ellipse cx="' + ex + '" cy="' + (cy - ry + 4) + '" rx="10" ry="16" fill="' + c + '" stroke="' + tinta + '" stroke-width="4" transform="rotate(' + (dir * 22) + ' ' + ex + ' ' + (cy - ry + 4) + ')"/>');
      });
    } else {
      [-1, 1].forEach(function (dir) {
        var hx = cx + dir * 14;
        var hy = cy - ry + 8;
        partes.push('<path d="M' + hx + ',' + hy + ' L' + (hx + dir * 7) + ',' + (hy - 20) + ' L' + (hx + dir * 15) + ',' + hy + ' Z" fill="' + c + '" stroke="' + tinta + '" stroke-width="4" stroke-linejoin="round"/>');
      });
    }

    // Patas
    [-1, 1].forEach(function (dir) {
      partes.push('<ellipse cx="' + (cx + dir * 18) + '" cy="' + (cy + ry - 4) + '" rx="11" ry="8" fill="' + tinta + '"/>');
    });

    // Cuerpo
    partes.push('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + c + '" stroke="' + tinta + '" stroke-width="5"/>');

    // Manchas
    for (var m = 0; m < nManchas; m++) {
      var ang = R() * Math.PI * 2;
      var dist = R() * 0.62;
      partes.push('<circle cx="' + (cx + Math.cos(ang) * rx * dist).toFixed(1) + '" cy="' + (cy + Math.sin(ang) * ry * dist).toFixed(1) + '" r="' + (4 + R() * 4).toFixed(1) + '" fill="rgba(255,255,255,.6)"/>');
    }

    // Mejillas
    [-1, 1].forEach(function (dir) {
      partes.push('<ellipse cx="' + (cx + dir * 20) + '" cy="' + (cy + 8) + '" rx="7" ry="5" fill="rgba(232,72,85,.45)"/>');
    });

    // Ojos
    var sep = 13 + Math.round(R() * 3);
    [-1, 1].forEach(function (dir) {
      var ex = cx + dir * sep;
      var ey = cy - 6;
      partes.push('<circle cx="' + ex + '" cy="' + ey + '" r="9" fill="#fff" stroke="' + tinta + '" stroke-width="4"/>');
      partes.push('<circle cx="' + (ex + dir * 2) + '" cy="' + (ey + 2) + '" r="4" fill="' + tinta + '"/>');
      partes.push('<circle cx="' + (ex + dir * 3.4) + '" cy="' + (ey - 1) + '" r="1.6" fill="#fff"/>');
    });

    // Boca
    var bocaY = cy + 14;
    if (R() > 0.45) {
      partes.push('<path d="M' + (cx - 9) + ',' + bocaY + ' Q' + cx + ',' + (bocaY + 10) + ' ' + (cx + 9) + ',' + bocaY + '" fill="none" stroke="' + tinta + '" stroke-width="4" stroke-linecap="round"/>');
    } else {
      partes.push('<ellipse cx="' + cx + '" cy="' + (bocaY + 3) + '" rx="6" ry="7" fill="' + tinta + '"/>');
    }

    partes.push("</svg>");
    return partes.join("");
  }

  /* ---------------------------------------------------------
     6. Tostadas
     --------------------------------------------------------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) { return; }
    toastEl.textContent = msg;
    toastEl.hidden = false;
    window.requestAnimationFrame(function () { toastEl.classList.add("visible"); });
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("visible");
      window.setTimeout(function () { toastEl.hidden = true; }, 220);
    }, 2600);
  }

  /* ---------------------------------------------------------
     6b. Animaciones (siempre respetando "reducir movimiento")
     --------------------------------------------------------- */
  function prefiereMenosMovimiento() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  /** Lluvia de confeti. El color del bicho va siempre primero en la paleta. */
  function confeti(cantidad, colores) {
    var capa = $("#confeti");
    if (!capa || prefiereMenosMovimiento()) { return; }
    var paleta = colores && colores.length
      ? colores.concat(["#FFC145", "#F15BB5", "#1B9C85", "#7B5EA7"])
      : ["#FF6B35", "#FFC145", "#E84855", "#F15BB5", "#1B9C85", "#7B5EA7"];
    var n = cantidad || 24;
    for (var i = 0; i < n; i++) {
      var pieza = document.createElement("span");
      pieza.className = "confeti-pieza";
      pieza.style.left = (Math.random() * 98).toFixed(2) + "%";
      pieza.style.background = paleta[i % paleta.length];
      pieza.style.width = (8 + Math.random() * 8).toFixed(0) + "px";
      pieza.style.height = (10 + Math.random() * 10).toFixed(0) + "px";
      pieza.style.setProperty("--dx", (Math.random() * 170 - 85).toFixed(0) + "px");
      pieza.style.setProperty("--rot", (Math.random() * 900 - 450).toFixed(0) + "deg");
      pieza.style.setProperty("--dur", (2.2 + Math.random() * 1.8).toFixed(2) + "s");
      pieza.style.setProperty("--ret", (Math.random() * 0.5).toFixed(2) + "s");
      capa.appendChild(pieza);
      limpiarDespues(pieza, 5200);
    }
  }

  function limpiarDespues(el, ms) {
    window.setTimeout(function () { if (el && el.parentNode) { el.parentNode.removeChild(el); } }, ms);
  }

  /** Aviso flotante de logro (se anuncia a lectores de pantalla con role=status). */
  function avisarLogro(texto) {
    if (!texto) { return; }
    var el = document.createElement("div");
    el.className = "aviso-logro";
    el.setAttribute("role", "status");
    el.textContent = texto;
    document.body.appendChild(el);
    if (!prefiereMenosMovimiento()) {
      window.requestAnimationFrame(function () { el.classList.add("visible"); });
    } else {
      el.classList.add("visible");
    }
    window.setTimeout(function () {
      el.classList.remove("visible");
      limpiarDespues(el, 450);
    }, 3800);
  }

  /** Cuenta de 0 al valor final. Con movimiento reducido, escribe el valor directo. */
  function contarHasta(el, destino, duracion) {
    if (!el) { return; }
    if (prefiereMenosMovimiento()) { el.textContent = String(destino); return; }
    var inicio = null;
    var d = duracion || 700;
    function paso(ts) {
      if (inicio === null) { inicio = ts; }
      var t = Math.min(1, (ts - inicio) / d);
      var suave = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(destino * suave));
      if (t < 1) { window.requestAnimationFrame(paso); }
    }
    window.requestAnimationFrame(paso);
  }

  /** Entrada escalonada de los bloques del resultado. */
  function animarBloques(contenedor) {
    if (!contenedor || prefiereMenosMovimiento()) { return; }
    var hijos = Array.prototype.slice.call(contenedor.children);
    hijos.forEach(function (hijo, i) {
      hijo.classList.remove("reveal");
      hijo.style.setProperty("--d", (60 + i * 70) + "ms");
      void hijo.offsetWidth; // fuerza reinicio de la animación
      hijo.classList.add("reveal");
    });
  }

  /** Vuelve a lanzar una animación por clase. */
  function reanimar(el, clase) {
    if (!el || prefiereMenosMovimiento()) { return; }
    el.classList.remove(clase);
    void el.offsetWidth;
    el.classList.add(clase);
  }

  /* ---------------------------------------------------------
     7. Rutas
     --------------------------------------------------------- */
  var RUTAS = ["inicio", "test", "resultado", "contrarreloj", "coleccion", "laboratorio", "acerca"];
  var rutaActual = "inicio";

  function ir(ruta, sinHash) {
    if (RUTAS.indexOf(ruta) === -1) { ruta = "inicio"; }
    rutaActual = ruta;
    RUTAS.forEach(function (r) {
      var v = $("#view-" + r);
      if (v) { v.hidden = (r !== ruta); }
    });
    $$(".nav-link").forEach(function (b) {
      if (b.getAttribute("data-route") === ruta) { b.setAttribute("aria-current", "page"); }
      else { b.removeAttribute("aria-current"); }
    });
    // Si se abandona el contrarreloj a media partida, el cronómetro se detiene.
    if (ruta !== "contrarreloj" && cr.activo) { abortarContrarreloj(); }
    if (!sinHash) {
      var destino = "#/" + ruta;
      if (window.location.hash !== destino) {
        try { window.history.replaceState(null, "", destino); }
        catch (e) { window.location.hash = destino; }
      }
    }
    if (ruta === "coleccion") { renderColeccion(); }
    if (ruta === "laboratorio") { renderLaboratorio(); }
    if (ruta === "inicio") { renderBichoDelDia(); }
    try { window.scrollTo({ top: 0, behavior: "auto" }); } catch (e) { window.scrollTo(0, 0); }
    var main = $("#main");
    if (main && document.activeElement && document.activeElement !== document.body) {
      // Solo movemos el foco cuando la navegación la pidió el usuario
      if (ultimaAccionFueNavegacion) { main.focus({ preventScroll: true }); }
    }
    ultimaAccionFueNavegacion = false;
  }
  var ultimaAccionFueNavegacion = false;

  function rutaDesdeHash() {
    var h = window.location.hash || "";
    var m = /^#\/([a-z]+)/.exec(h);
    if (m && RUTAS.indexOf(m[1]) !== -1) { return m[1]; }
    return "inicio";
  }

  /* ---------------------------------------------------------
     8. Test principal
     --------------------------------------------------------- */
  var estado = {
    respuestas: [],
    indice: 0,
    marcaInicio: 0,
    bicho: null,
    compartido: false,
    aliasCompartido: "",
    respuestasCompartidas: null
  };

  var testIntro = $("#testIntro");
  var quizBox = $("#quizBox");

  function iniciarTest() {
    estado.respuestas = [];
    estado.indice = 0;
    estado.bicho = null;
    estado.compartido = false;
    estado.respuestasCompartidas = null;
    estado.marcaInicio = Date.now();
    metricas.testIniciados++;
    anotar("Test iniciado", "Pregunta 1 de " + D.totalPreguntas);
    persistir();
    if (testIntro) { testIntro.hidden = true; }
    if (quizBox) { quizBox.hidden = false; }
    ir("test");
    pintarPregunta();
  }

  function pintarPregunta() {
    var p = D.preguntas[estado.indice];
    if (!p) { return; }
    var total = D.preguntas.length;
    var n = estado.indice + 1;

    var cEl = $("#quizCount"); if (cEl) { cEl.textContent = String(n); }
    var tEl = $("#quizTotal"); if (tEl) { tEl.textContent = String(total); }
    var qEl = $("#quizQuestion");
    if (qEl) { qEl.textContent = p.texto; }

    var pct = Math.round(((estado.indice + 1) / total) * 100);
    var barra = $("#quizProgress");
    var relleno = $("#quizProgressFill");
    if (barra) {
      barra.setAttribute("aria-valuenow", String(pct));
      barra.setAttribute("aria-valuetext", "Pregunta " + n + " de " + total);
    }
    if (relleno) { relleno.style.width = pct + "%"; }

    var cont = $("#quizOptions");
    if (!cont) { return; }
    cont.innerHTML = "";
    var letras = ["A", "B", "C", "D"];
    p.opciones.forEach(function (op, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opcion";
      b.setAttribute("data-idx", String(idx));
      var span = document.createElement("span");
      span.className = "letra";
      span.textContent = letras[idx] || String(idx + 1);
      var txt = document.createElement("span");
      txt.textContent = op.texto;
      b.appendChild(span);
      b.appendChild(txt);
      if (estado.respuestas[estado.indice] === idx) { b.classList.add("elegida"); }
      on(b, "click", function () {
        // Blindaje contra doble pulsación: un botón ya usado no vuelve a contar
        if (b.getAttribute("data-usado") === "1") { return; }
        b.setAttribute("data-usado", "1");
        if (!prefiereMenosMovimiento()) { b.classList.add("pulsada"); }
        responder(idx);
      });
      cont.appendChild(b);
    });

    var atras = $("#btnAtrasPregunta");
    if (atras) { atras.disabled = estado.indice === 0; }
    var hint = $("#quizHint");
    if (hint) { hint.textContent = "Pregunta " + n + " de " + total + " · elige la opción que más se parezca a ti."; }
    reanimar(qEl, "pregunta-entra");
    reanimar(cont, "pregunta-entra");
    if (qEl) { try { qEl.focus({ preventScroll: true }); } catch (e) { /* sin foco programático */ } }
  }

  function responder(idx) {
    estado.respuestas[estado.indice] = idx;
    var cont = $("#quizOptions");
    if (cont) {
      $$(".opcion", cont).forEach(function (b) {
        b.classList.toggle("elegida", b.getAttribute("data-idx") === String(idx));
      });
    }
    if (estado.indice < D.preguntas.length - 1) {
      estado.indice++;
      pintarPregunta();
    } else {
      terminarTest();
    }
  }

  function terminarTest() {
    var segundos = (Date.now() - estado.marcaInicio) / 1000;
    var r = calcularBicho(estado.respuestas);
    estado.bicho = r.bicho;
    estado.compartido = false;
    estado.aliasCompartido = "";
    if (segundos > 0.6 && segundos < 3600) {
      metricas.segundosTotales += segundos;
      metricas.muestrasTiempo++;
    }
    metricas.testCompletados++;
    metricas.porBicho[r.bicho.id] = (metricas.porBicho[r.bicho.id] || 0) + 1;
    anotar("Test completado", r.bicho.nombre + " en " + formatearSegundos(segundos));
    persistir();
    desbloquear(r.bicho.id);
    if (quizBox) { quizBox.hidden = true; }
    if (testIntro) { testIntro.hidden = false; }
    pintarResultado(r.bicho, false, "");
    ir("resultado");
  }

  $("#btnComenzarTest") && on($("#btnComenzarTest"), "click", iniciarTest);
  $("#btnComenzarCR") && on($("#btnComenzarCR"), "click", iniciarContrarreloj);
  $("#btnSalirTest") && on($("#btnSalirTest"), "click", function () {
    if (quizBox) { quizBox.hidden = true; }
    if (testIntro) { testIntro.hidden = false; }
    ir("inicio");
  });
  $("#btnAtrasPregunta") && on($("#btnAtrasPregunta"), "click", function () {
    if (estado.indice > 0) { estado.indice--; pintarPregunta(); }
  });
  $("#btnRepetir") && on($("#btnRepetir"), "click", iniciarTest);

  /* ---------------------------------------------------------
     9. Resultado
     --------------------------------------------------------- */
  // Colores de las barras de estadística: elegidos para cumplir contraste >= 3:1 sobre el fondo crema-2
  var COLORES_STAT = { "Caos": "#E84855", "Encanto": "#D651A1", "Energía": "#A67D2D" };

  function pintarResultado(bicho, esCompartido, alias) {
    estado.bicho = bicho;
    var kicker = $("#resKicker");
    if (kicker) {
      if (esCompartido) {
        kicker.textContent = alias ? (alias + " obtuvo") : "Este bicho le tocó a alguien más:";
      } else {
        kicker.textContent = "Tu bicho es";
      }
    }
    var n = $("#resNombre"); if (n) { n.textContent = bicho.emoji + " " + bicho.nombre; }
    var g = $("#resGancho"); if (g) { g.textContent = bicho.gancho; }
    var d = $("#resDesc"); if (d) { d.textContent = bicho.desc; }
    var s = $("#resSuper"); if (s) { s.textContent = bicho.superpoder; }
    var k = $("#resKripto"); if (k) { k.textContent = bicho.kriptonita; }

    var cont = $("#resStats");
    if (cont) {
      cont.innerHTML = "";
      D.stats.forEach(function (nombre) {
        var val = bicho.stats[nombre] || 0;
        var fila = document.createElement("div");
        fila.className = "stat";
        var et = document.createElement("span");
        et.textContent = nombre;
        var barra = document.createElement("span");
        barra.className = "stat-bar";
        var relleno = document.createElement("span");
        relleno.style.background = COLORES_STAT[nombre] || "#FF6B35";
        barra.appendChild(relleno);
        var num = document.createElement("span");
        num.className = "stat-val";
        contarHasta(num, val, 780);
        fila.appendChild(et); fila.appendChild(barra); fila.appendChild(num);
        cont.appendChild(fila);
        window.setTimeout(function () { relleno.style.width = val + "%"; }, 60);
      });
    }

    dibujarTarjeta(bicho);
    actualizarEnlacesCompartir(bicho, esCompartido);
    actualizarTitulo(bicho);
    var st = $("#shareStatus");
    if (st) { st.textContent = ""; }
    var btnRepetir = $("#btnRepetir");
    if (btnRepetir) { btnRepetir.textContent = esCompartido ? "Hacer mi test ahora" : "Repetir el test"; }
    var btnRetar = $("#btnRetar");
    if (btnRetar) { btnRetar.textContent = "Retar a un amigo"; }
    var input = $("#aliasInput");
    if (input) {
      var guardado = leer(KEY_ALIAS, "");
      input.value = typeof guardado === "string" ? guardado : "";
      input.disabled = false;
    }

    // Celebración y entrada animada del resultado
    var info = $(".resultado-info");
    if (info) {
      try { info.style.setProperty("--acento", bicho.color); } catch (e) { /* sin acento */ }
      animarBloques(info);
    }
    reanimar($("#tarjetaMarco"), "entra");
    confeti(esCompartido ? 16 : 28, [bicho.color, "#FFC145", "#FF6B35", "#F15BB5", "#1B9C85"]);
  }

  function actualizarTitulo(bicho) {
    try {
      document.title = "Soy " + bicho.nombre + " " + bicho.emoji + " — Tu Bicho Raro";
    } catch (e) { /* título por defecto */ }
  }

  function datosCompartir(bicho, alias, esReto) {
    // Viendo un resultado ajeno solo se propaga un reto, nunca una afirmación propia.
    var comoReto = esReto || estado.compartido;
    var url = urlResultado(estado.respuestasCompartidas || estado.respuestas, alias, comoReto);
    var texto;
    if (esReto) {
      texto = (alias ? alias + " te reta" : "Te reto") + ": ¿crees que tu bicho le gana a " +
        bicho.nombre + "? Descúbrelo aquí 👇";
    } else if (estado.compartido) {
      // Estamos viendo el resultado de otra persona: invitamos a hacer el propio.
      texto = (alias ? alias + " sacó " : "Vi un resultado de ") + bicho.nombre + " " + bicho.emoji +
        " — ¿cuál es el tuyo? Descúbrelo aquí 👇";
    } else {
      texto = bicho.compartir;
    }
    return { url: url, texto: texto };
  }

  function actualizarEnlacesCompartir(bicho, esCompartido) {
    var alias = "";
    var input = $("#aliasInput");
    if (input) { alias = limpiarAlias(input.value); }
    var d = datosCompartir(bicho, alias, false);
    var dReto = datosCompartir(bicho, alias, true);
    var texto = d.texto + " " + d.url;
    var wa = $("#linkWhatsapp");
    if (wa) { wa.href = "https://wa.me/?text=" + encodeURIComponent(texto); }
    var tg = $("#linkTelegram");
    if (tg) { tg.href = "https://t.me/share/url?url=" + encodeURIComponent(d.url) + "&text=" + encodeURIComponent(d.texto); }
    var tw = $("#linkX");
    if (tw) { tw.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(dReto.texto) + "&url=" + encodeURIComponent(d.url); }
  }

  function marcarCompartido(origen) {
    metricas.compartidos++;
    anotar("Compartido", origen + (estado.bicho ? " · " + estado.bicho.nombre : ""));
    persistir();
  }

  function copiarTexto(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = texto;
        ta.setAttribute("readonly", "readonly");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy"));
      } catch (e) { reject(e); }
    });
  }

  $("#btnCopiarEnlace") && on($("#btnCopiarEnlace"), "click", function () {
    if (!estado.bicho) { return; }
    var alias = "";
    var input = $("#aliasInput");
    if (input) { alias = limpiarAlias(input.value); }
    var d = datosCompartir(estado.bicho, alias, false);
    var status = $("#shareStatus");
    copiarTexto(d.texto + "\n" + d.url).then(function () {
      marcarCompartido("Enlace copiado");
      if (status) { status.textContent = "✅ Enlace copiado. Pégalo donde quieras."; }
      toast("Enlace copiado al portapapeles");
    }).catch(function () {
      if (status) { status.textContent = "No pudimos copiar automáticamente. Copia el enlace de la barra del navegador."; }
    });
  });

  $("#btnCompartir") && on($("#btnCompartir"), "click", function () {
    if (!estado.bicho) { return; }
    var alias = "";
    var input = $("#aliasInput");
    if (input) { alias = limpiarAlias(input.value); }
    if (alias) { guardar(KEY_ALIAS, alias); }
    var d = datosCompartir(estado.bicho, alias, false);
    var status = $("#shareStatus");
    var payload = {
      title: "Tu Bicho Raro",
      text: d.texto,
      url: d.url
    };
    if (navigator.share && navigator.canShare && typeof File === "function") {
      try {
        var archivo = tarjetaArchivo();
        if (archivo && navigator.canShare({ files: [archivo] })) { payload.files = [archivo]; }
      } catch (e) { /* continuamos sin imagen */ }
    }
    if (navigator.share) {
      navigator.share(payload).then(function () {
        marcarCompartido("Web Share");
        if (status) { status.textContent = "¡Compartido! Gracias por la difusión 🙌"; }
      }).catch(function (err) {
        if (err && err.name === "AbortError") { return; }
        copiarTexto(d.texto + "\n" + d.url).then(function () {
          marcarCompartido("Enlace copiado (respaldo)");
          if (status) { status.textContent = "Tu navegador no abrió el menú de compartir, así que copiamos el enlace. Pégalo donde quieras."; }
        }).catch(function () {
          if (status) { status.textContent = "Copia el enlace desde la barra del navegador y compártelo."; }
        });
      });
    } else {
      copiarTexto(d.texto + "\n" + d.url).then(function () {
        marcarCompartido("Enlace copiado");
        if (status) { status.textContent = "Enlace copiado: pégalo en tu red favorita."; }
      }).catch(function () {
        if (status) { status.textContent = "Copia el enlace desde la barra del navegador y compártelo."; }
      });
    }
  });

  $("#btnRetar") && on($("#btnRetar"), "click", function () {
    if (!estado.bicho) { return; }
    var alias = "";
    var input = $("#aliasInput");
    if (input) { alias = limpiarAlias(input.value); }
    if (alias) { guardar(KEY_ALIAS, alias); }
    var d = datosCompartir(estado.bicho, alias, true);
    var status = $("#shareStatus");
    if (navigator.share) {
      navigator.share({ title: "Te reto — Tu Bicho Raro", text: d.texto, url: d.url }).then(function () {
        marcarCompartido("Reto enviado");
        if (status) { status.textContent = "Reto enviado ⚔️"; }
      }).catch(function (err) {
        if (err && err.name === "AbortError") { return; }
        copiarTexto(d.texto + "\n" + d.url).then(function () {
          marcarCompartido("Reto copiado");
          if (status) { status.textContent = "Enlace de reto copiado: mándalo y que se atrevan."; }
        }).catch(function () {
          if (status) { status.textContent = "Copia el enlace del reto desde la barra del navegador."; }
        });
      });
    } else {
      copiarTexto(d.texto + "\n" + d.url).then(function () {
        marcarCompartido("Reto copiado");
        if (status) { status.textContent = "Enlace de reto copiado: mándalo y que se atrevan."; }
      }).catch(function () {
        if (status) { status.textContent = "Copia el enlace del reto desde la barra del navegador."; }
      });
    }
  });

  ["linkWhatsapp", "linkTelegram", "linkX"].forEach(function (id) {
    var el = document.getElementById(id);
    on(el, "click", function () { marcarCompartido("Red social " + id.replace("link", "")); });
  });

  var aliasInput = $("#aliasInput");
  on(aliasInput, "change", function () {
    var v = limpiarAlias(aliasInput.value);
    aliasInput.value = v;
    guardar(KEY_ALIAS, v);
    if (estado.bicho) { actualizarEnlacesCompartir(estado.bicho, false); }
  });

  /* ---------------------------------------------------------
     10. Tarjeta compartible (canvas)
     --------------------------------------------------------- */
  var canvas = $("#cardCanvas");
  var ultimoBlob = null;

  function redondearRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Reduce el tamaño de fuente hasta que el texto quepa. Evita desbordes en nombres largos. */
  function ajustarFuente(ctx, texto, maxAncho, tamMax, tamMin, plantilla) {
    var tam = tamMax;
    while (tam > tamMin) {
      ctx.font = plantilla.replace("%S", String(tam));
      if (ctx.measureText(texto).width <= maxAncho) { break; }
      tam -= 2;
    }
    ctx.font = plantilla.replace("%S", String(tam));
    return tam;
  }

  /** Destellos decorativos: dan vida a la tarjeta sin añadir texto (nada que se solape). */
  function dibujarDestellos(ctx, color) {
    var tinta = "#221A14";
    ctx.save();
    var posiciones = [[140, 250, 16], [945, 212, 12], [122, 1150, 13], [965, 1100, 15]];
    posiciones.forEach(function (e) {
      var x = e[0], y = e[1], r = e[2];
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
      ctx.quadraticCurveTo(x, y, x - r, y);
      ctx.quadraticCurveTo(x, y, x, y - r);
      ctx.closePath();
      ctx.fillStyle = "#FFC145";
      ctx.fill();
      ctx.strokeStyle = tinta;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = color;
    [[196, 300, 7], [872, 318, 9], [176, 1032, 8], [898, 962, 6]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], p[2], 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function ajustarTexto(ctx, texto, maxAncho) {
    var palabras = String(texto).split(" ");
    var lineas = [], actual = "";
    for (var i = 0; i < palabras.length; i++) {
      var prueba = actual ? actual + " " + palabras[i] : palabras[i];
      if (ctx.measureText(prueba).width > maxAncho && actual) {
        lineas.push(actual);
        actual = palabras[i];
      } else { actual = prueba; }
    }
    if (actual) { lineas.push(actual); }
    return lineas;
  }

  function dibujarBichoCanvas(ctx, bicho, cx, cy, escala) {
    var R = generadorSemilla(hashTexto(bicho.id));
    var tinta = "#221A14";
    var rx = (36 + Math.round(R() * 5)) * escala;
    var ry = (34 + Math.round(R() * 6)) * escala;
    var tipo = Math.floor(R() * 3);
    var nManchas = Math.floor(R() * 3);

    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.lineWidth = 5 * escala;

    if (tipo === 0) {
      [-1, 1].forEach(function (dir) {
        var bx = cx + dir * 16 * escala, by = cy - ry + 6 * escala;
        var tx = bx + dir * 14 * escala, ty = by - 26 * escala;
        ctx.strokeStyle = tinta;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + dir * 4 * escala, by - 16 * escala, tx, ty);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(tx, ty, 7 * escala, 0, Math.PI * 2);
        ctx.fillStyle = bicho.color; ctx.fill(); ctx.strokeStyle = tinta; ctx.stroke();
      });
    } else if (tipo === 1) {
      [-1, 1].forEach(function (dir) {
        var ex = cx + dir * (rx - 12 * escala), ey = cy - ry + 4 * escala;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate((dir * 22) * Math.PI / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, 10 * escala, 16 * escala, 0, 0, Math.PI * 2);
        ctx.fillStyle = bicho.color; ctx.fill(); ctx.strokeStyle = tinta; ctx.stroke();
        ctx.restore();
      });
    } else {
      [-1, 1].forEach(function (dir) {
        var hx = cx + dir * 14 * escala, hy = cy - ry + 8 * escala;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + dir * 7 * escala, hy - 20 * escala);
        ctx.lineTo(hx + dir * 15 * escala, hy);
        ctx.closePath();
        ctx.fillStyle = bicho.color; ctx.fill(); ctx.strokeStyle = tinta; ctx.stroke();
      });
    }

    [-1, 1].forEach(function (dir) {
      ctx.beginPath();
      ctx.ellipse(cx + dir * 18 * escala, cy + ry - 4 * escala, 11 * escala, 8 * escala, 0, 0, Math.PI * 2);
      ctx.fillStyle = tinta; ctx.fill();
    });

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = bicho.color; ctx.fill();
    ctx.strokeStyle = tinta; ctx.lineWidth = 5 * escala; ctx.stroke();

    for (var m = 0; m < nManchas; m++) {
      var ang = R() * Math.PI * 2, dist = R() * 0.62;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * rx * dist, cy + Math.sin(ang) * ry * dist, (4 + R() * 4) * escala, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fill();
    }

    [-1, 1].forEach(function (dir) {
      ctx.beginPath();
      ctx.ellipse(cx + dir * 20 * escala, cy + 8 * escala, 7 * escala, 5 * escala, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232,72,85,.45)"; ctx.fill();
    });

    var sep = 13 + Math.round(R() * 3);
    [-1, 1].forEach(function (dir) {
      var ex = cx + dir * sep * escala, ey = cy - 6 * escala;
      ctx.beginPath(); ctx.arc(ex, ey, 9 * escala, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = tinta; ctx.stroke();
      ctx.beginPath(); ctx.arc(ex + dir * 2 * escala, ey + 2 * escala, 4 * escala, 0, Math.PI * 2);
      ctx.fillStyle = tinta; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + dir * 3.4 * escala, ey - 1 * escala, 1.6 * escala, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
    });

    var bocaY = cy + 14 * escala;
    if (R() > 0.45) {
      ctx.beginPath();
      ctx.moveTo(cx - 9 * escala, bocaY);
      ctx.quadraticCurveTo(cx, bocaY + 10 * escala, cx + 9 * escala, bocaY);
      ctx.strokeStyle = tinta; ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, bocaY + 3 * escala, 6 * escala, 7 * escala, 0, 0, Math.PI * 2);
      ctx.fillStyle = tinta; ctx.fill();
    }
  }

  function dibujarTarjeta(bicho) {
    if (!canvas || !canvas.getContext) {
      var fb = $("#canvasFallback");
      if (fb) { fb.hidden = false; fb.textContent = "Tu navegador no permite generar la tarjeta como imagen, pero puedes compartir el enlace de tu resultado."; }
      return;
    }
    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }
    var W = canvas.width, H = canvas.height;

    // Fondo
    ctx.fillStyle = "#FFF6E9";
    ctx.fillRect(0, 0, W, H);

    // Manchas decorativas del color del bicho
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = bicho.color;
    [[120, 130, 180], [980, 260, 130], [90, 1220, 120], [1000, 1180, 200]].forEach(function (c) {
      ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();

    // Tarjeta
    ctx.save();
    ctx.shadowColor = "rgba(34,26,20,.28)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 18;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = "#FFFDF8";
    redondearRect(ctx, 70, 70, W - 140, H - 140, 48);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "#221A14";
    ctx.lineWidth = 8;
    redondearRect(ctx, 70, 70, W - 140, H - 140, 48);
    ctx.stroke();

    var fuente = '"Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif';

    // Encabezado
    ctx.fillStyle = "#221A14";
    ctx.textAlign = "center";
    ctx.font = "800 34px " + fuente;
    ctx.fillText("T U   B I C H O   R A R O", W / 2, 168);

    // Destellos decorativos
    dibujarDestellos(ctx, bicho.color);

    // Criatura
    dibujarBichoCanvas(ctx, bicho, W / 2, 392, 2.25);

    // Emoji y nombre (el nombre se encoge si hace falta: nunca desborda)
    ctx.font = "700 64px " + fuente;
    ctx.fillText(bicho.emoji, W / 2, 668);
    ajustarFuente(ctx, bicho.nombre, W - 220, 78, 44, "900 %Spx " + fuente);
    ctx.fillText(bicho.nombre, W / 2, 752);

    // Gancho
    ctx.font = "700 32px " + fuente;
    ctx.fillStyle = "#BA4E27";
    var lineasGancho = ajustarTexto(ctx, bicho.gancho, W - 300);
    lineasGancho.slice(0, 2).forEach(function (l, i) {
      ctx.fillText(l, W / 2, 806 + i * 42);
    });

    // Estadísticas (presupuesto vertical medido: 900 -> 1074)
    var y = 900;
    ctx.textAlign = "left";
    D.stats.forEach(function (nombre) {
      var val = bicho.stats[nombre] || 0;
      ctx.fillStyle = "#221A14";
      ctx.font = "800 30px " + fuente;
      ctx.fillText(nombre, 150, y + 22);
      var bx = 330, bw = W - 330 - 150, bh = 26;
      ctx.strokeStyle = "#221A14";
      ctx.lineWidth = 5;
      redondearRect(ctx, bx, y, bw, bh, 13);
      ctx.stroke();
      ctx.fillStyle = COLORES_STAT[nombre] || "#FF6B35";
      if (val > 0) {
        redondearRect(ctx, bx + 3, y + 3, Math.max(14, (bw - 6) * val / 100), bh - 6, 10);
        ctx.fill();
      }
      ctx.fillStyle = "#221A14";
      ctx.font = "800 28px " + fuente;
      ctx.textAlign = "right";
      ctx.fillText(String(val), W - 150, y + 24);
      ctx.textAlign = "left";
      y += 58;
    });

    // Superpoder / Kriptonita (1090 -> 1210)
    var boxY = y + 16;
    [["Superpoder", bicho.superpoder], ["Kriptonita", bicho.kriptonita]].forEach(function (par, i) {
      var bx = i === 0 ? 130 : W / 2 + 20;
      var bw2 = W / 2 - 150;
      ctx.fillStyle = "#FFEBD2";
      redondearRect(ctx, bx, boxY, bw2, 120, 22);
      ctx.fill();
      ctx.strokeStyle = "#221A14";
      ctx.lineWidth = 5;
      redondearRect(ctx, bx, boxY, bw2, 120, 22);
      ctx.stroke();
      ctx.fillStyle = "#5C4B3D";
      ctx.font = "800 22px " + fuente;
      ctx.fillText(par[0].toUpperCase(), bx + 22, boxY + 40);
      ctx.fillStyle = "#221A14";
      ctx.font = "800 28px " + fuente;
      var ls = ajustarTexto(ctx, par[1], bw2 - 44);
      ls.slice(0, 2).forEach(function (l, j) { ctx.fillText(l, bx + 22, boxY + 78 + j * 32); });
    });

    // Pie (una sola línea, con margen holgado hasta el borde de la tarjeta)
    ctx.textAlign = "center";
    ctx.fillStyle = "#5C4B3D";
    ctx.font = "700 25px " + fuente;
    var url = urlBase().replace(/^https?:\/\//, "");
    ctx.fillText("Descubre el tuyo en " + url, W / 2, 1244);

    ultimoBlob = null;
  }

  function datosBlobTarjeta() {
    if (ultimoBlob) { return ultimoBlob; }
    try { ultimoBlob = canvas.toDataURL("image/png"); } catch (e) { ultimoBlob = null; }
    return ultimoBlob;
  }

  /** Convierte el dataURL de la tarjeta en un Blob real (un string no sirve como archivo). */
  function tarjetaBlob() {
    var dataUrl = datosBlobTarjeta();
    if (!dataUrl || dataUrl.indexOf("data:image/png;base64,") !== 0) { return null; }
    try {
      var b64 = dataUrl.slice("data:image/png;base64,".length);
      var bin = window.atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); }
      return new Blob([bytes], { type: "image/png" });
    } catch (e) { return null; }
  }

  function tarjetaArchivo() {
    var blob = tarjetaBlob();
    if (!blob) { return null; }
    return new File([blob], "mi-bicho-raro.png", { type: "image/png" });
  }

  $("#btnDescargarPng") && on($("#btnDescargarPng"), "click", function () {
    if (!estado.bicho || !canvas) { return; }
    var status = $("#shareStatus");
    try { ultimoBlob = canvas.toDataURL("image/png"); } catch (e) { ultimoBlob = null; }
    if (!ultimoBlob) {
      if (status) { status.textContent = "Tu navegador no permitió exportar la imagen; puedes compartir el enlace."; }
      return;
    }
    var a = document.createElement("a");
    a.href = ultimoBlob;
    a.download = "mi-bicho-raro-" + estado.bicho.id + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    marcarCompartido("Tarjeta descargada");
    if (status) { status.textContent = "Tarjeta descargada 📥"; }
    toast("Tarjeta descargada");
  });

  /* ---------------------------------------------------------
     11. Contrarreloj
     --------------------------------------------------------- */
  var cr = {
    activo: false,
    pausado: false,
    indice: 0,
    respuestas: [],
    restante: 0,
    t0: 0,
    timer: null,
    puntaje: 0
  };
  var crIntro = $("#crIntro");
  var crBox = $("#crBox");
  var crResult = $("#crResult");

  function iniciarContrarreloj() {
    cr.activo = true;
    cr.pausado = false;
    cr.indice = 0;
    cr.respuestas = [];
    cr.puntaje = 0;
    cr.restante = D.segundosContrarreloj;
    cr.t0 = Date.now();
    metricas.contrarrelojPartidas++;
    anotar("Contrarreloj iniciado", D.segundosContrarreloj + " segundos");
    persistir();
    if (crIntro) { crIntro.hidden = true; }
    if (crResult) { crResult.hidden = true; }
    if (crBox) { crBox.hidden = false; }
    ir("contrarreloj");
    pintarPreguntaCR();
    arrancarReloj();
    actualizarReloj();
  }

  // El cronómetro se pausa si el usuario cambia de pestaña o lo interrumpen.
  function arrancarReloj() {
    if (cr.timer) { window.clearInterval(cr.timer); }
    cr.t0 = Date.now() - (D.segundosContrarreloj - cr.restante) * 1000;
    cr.timer = window.setInterval(function () {
      if (document.hidden || cr.pausado) { return; }
      cr.restante = Math.max(0, D.segundosContrarreloj - (Date.now() - cr.t0) / 1000);
      actualizarReloj();
      if (cr.restante <= 0) { terminarContrarreloj(false); }
    }, 100);
  }

  document.addEventListener("visibilitychange", function () {
    if (!cr.activo) { return; }
    if (document.hidden) {
      cr.restante = Math.max(0, D.segundosContrarreloj - (Date.now() - cr.t0) / 1000);
      cr.pausado = true;
      if (cr.timer) { window.clearInterval(cr.timer); cr.timer = null; }
      var t = $("#crTimer");
      if (t) { t.textContent = "Pausa"; }
    } else {
      cr.pausado = false;
      arrancarReloj();
      actualizarReloj();
    }
  });

  function actualizarReloj() {
    var t = $("#crTimer");
    if (t) { t.textContent = cr.restante.toFixed(1).replace(".", ",") + " s"; }
    var barra = $("#crProgress");
    var relleno = $("#crProgressFill");
    var pct = Math.max(0, Math.min(100, (cr.restante / D.segundosContrarreloj) * 100));
    if (barra) {
      barra.setAttribute("aria-valuenow", String(Math.round(cr.restante)));
      barra.setAttribute("aria-valuetext", Math.round(cr.restante) + " segundos restantes");
    }
    if (relleno) { relleno.style.width = pct + "%"; }
    var s = $("#crScore");
    if (s) { s.textContent = String(cr.puntaje); }
  }

  function pintarPreguntaCR() {
    var p = D.preguntas[cr.indice];
    if (!p) { terminarContrarreloj(true); return; }
    var c = $("#crCount"); if (c) { c.textContent = String(cr.indice + 1); }
    var tot = $("#crTotal"); if (tot) { tot.textContent = String(D.preguntas.length); }
    var q = $("#crQuestion"); if (q) { q.textContent = p.texto; }
    var cont = $("#crOptions");
    if (!cont) { return; }
    cont.innerHTML = "";
    var letras = ["A", "B", "C", "D"];
    p.opciones.forEach(function (op, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opcion";
      var span = document.createElement("span");
      span.className = "letra";
      span.textContent = letras[idx] || String(idx + 1);
      var txt = document.createElement("span");
      txt.textContent = op.texto;
      b.appendChild(span); b.appendChild(txt);
      on(b, "click", function () {
        if (b.getAttribute("data-usado") === "1") { return; }
        b.setAttribute("data-usado", "1");
        if (!prefiereMenosMovimiento()) { b.classList.add("pulsada"); }
        responderCR(idx);
      });
      cont.appendChild(b);
    });
    reanimar(q, "pregunta-entra");
    reanimar(cont, "pregunta-entra");
  }

  function responderCR(idx) {
    if (!cr.activo) { return; }
    cr.respuestas.push(idx);
    cr.puntaje += D.puntosPorRespuesta;
    cr.indice++;
    actualizarReloj();
    if (cr.indice >= D.preguntas.length) { terminarContrarreloj(true); return; }
    pintarPreguntaCR();
  }

  function terminarContrarreloj(completado) {
    if (!cr.activo) { return; }
    cr.activo = false;
    cr.pausado = false;
    if (cr.timer) { window.clearInterval(cr.timer); cr.timer = null; }
    var sobrante = Math.max(0, cr.restante);
    if (completado) { cr.puntaje += Math.round(sobrante) * D.puntosPorSegundoSobrante; }
    var record = leer(KEY_RECORD, 0);
    if (typeof record !== "number") { record = 0; }
    var nuevoRecord = cr.puntaje > record;
    if (nuevoRecord) { guardar(KEY_RECORD, cr.puntaje); }

    anotar("Contrarreloj terminado", cr.puntaje + " puntos · " + cr.respuestas.length + " respuestas");
    persistir();

    if (crBox) { crBox.hidden = true; }
    if (crResult) { crResult.hidden = false; }
    var t = $("#crFinalTitle");
    if (t) { t.textContent = nuevoRecord ? "¡Nuevo récord personal! 🏆" : (completado ? "¡Reto completado!" : "¡Se acabó el tiempo!"); }
    var txt = $("#crFinalText");
    if (txt) {
      txt.textContent = "Respondiste " + cr.respuestas.length + " de " + D.preguntas.length +
        " preguntas y te sobraron " + sobrante.toFixed(1).replace(".", ",") + " segundos.";
    }
    var m = $("#crFinalMetrics");
    if (m) {
      m.innerHTML = "";
      [["Puntos", String(cr.puntaje)],
       ["Respuestas", cr.respuestas.length + "/" + D.preguntas.length],
       ["Mejor marca", String(Math.max(record, cr.puntaje))]].forEach(function (par) {
        var d = document.createElement("span");
        d.className = "metric";
        d.textContent = par[0] + ": " + par[1];
        m.appendChild(d);
      });
    }
    var r = $("#btnRepetirCR");
    if (r) { r.textContent = nuevoRecord ? "Defender el récord" : "Reintentar"; }
  }

  /** Corta el contrarreloj sin registrar resultado (al salir de la vista). */
  function abortarContrarreloj() {
    cr.activo = false;
    cr.pausado = false;
    if (cr.timer) { window.clearInterval(cr.timer); cr.timer = null; }
    if (crBox) { crBox.hidden = true; }
    if (crResult) { crResult.hidden = true; }
    if (crIntro) { crIntro.hidden = false; }
  }

  $("#btnRepetirCR") && on($("#btnRepetirCR"), "click", iniciarContrarreloj);

  /* ---------------------------------------------------------
     12. Colección
     --------------------------------------------------------- */
  function leerColeccion() {
    var c = leer(KEY_COLECCION, { ids: [], fechas: {} });
    if (!c || typeof c !== "object" || !Array.isArray(c.ids)) { c = { ids: [], fechas: {} }; }
    if (!c.fechas || typeof c.fechas !== "object") { c.fechas = {}; }
    return c;
  }
  function desbloquear(id) {
    var c = leerColeccion();
    if (c.ids.indexOf(id) === -1) {
      c.ids.push(id);
      c.fechas[id] = Date.now();
      guardar(KEY_COLECCION, c);
      anotar("Bicho descubierto", bichoPorId(id).nombre + " (" + c.ids.length + "/" + D.bichos.length + ")");
      persistir();
      actualizarBadgeColeccion();
      if (c.ids.length === D.bichos.length) {
        avisarLogro("¡Bestiario completo! Descubriste los 12 bichos 🏆");
        confeti(42);
      } else {
        avisarLogro("Nuevo bicho: " + bichoPorId(id).nombre + " · " + c.ids.length + "/" + D.bichos.length);
      }
    }
  }
  function actualizarBadgeColeccion() {
    var c = leerColeccion();
    var b = $("#navColeccionBadge");
    if (b) {
      b.textContent = String(c.ids.length);
      b.hidden = c.ids.length === 0;
    }
  }
  function renderColeccion() {
    var c = leerColeccion();
    var grid = $("#coleccionGrid");
    if (grid) {
      grid.innerHTML = "";
      D.bichos.forEach(function (bicho, i) {
        var desbloqueado = c.ids.indexOf(bicho.id) !== -1;
        var tile = document.createElement("div");
        tile.className = "bicho-tile" + (desbloqueado ? "" : " bloqueado");
        if (!prefiereMenosMovimiento()) {
          tile.style.setProperty("--d", (i * 45) + "ms");
          tile.classList.add("entra");
        }
        var fig = document.createElement("div");
        fig.innerHTML = bichoSVG(bicho, 74);
        tile.appendChild(fig);
        var nom = document.createElement("span");
        nom.className = "bt-nombre";
        nom.textContent = desbloqueado ? (bicho.emoji + " " + bicho.nombre) : "???";
        tile.appendChild(nom);
        var fr = document.createElement("span");
        fr.className = "bt-frase";
        fr.textContent = desbloqueado ? bicho.gancho : "Aún no descubierto";
        tile.appendChild(fr);
        grid.appendChild(tile);
      });
    }
    var n = c.ids.length;
    var cnt = $("#colCount"); if (cnt) { cnt.textContent = String(n); }
    var barra = $("#colProgress");
    var relleno = $("#colProgressFill");
    if (barra) {
      barra.setAttribute("aria-valuemax", String(D.bichos.length));
      barra.setAttribute("aria-valuenow", String(n));
    }
    if (relleno) { relleno.style.width = (n / D.bichos.length * 100) + "%"; }
  }

  /* ---------------------------------------------------------
     13. Laboratorio de métricas
     --------------------------------------------------------- */
  function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  function renderLaboratorio() {
    var c = leerColeccion();
    var record = leer(KEY_RECORD, 0);
    if (typeof record !== "number") { record = 0; }
    var tiempoMedio = metricas.muestrasTiempo > 0 ? metricas.segundosTotales / metricas.muestrasTiempo : 0;
    var completados = metricas.testCompletados;
    var iniciados = metricas.testIniciados;

    var tarjetas = [
      ["Visitas al sitio", String(metricas.visitas), "cada carga de página cuenta"],
      ["Sesiones", String(metricas.sesiones), "pestañas nuevas"],
      ["Tests iniciados", String(iniciados), "pulsaron Comenzar"],
      ["Tests completados", String(completados), "llegaron al resultado"],
      ["% de finalización", pct(completados, iniciados) + " %", "completados / iniciados"],
      ["Veces compartido", String(metricas.compartidos), "acciones de compartir aquí"],
      ["Enlaces abiertos", String(metricas.enlacesAbiertos), "visitas con ?r="],
      ["Tiempo medio del test", tiempoMedio > 0 ? formatearSegundos(tiempoMedio) : "—", "promedio de " + metricas.muestrasTiempo + " test"],
      ["Racha de días", String(rachaActual()), "días seguidos con visita"],
      ["Días activos", String(Object.keys(metricas.dias).length), "jornadas distintas"],
      ["Bichos descubiertos", c.ids.length + " / " + D.bichos.length, "colección personal"],
      ["Récord contrarreloj", record > 0 ? String(record) + " pts" : "—", metricas.contrarrelojPartidas + " partidas jugadas"]
    ];
    var grid = $("#metricGrid");
    if (grid) {
      grid.innerHTML = "";
      tarjetas.forEach(function (t) {
        var d = document.createElement("div");
        d.className = "metric-card";
        var v = document.createElement("span"); v.className = "mc-val"; v.textContent = t[1];
        var l = document.createElement("span"); l.className = "mc-label"; l.textContent = t[0];
        var n = document.createElement("span"); n.className = "mc-nota"; n.textContent = t[2];
        d.appendChild(v); d.appendChild(l); d.appendChild(n);
        grid.appendChild(d);
      });
    }

    // Reparto de bichos
    var bc = $("#barchart");
    if (bc) {
      bc.innerHTML = "";
      var maxB = 1;
      D.bichos.forEach(function (b) { maxB = Math.max(maxB, metricas.porBicho[b.id] || 0); });
      D.bichos.forEach(function (b) {
        var v = metricas.porBicho[b.id] || 0;
        var row = document.createElement("div");
        row.className = "bar-row";
        var et = document.createElement("span"); et.textContent = b.emoji + " " + b.nombre.replace("El ", "").replace("La ", "");
        var track = document.createElement("span"); track.className = "bar-track";
        var fill = document.createElement("span");
        fill.style.background = b.color;
        track.appendChild(fill);
        var val = document.createElement("span"); val.className = "bar-val"; val.textContent = String(v);
        row.appendChild(et); row.appendChild(track); row.appendChild(val);
        bc.appendChild(row);
        window.setTimeout(function () { fill.style.width = (v / maxB * 100) + "%"; }, 40);
      });
    }

    // Actividad por día (últimos 7)
    var bd = $("#barchartDias");
    if (bd) {
      bd.innerHTML = "";
      var dias = [];
      for (var i = 6; i >= 0; i--) {
        var d2 = new Date();
        d2.setDate(d2.getDate() - i);
        var iso = d2.getFullYear() + "-" + String(d2.getMonth() + 1).padStart(2, "0") + "-" + String(d2.getDate()).padStart(2, "0");
        dias.push({ iso: iso, v: metricas.dias[iso] || 0 });
      }
      var maxD = 1;
      dias.forEach(function (d3) { maxD = Math.max(maxD, d3.v); });
      dias.forEach(function (d3) {
        var row = document.createElement("div");
        row.className = "bar-row";
        var et = document.createElement("span"); et.textContent = d3.iso.slice(5);
        var track = document.createElement("span"); track.className = "bar-track";
        var fill = document.createElement("span");
        fill.style.background = "#FF6B35";
        track.appendChild(fill);
        var val = document.createElement("span"); val.className = "bar-val"; val.textContent = String(d3.v);
        row.appendChild(et); row.appendChild(track); row.appendChild(val);
        bd.appendChild(row);
        window.setTimeout(function () { fill.style.width = (d3.v / maxD * 100) + "%"; }, 40);
      });
    }

    // Registro
    var tb = $("#labLog");
    if (tb) {
      tb.innerHTML = "";
      if (!metricas.log.length) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.colSpan = 3;
        td.textContent = "Todavía no hay actividad registrada.";
        tr.appendChild(td); tb.appendChild(tr);
      } else {
        metricas.log.slice(0, 25).forEach(function (entrada) {
          var tr = document.createElement("tr");
          var t1 = document.createElement("td");
          t1.textContent = new Date(entrada.t).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
          var t2 = document.createElement("td"); t2.textContent = entrada.e;
          var t3 = document.createElement("td"); t3.textContent = entrada.d;
          tr.appendChild(t1); tr.appendChild(t2); tr.appendChild(t3);
          tb.appendChild(tr);
        });
      }
    }

    var raw = $("#rawJson");
    if (raw) {
      raw.textContent = JSON.stringify({ metricas: metricas, coleccion: c, recordContrarreloj: record }, null, 2);
    }
  }

  on($("#btnExportCsv"), "click", function () {
    var filas = [["metrica", "valor"]];
    var record = leer(KEY_RECORD, 0);
    var tiempoMedio = metricas.muestrasTiempo > 0 ? (metricas.segundosTotales / metricas.muestrasTiempo).toFixed(2) : "0";
    filas.push(["visitas", metricas.visitas]);
    filas.push(["sesiones", metricas.sesiones]);
    filas.push(["test_iniciados", metricas.testIniciados]);
    filas.push(["test_completados", metricas.testCompletados]);
    filas.push(["porcentaje_finalizacion", pct(metricas.testCompletados, metricas.testIniciados) + "%"]);
    filas.push(["compartidos", metricas.compartidos]);
    filas.push(["enlaces_abiertos", metricas.enlacesAbiertos]);
    filas.push(["tiempo_medio_segundos", tiempoMedio]);
    filas.push(["racha_dias", rachaActual()]);
    filas.push(["dias_activos", Object.keys(metricas.dias).length]);
    filas.push(["bichos_descubiertos", leerColeccion().ids.length + "/" + D.bichos.length]);
    filas.push(["record_contrarreloj", record]);
    filas.push(["contrarreloj_partidas", metricas.contrarrelojPartidas]);
    D.bichos.forEach(function (b) { filas.push(["veces_" + b.id, metricas.porBicho[b.id] || 0]); });
    var csv = filas.map(function (f) { return f.join(","); }).join("\n");
    descargarTexto("bicho-raro-metricas.csv", csv, "text/csv");
    var st = $("#labStatus"); if (st) { st.textContent = "CSV exportado."; }
  });

  on($("#btnExportJson"), "click", function () {
    var datos = { metricas: metricas, coleccion: leerColeccion(), recordContrarreloj: leer(KEY_RECORD, 0), exportado: new Date().toISOString() };
    descargarTexto("bicho-raro-metricas.json", JSON.stringify(datos, null, 2), "application/json");
    var st = $("#labStatus"); if (st) { st.textContent = "JSON exportado."; }
  });

  on($("#btnReset"), "click", function () {
    var ok = true;
    try { ok = window.confirm("¿Borrar todas tus métricas, tu colección y tu récord guardados en este dispositivo? Esta acción no se puede deshacer."); }
    catch (e) { ok = true; }
    if (!ok) { return; }
    borrarDatos();
    metricas = {
      version: 1, visitas: 0, sesiones: 0, testIniciados: 0, testCompletados: 0,
      compartidos: 0, enlacesAbiertos: 0, contrarrelojPartidas: 0,
      segundosTotales: 0, muestrasTiempo: 0, porBicho: {}, dias: {}, log: []
    };
    persistir();
    actualizarBadgeColeccion();
    renderLaboratorio();
    var st = $("#labStatus"); if (st) { st.textContent = "Datos borrados de este dispositivo."; }
    toast("Datos borrados");
  });

  function descargarTexto(nombre, contenido, tipo) {
    try {
      var blob = new Blob([contenido], { type: tipo + ";charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = nombre;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    } catch (e) {
      toast("No se pudo exportar en este navegador");
    }
  }

  /* ---------------------------------------------------------
     14. Bicho del día
     --------------------------------------------------------- */
  function renderBichoDelDia() {
    var cont = $("#bichoDelDia");
    if (!cont) { return; }
    var b = bichoDelDia();
    cont.innerHTML = "";
    var fig = document.createElement("div");
    fig.className = "dia-bicho";
    fig.innerHTML = bichoSVG(b, 96);
    var info = document.createElement("div");
    var h = document.createElement("h3");
    h.textContent = b.emoji + " Hoy manda " + b.nombre;
    var p = document.createElement("p");
    p.textContent = b.gancho + " Vuelve mañana: el bestiario rota cada día.";
    info.appendChild(h); info.appendChild(p);
    cont.appendChild(fig); cont.appendChild(info);
  }

  /* ---------------------------------------------------------
     15. Resultado compartido (?r=)
     --------------------------------------------------------- */
  function leerParametros() {
    var q = {};
    var s = window.location.search.replace(/^\?/, "");
    if (!s) { return q; }
    s.split("&").forEach(function (par) {
      var i = par.indexOf("=");
      if (i < 0) { return; }
      var k, v;
      try {
        k = decodeURIComponent(par.slice(0, i));
        v = decodeURIComponent(par.slice(i + 1));
      } catch (e) { return; } // parámetro malformado (p. ej. "%"): se ignora, no rompe el arranque
      q[k] = v;
    });
    return q;
  }

  function procesarCompartido() {
    var q = leerParametros();
    if (!q.r) { return false; }
    var respuestas = decodificarRespuestas(q.r);
    var banner = $("#sharedBanner");
    var texto = $("#sharedBannerText");
    if (!respuestas) {
      if (banner) { banner.hidden = false; }
      if (texto) { texto.textContent = "Ese enlace de resultado no se pudo leer (puede estar incompleto o modificado). ¡Pero puedes hacer tu propio test!"; }
      limpiarParametros();
      return false;
    }
    var alias = limpiarAlias(q.n || "");
    var esReto = q.t === "1";
    var r = calcularBicho(respuestas);
    metricas.enlacesAbiertos++;
    anotar("Enlace compartido abierto", (alias || "anónimo") + " · " + r.bicho.nombre + (esReto ? " · reto" : ""));
    persistir();

    estado.bicho = r.bicho;
    estado.respuestasCompartidas = respuestas;
    estado.compartido = true;
    estado.aliasCompartido = alias;

    if (banner) { banner.hidden = false; }
    if (texto) {
      texto.textContent = esReto
        ? ((alias ? alias + " te reta" : "Alguien te reta") + ": su bicho es " + r.bicho.nombre + " " + r.bicho.emoji + ". ¿Le ganas?")
        : ((alias ? alias + " consiguió " : "Alguien consiguió ") + r.bicho.nombre + " " + r.bicho.emoji + " · ¿Y tú?");
    }
    pintarResultado(r.bicho, true, alias);
    limpiarParametros();
    return true;
  }

  /** Quita el ?r= ya consumido para que recargar no vuelva a dispararlo. */
  function limpiarParametros() {
    try { window.history.replaceState(null, "", urlBase() + "#/" + rutaActual); }
    catch (e) { /* navegador sin replaceState */ }
  }

  /* ---------------------------------------------------------
     16. Arranque
     --------------------------------------------------------- */
  function engancharNavegacion() {
    $$("[data-route]").forEach(function (el) {
      on(el, "click", function (ev) {
        ev.preventDefault();
        ultimaAccionFueNavegacion = true;
        ir(el.getAttribute("data-route"));
      });
    });
    $$("[data-action='empezar']").forEach(function (el) {
      on(el, "click", function (ev) {
        ev.preventDefault();
        ir("test");
        iniciarTest();
      });
    });
    window.addEventListener("hashchange", function () {
      var r = rutaDesdeHash();
      if (r !== rutaActual) { ir(r, true); }
    });
  }

  function init() {
    // Si el navegador no permite guardar, hay que decirlo en vez de fallar en silencio.
    var puedeGuardar = true;
    try {
      window.localStorage.setItem("bichoRaro.prueba", "1");
      window.localStorage.removeItem("bichoRaro.prueba");
    } catch (e) { puedeGuardar = false; }

    registrarVisita();
    engancharNavegacion();
    actualizarBadgeColeccion();
    renderBichoDelDia();

    var y = $("#year"); if (y) { y.textContent = String(new Date().getFullYear()); }
    var fb = $("#factBichos"); if (fb) { fb.textContent = String(D.bichos.length); }

    var compartido = procesarCompartido();
    if (compartido) {
      ir("resultado");
    } else {
      ir(rutaDesdeHash());
    }

    if (!puedeGuardar) {
      toast("Tu navegador no permite guardar datos: el juego funciona igual, pero no conservará tu colección ni tus récords.");
    }

    // Aviso de privacidad mínimo en consola para quien depure
    try {
      console.info("[Tu Bicho Raro] Todo se guarda solo en este dispositivo. Sin servidores, sin rastreadores.");
    } catch (e) { /* consola no disponible */ }
  }

  // Arranque inmediato y a prueba de esperas de terceros:
  // nuestros scripts van al final del <body>, así que el DOM que necesitamos ya existe.
  // No dependemos de DOMContentLoaded porque la plataforma de alojamiento inyecta un
  // script externo con `defer` que puede retrasar ese evento (y con él, el juego).
  var arrancado = false;
  function arrancar() {
    if (arrancado) { return; }
    arrancado = true;
    init();
  }
  if (document.getElementById("view-inicio")) {
    arrancar();
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
  window.addEventListener("load", arrancar); // red de seguridad
})();
