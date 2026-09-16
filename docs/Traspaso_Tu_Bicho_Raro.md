# Traspaso — Tu Bicho Raro

Documento de entrega, uso y mantenimiento. Está escrito para que cualquier persona
pueda quedarse con el sitio sin conocer cómo se construyó.

---

## 1. Qué es

**Tu Bicho Raro** es un sitio web de entretenimiento: un test de personalidad juguetón que
convierte 10 respuestas cotidianas en una de **12 criaturas** ("bichos"), cada una con
nombre, frase, descripción, tres estadísticas, superpoder y kriptonita.

Es un sitio **estático**: no hay servidor de aplicaciones, ni base de datos, ni cuentas de
usuario. Todo ocurre en el navegador de quien lo visita.

### Qué incluye

| Pieza | Qué hace | Dónde vive |
|---|---|---|
| Test principal | 10 preguntas, progreso visible, resultado con tarjeta | `index.html` + `assets/js/app.js` |
| Tarjeta compartible | Imagen 1080×1350 dibujada en `<canvas>`, descargable | `assets/js/app.js` (sección 10) |
| Ciclo viral | El resultado viaja en la URL (`?r=…`); quien la abre ve el reto y hace el suyo | `assets/js/app.js` (secciones 3 y 15) |
| Reto entre amigos | Enlace con alias (`&n=Ana&t=1`) y mensaje "te reta" | `assets/js/app.js` |
| Contrarreloj | Las mismas 10 preguntas en 40 s, con puntaje y récord local | `assets/js/app.js` (sección 11) |
| Bicho del día | Criatura distinta cada jornada (se calcula con la fecha) | `assets/js/app.js` (sección 14) |
| Colección | Bestiario de 12 fichas; se desbloquean al jugar | `assets/js/app.js` (sección 12) |
| Panel "Laboratorio" | Tu resumen de uso, gráficos y exportación | `assets/js/app.js` (sección 13) |
| Contenido | Preguntas, opciones y bichos | `assets/js/data.js` |
| Estilo visual | Colores, tipografía, animaciones | `assets/css/style.css` (bloque `:root`) |
| Imagen social | Vista previa 1200×630 | `assets/img/og.png` |
| Icono | Favicon | `assets/img/favicon.svg` |

### Estructura de archivos

```
index.html                  ← página única, todas las vistas
assets/css/style.css        ← hoja de estilo única
assets/js/data.js           ← TODO el contenido editable del juego
assets/js/app.js            ← toda la lógica
assets/img/og.png           ← imagen de vista previa social (1200×630)
assets/img/favicon.svg      ← icono
```

Total: 6 archivos, ~146 KB. No usa ninguna biblioteca, fuente ni servicio externo.

---

## 2. Cómo usarlo

**Para jugar:** abre el enlace. La portada explica el juego en una frase. El recorrido
completo es: portada → *Empezar el test* → 10 preguntas → resultado con tarjeta → compartir
o retar. No hay ningún paso que exija explicación previa.

**Para publicar:** el sitio se sube como está (archivos estáticos). El archivo de entrada es
`index.html` y todo lo que necesita está en la misma carpeta, con rutas relativas. No hay
paso de compilación.

**Para revisarlo en local:** cualquier servidor estático sirve. Ejemplo:

```
cd <carpeta-del-sitio>
python -m http.server 8777
# abrir http://127.0.0.1:8777/
```

> Abrir el `index.html` con doble clic también funciona, pero algunas funciones
> (compartir, portapapeles) se comportan mejor servidas por HTTP/HTTPS.

---

## 3. Cómo actualizar el contenido

**Casi todo el texto del juego se cambia en un solo archivo: `assets/js/data.js`.**

- **Añadir o cambiar una pregunta** → array `PREGUNTAS`. Cada pregunta tiene `texto` y
  cuatro `opciones`; cada opción lleva `ids`, la lista de bichos a los que suma un punto.
- **Añadir o cambiar un bicho** → array `BICHOS`. Campos: `id` (sin espacios, único),
  `nombre`, `emoji`, `gancho`, `desc`, `stats` (los tres nombres deben coincidir con
  `STATS`), `superpoder`, `kriptonita`, `color` (hex) y `compartir` (el texto que se manda
  por defecto al compartir).
- **Cambiar la duración o el puntaje del contrarreloj** → al final del archivo:
  `segundosContrarreloj`, `puntosPorRespuesta`, `puntosPorSegundoSobrante`.

⚠️ **Regla de oro al añadir un bicho:** cada bicho debe quedar bien repartido. Si un bicho
aparece en muchas preguntas, ganará casi siempre y el test pierde gracia. Lo cómodo es
**6 o 7 apariciones por bicho** (contando preguntas distintas, no opciones). Tras cualquier
cambio, hay que re-verificar el reparto (ver sección 5).

**Para cambiar el color o el aire visual** → `assets/css/style.css`, bloque `:root`
(al principio): `--crema`, `--tinta`, `--naranja`, `--amarillo`, `--coral`, `--verde`,
`--violeta`, `--rosa`. Cambiar esas variables repinta todo el sitio.

**Para cambiar el texto de portada, "Acerca" o los botones** → `index.html`.

**Para cambiar la imagen de vista previa social** → reemplazar `assets/img/og.png`
(1200×630 px). Mantén ese tamaño: es el que esperan WhatsApp, X, Facebook y LinkedIn.

**Para tocar las animaciones** → `assets/css/style.css`, bloque de animaciones (busca
"Animaciones de entrada y micro-interacción" y "Confeti"). Las de entrada y el confeti se lanzan
desde `assets/js/app.js` (secciones 6b y 10). Todas se desactivan solas cuando el sistema del
visitante pide **reducir movimiento**, así que no hace falta duplicar lógica de accesibilidad.

**Para cambiar el color de acento del resultado** → no se edita a mano: el sitio usa el color
del bicho que toca (`--acento`). Si quieres un acento fijo, se cambia en la misma sección del JS.

### La tarjeta de resultado: cómo se coloca el texto

La tarjeta que se comparte (1080×1350) se dibuja en un lienzo con coordenadas fijas. El marco
interior va de 70 a 1280 px de alto, y el contenido está repartido así:

| Elemento | Posición vertical |
|---|---|
| Encabezado "T U B I C H O R A R O" | 158 |
| Criatura | centrada en 392 |
| Emoji y nombre | 668 y 752 (el nombre **se encoge solo** si es largo) |
| Frase gancho | 806 (hasta 2 líneas) |
| Tres estadísticas | 900 → 1074 |
| Superpoder / Kriptonita | 1090 → 1210 |
| Pie con la dirección | 1244 |

⚠️ **Si añades un elemento nuevo a la tarjeta**, respeta ese presupuesto: la franja de 1210 a
1280 es el único hueco libre. Si lo desbordas, el texto se superpondrá — justo el defecto que se
corrigió. Hay una prueba automática (`test/tarjeta.js`) que revisa las 12 tarjetas y te avisa si
algo se sale o se solapa.

---

## 4. Cómo leer el panel de uso

El panel se llama **Laboratorio** y muestra **tu** actividad, no la del sitio.

> **Muy importante:** este sitio no tiene servidor, así que **no existen métricas
> agregadas**. Nadie —ni tú— puede ver cuántas personas han jugado, porque la información
> nunca sale del dispositivo de cada visitante. Lo que ves en el panel es lo que ha pasado
> **en ese navegador concreto**.

| Indicador | Qué significa exactamente |
|---|---|
| Visitas al sitio | Cada vez que se cargó la página en este navegador |
| Sesiones | Primera visita de cada pestaña nueva |
| Tests iniciados | Veces que se pulsó "Comenzar" |
| Tests completados | Veces que se llegó hasta el resultado |
| % de finalización | completados ÷ iniciados, en este dispositivo |
| Veces compartido | Acciones de compartir pulsadas aquí (no confirmaciones de que llegaran) |
| Enlaces abiertos | Veces que se abrió un enlace con `?r=` |
| Tiempo medio del test | Promedio de segundos entre "Comenzar" y el resultado |
| Racha de días | Días seguidos con al menos una visita |
| Días activos | Jornadas distintas con actividad |
| Bichos descubiertos | Cuántas de las 12 criaturas se han desbloqueado |
| Récord contrarreloj | Mejor puntaje del modo contrarreloj |

Se puede **exportar CSV o JSON** y **borrar todos los datos** desde el propio panel.

**Limitaciones honestas de la persistencia:** los datos viven en `localStorage`. Se pierden
si se borran los datos del navegador, si se usa modo privado o incógnito, o en Safari/iOS
si pasan unos 7 días sin interacción con el sitio. No hay cuentas ni recuperación remota.

---

## 5. Verificación y pruebas

Junto al sitio se entregan tres guiones de prueba ya ejecutados (fuera de la carpeta
publicada, para que no viajen al servidor):

| Guion | Qué comprueba | Resultado |
|---|---|---|
| `test/run.js` | 85 comprobaciones funcionales sobre el sitio real con un DOM de navegador (jsdom): partida completa, ciclo viral, contrarreloj, colección, panel, **animaciones**, accesibilidad y metadatos | 85 / 85 |
| `test/audit.js` | 19 comprobaciones: autocontención sin recursos externos, integridad de los datos y reparto de resultados (muestreo de 200.000 partidas) | 19 / 19 |
| `test/tarjeta.js` | **Geometría de la tarjeta**: intercepta el canvas real y verifica que ningún texto se salga ni se solape, en las 12 tarjetas. Incluye autocontrol contra el layout antiguo | 12 tarjetas · 193 textos · 0 incidencias |
| `test/contraste.js` | Contraste WCAG 2.x de los pares de color reales | 29 / 29 |
| `test/idioma.js` | Idioma del contenido servido: etiqueta `lang`, textos visibles, alternativos, microcopy y contenido del juego | 7 / 7 |
| `test/distribucion.js` | Enumeración exhaustiva de las 1.048.576 combinaciones de respuestas posibles | 5,60 %–9,95 % por bicho (ideal 8,33 %) |

**Total: 145 comprobaciones automatizadas.** La batería funcional (`run.js`) se ejecutó también
contra la dirección publicada, no solo en local.

Para volver a ejecutarlos hace falta Node.js y, en `test/`, `npm install jsdom`:

```
node test/run.js            # requiere el sitio servido en http://127.0.0.1:8777
node test/audit.js          # requiere el mismo servidor
node --stack-size=4000 test/distribucion.js
```

---

## 6. Límites conocidos (y qué haría falta para superarlos)

1. **No hay vista previa social personalizada.** Cuando alguien comparte su resultado,
   WhatsApp/X/etc. muestran la imagen y el texto **fijos** del sitio (los `og:` de
   `index.html`), no el bicho de quien comparte. Los robots de esas plataformas no ejecutan
   JavaScript, así que esto es físicamente imposible en un sitio estático. *Solución si algún
   día se quiere:* una función serverless que devuelva HTML con etiquetas generadas.
2. **No hay métricas agregadas** ni ranking global (ver sección 4). *Solución:* un endpoint
   que reciba eventos; implicaría añadir backend y una política de privacidad.
3. **La colección y los récords no viajan entre dispositivos.** *Solución:* cuentas o un
   código de sincronización.
4. **La tarjeta PNG no es un enlace.** En Instagram o en las stories, una imagen compartida
   no se puede pulsar: sirve como marca y como recuerdo, no como vector de tráfico. El
   vector real es el **enlace**.
5. **Descarga de imagen en iOS.** Safari es irregular con la descarga directa; el sitio ya
   usa primero el menú de compartir del sistema, que es la vía fiable en iPhone.
6. **Si el navegador bloquea el almacenamiento** (modo privado, cuota llena), el juego sigue
   funcionando: simplemente no conserva colección ni récords.
7. **URL social relativa.** `og:image` y `og:url` están en rutas relativas y funcionan porque
   las plataformas las resuelven contra la dirección de la página. Cuando el sitio tenga
   dominio propio, conviene pasarlas a absolutas.

---

## 7. Ideas para la siguiente ronda (por impacto)

1. **Añadir más bichos** manteniendo el reparto equilibrado (regla de la sección 3).
2. **Un modo "duelo"**: comparar dos resultados en una misma pantalla a partir de un enlace
   con dos payloads.
3. **Logros**: "descubriste los 12", "respondiste en menos de 20 s", "jugaste 3 días
   seguidos". Son baratos y aumentan el retorno.
4. **Cambio de idioma** (ES/EN) leyendo el idioma del navegador; todo el texto ya está
   centralizado en `data.js`, así que es una copia del archivo con otra clave.
5. **Backend opcional** solo para métricas y ranking, si se acepta la política de privacidad
   correspondiente.

---

*Entrega preparada junto con: `Copy_Lanzamiento_y_Compartir.md` (textos listos para usar) y
`Verificacion_y_Evidencia.md` (resultados de las pruebas).*
