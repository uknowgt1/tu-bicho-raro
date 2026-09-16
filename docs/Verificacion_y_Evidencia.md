# Verificación y evidencia — Tu Bicho Raro

Todo lo que sigue se ejecutó sobre el sitio real (no sobre un diseño teórico).
Fecha de la batería: 2026-09-11.

---

## 1. Resumen

| Batería | Qué prueba | Resultado |
|---|---|---|
| `test/run.js` — funcional con DOM real (jsdom) | Partida completa, ciclo viral, contrarreloj, colección, panel, robustez, accesibilidad, metadatos | **77 / 77** |
| `test/audit.js` — auditoría estática y de datos | Autocontención (sin recursos externos), integridad del contenido, reparto de resultados | **19 / 19** |
| `test/contraste.js` — WCAG 2.x | Contraste de los 28 pares de color reales del sitio | **28 / 28** |
| `test/idioma.js` — contenido servido | Idioma declarado, textos visibles, textos alternativos, microcopy y contenido del juego | **7 / 7** |
| `test/distribucion.js` — exhaustivo | Las 1.048.576 combinaciones de respuestas posibles | Reparto **5,60 %–9,95 %** (ideal 8,33 %) |
| `node --check` | Sintaxis de `data.js` y `app.js` | Sin errores |

**Total: 131 comprobaciones automatizadas, 0 fallos.** A ellas se suma la batería funcional
completa ejecutada también **contra la dirección publicada** (77/77), descrita en la sección 9.

---

## 2. Cómo se ejecutó

```
# 1. servir el sitio
cd <carpeta-del-sitio> && python -m http.server 8777 --bind 127.0.0.1
# 2. pruebas
cd test && npm install jsdom
node run.js
node audit.js
node contraste.js
node --stack-size=4000 distribucion.js
```

`run.js` y `audit.js` abren el sitio con un DOM de navegador real (jsdom), cargan las hojas
de estilo y los scripts, y **simulan a una persona**: pulsan botones, responden las 10
preguntas, abren la colección, miran el panel, juegan el contrarreloj, recargan la página
conservando el almacenamiento y abren un enlace compartido en una sesión limpia.

---

## 3. Recorrido funcional (extracto de resultados)

| Comprobación | Resultado observado |
|---|---|
| La página carga y monta el titular | `¿Qué bicho raro habita en ti?` |
| Idioma declarado | `es-419` |
| Visitas registradas en la primera carga | 1 visita, 1 sesión, 1 día de actividad |
| Errores de consola en la carga inicial | 0 |
| Al pulsar "Empezar" | se abre el cuestionario, 4 opciones, "10" en el contador |
| Tras 10 respuestas | se llega al resultado: `🌀 El Caos Encantador` |
| Estadísticas del resultado | 3 barras (Caos, Encanto, Energía) |
| Métricas tras completar | iniciados 1 · completados 1 · tiempo medio muestreado |
| Colección | 1 descubierto, 11 fichas bloqueadas de 12, 12 ilustraciones SVG etiquetadas |
| Compartir (copiar enlace) | genera URL con `?r=…` y `n=Ana`; el estado informa al usuario |
| Compartidos registrados | 1 |
| Contrarreloj | 10 preguntas, termina, **récord guardado = 180 puntos** |
| Recarga (persistencia) | visitas 2, colección conservada, racha = 1 día |
| Enlace compartido abierto en sesión limpia | aviso visible: *"Ana te reta: su bicho es El Caos Encantador 🌀. ¿Le ganas?"*; resultado marcado como ajeno (*"Ana obtuvo"*) |
| El enlace compartido **no** cuenta como test propio | completados sigue en 1 |
| El `?r=` se limpia tras consumirlo | sí (no se repite al recargar) |
| Enlace inválido (`?r=esto-no-es-valido`) | no rompe el sitio, explica el problema y ofrece jugar |

## 4. Ciclo viral: comprobación de ida y vuelta

Se generaron 8 payloads aleatorios (`?r=`), se abrieron en el sitio y se comparó el bicho
mostrado con el calculado por una **reimplementación independiente** del algoritmo:

> **8 de 8 coincidencias exactas.**

Los enlaces miden ~20 caracteres en el parámetro `r` (muy por debajo de cualquier límite de
mensajería). El receptor ve siempre el resultado **etiquetado como de otra persona** y con
el botón primario *"Hacer mi test ahora"*, que es lo que cierra el ciclo.

## 5. Reparto de resultados (calidad de contenido)

Se enumeraron **todas** las combinaciones posibles de respuestas (4¹⁰ = 1.048.576) para
comprobar que ninguna criatura queda marginada y que el test no "cae" siempre en la misma:

| Bicho | % de resultados | Bicho | % de resultados |
|---|---|---|---|
| El Noctámbulo | 5,90 % | El Hogareño Compulsivo | 5,60 % |
| La Madrugadora | 9,86 % | El Irónico de Guardia | 9,65 % |
| El Caos Encantador | 9,95 % | La Perfeccionista | 9,24 % |
| La Mente Estratégica | 8,90 % | El Espíritu Libre | 5,95 % |
| El Alma Dramática | 9,55 % | La Calma Andante | 9,85 % |
| La Empatía Andante | 5,85 % | El Aventurero | 9,69 % |

Ideal teórico: 8,33 % por bicho. **Antes de la corrección**, la distribución iba de
**0,61 %** (La Madrugadora) a **18,94 %** (El Alma Dramática): el test estaba roto como
juego. Se rediseñó el reparto de puntos de las 40 opciones y quedó entre 5,60 % y 9,95 %.

## 6. Autocontención (imprescindible para la vista previa)

El entorno de publicación aplica una CSP estricta: **todo lo que el navegador descargue de
otro dominio se bloquea**. Auditoría sobre los 6 archivos del sitio:

- Recursos externos que el navegador deba descargar: **ninguno**.
- Fuentes externas (`@font-face`, `@import`): **ninguna** (tipografía del sistema).
- Llamadas de red (`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`): **ninguna**.
- Únicas URL externas presentes: el `xmlns` del SVG, y los enlaces que **pulsa el usuario**
  (WhatsApp, Telegram, X). Ninguna se descarga automáticamente.
- Peso total: **146 KB en 6 archivos** (límite del entorno: 100 MB / 5000 archivos).
- Sin `node_modules`, sin mapas de código, sin archivos de secretos.

## 7. Accesibilidad y móvil (comprobado en la batería)

| Comprobación | Resultado |
|---|---|
| Todos los botones tienen texto accesible | 0 sin texto |
| Ilustraciones SVG con etiqueta o marcadas decorativas | 0 sin etiqueta |
| Enlace "saltar al contenido" | presente |
| Vista activa indicada con `aria-current` | sí (`Inicio`, `Test`, …) |
| Barras de progreso con `role="progressbar"` y valores | sí |
| Tabla del panel con encabezados `th[scope=col]` | 3 |
| Canvas del resultado | `role="img"` + etiqueta, con equivalente textual completo al lado (nombre, gancho, descripción, 3 estadísticas, superpoder y kriptonita) |
| `prefers-reduced-motion` | desactiva animaciones y transiciones |
| Áreas táctiles de los controles | mínimo 44 px de alto, los botones principales 48–58 px |
| Un solo eje de scroll, sin desbordes horizontales | `overflow-x:hidden` + rejillas flexibles con `minmax()` |
| Contrarreloj y accesibilidad temporal | se **pausa** al cambiar de pestaña; el modo es opcional y no bloquea el test principal |
| Contraste de color (WCAG AA) | **28 pares auditados con script propio**: 7 incumplían y se corrigieron → 0 fallos |

### 7.1 Contraste: qué se corrigió

La auditoría de contraste encontró 7 pares por debajo del mínimo (enlaces 3,57:1; texto de botón
sobre naranja 2,84:1; gancho del resultado 2,65:1; aviso sin JS 3,83:1; opción elegida 3,42:1;
marcador del campo 3,10:1; relleno de la barra de progreso 2,44:1). Se corrigieron con tonos
oscurecidos calculados por búsqueda (`--naranja-texto`, `--naranja-ui`, `--coral-texto`,
`--verde-ui` y los tres colores de las barras de estadística) y sustituyendo texto blanco por
texto oscuro sobre las superficies saturadas. La paleta cálida se mantiene.

## 8. Metadatos sociales

- `og:title`, `og:description`, `og:image` (1200×630), `og:image:alt`, `og:locale`, `og:type`.
- `twitter:card = summary_large_image` + título, descripción e imagen.
- La imagen `assets/img/og.png` existe y pesa 37 KB.

## 9. Verificación sobre el sitio ya publicado (en vivo)

No bastaba con comprobar que el enlace responde: se comprobó **qué ve realmente un navegador**
al abrir la dirección publicada.

**Qué sirve el servidor.** La página y sus 5 recursos responden HTTP 200 con el tipo correcto
(`text/css`, `application/javascript`, `image/png`, `image/svg+xml`). El HTML servido pesa
~2,3 KB más que el archivo local: la plataforma de alojamiento **inyecta sus propios scripts
de analítica y de distintivo** (un SDK de métricas y `badge.autoclawai.space/bootstrap.js`).
Eso es ajeno al sitio, no rompe nada y no añade contenido visible al usuario.

**Qué ve el navegador.** Con un DOM de navegador real se abrió la dirección publicada y se
comprobó lo siguiente:

- El motor **sí arranca** en el dominio publicado: `BICHO_DATA` carga con 12 bichos y 10 preguntas,
  el "bicho del día" se rellena, la navegación responde y el sitio registra en consola su aviso
  de privacidad.
- **Los datos se guardan de verdad**: la traza de `localStorage` registra
  `setItem OK bichoRaro.metricas.v1` y, tras iniciar el test, el registro pasa a
  `testIniciados: 1`. Una primera sospecha de que no persistía resultó ser un artefacto de la
  herramienta de prueba, que leía el almacenamiento antes de que el motor arrancara.
- **Sin errores propios**: el único error no capturado de la página procede de un script que
  inyecta la plataforma (el distintivo de AutoClaw), no del sitio.

**La batería completa, contra el sitio publicado:** se repitió la suite funcional apuntando al
dominio público y pasó **77/77**, incluyendo "Se registra 1 visita en el almacenamiento local →
visitas=1" y la recarga, el ciclo viral completo y el contrarreloj. Los 6 errores registrados
eran ruido de la plataforma y se descartaron de forma explícita y trazada.

**Defecto de producción encontrado y corregido.** El motor se inicializaba al evento
`DOMContentLoaded`, y la plataforma inyecta un script externo con `defer` que **retrasa ese
evento**: con la red lenta, el juego tardaba en activarse aunque la página ya se viera. Ahora el
arranque es inmediato (los scripts van al final del documento) y no depende de terceros.

## 10. Tarjeta de resultado: corrección del texto superpuesto

Se reportó texto superpuesto al ver los resultados. Era real y estaba justo en la imagen que se
comparte: las estadísticas y los recuadros de "Superpoder"/"Kriptonita" se dibujaban hasta
y = 1300 px, cuando el marco de la tarjeta termina en y = 1280, y las dos líneas del pie caían
encima de esos recuadros. Además, los nombres largos ("El Hogareño Compulsivo", "La Mente
Estratégica") se dibujaban a 78 px fijos y **desbordaban el ancho** de la tarjeta.

| Antes | Ahora |
|---|---|
| Nombre a tamaño fijo (78 px): se salía | El nombre se **encoge solo** hasta caber (78 → 44 px mínimo) |
| Estadísticas 970→1156; recuadros 1180→**1300** (fuera del marco) | Estadísticas 900→1074; recuadros 1090→**1210**; pie a 1244: todo dentro del marco (70→1280) |
| Pie en dos líneas (1222 y 1276), encima de los recuadros | Una sola línea a 1244, con 34 px de margen hasta el borde |
| Sin elementos gráficos | Destellos decorativos en las esquinas y puntos del color del bicho |

**Cómo se verificó.** Se añadió `test/tarjeta.js`, que intercepta el canvas real, registra cada
`fillText` con su posición y tamaño, calcula la caja de cada texto y comprueba dos cosas en las
**12 tarjetas** (una por bicho): que ningún texto se salga del marco y que ningún par de textos
se solape. Resultado: **12 tarjetas, 193 textos analizados, 0 incidencias**.

El mismo guion incluye un **autocontrol**: aplica el detector al layout antiguo y comprueba que
lo habría rechazado (detecta 5 problemas). Sin eso, una prueba que siempre pasa no demuestra nada.

## 11. Animaciones añadidas

| Animación | Dónde | Detalle |
|---|---|---|
| Entrada de la tarjeta | Resultado | Aparece con una leve rotación y rebote |
| Entrada escalonada | Resultado | Los 8 bloques entran uno tras otro (60 ms de separación) |
| Confeti | Resultado y bestiario completo | 28 piezas (16 si el resultado es ajeno), con velocidad, giro y retardo propios |
| Conteo ascendente | Estadísticas | Las cifras suben de 0 a su valor en 780 ms |
| Aviso de logro | Al descubrir un bicho | "Nuevo bicho: … · 3/12"; al completar los 12, "¡Bestiario completo! 🏆" |
| Entrada de pregunta | Test y contrarreloj | Pregunta y opciones entran con desplazamiento lateral |
| Pulso al elegir | Opciones | Pequeño rebote al pulsar |
| Brillo de progreso | Test | Un brillo recorre la barra rellena |
| Criatura que respira | Bicho del día y colección | Movimiento suave, escalonado por ficha |
| Entrada de fichas | Colección | Las 12 fichas aparecen escalonadas (45 ms entre cada una) |

**Accesibilidad:** todas respetan `prefers-reduced-motion: reduce` y se desactivan sin romper
nada. Verificado por prueba en ambos sentidos: con movimiento normal se generan 28 piezas de
confeti; con movimiento reducido, ninguna.

## 12. Límites declarados (no se ocultan)

1. Sin backend, **no hay métricas agregadas**: el panel mide solo el dispositivo actual.
2. La vista previa social es **fija** (los robots de WhatsApp/X no ejecutan JavaScript).
3. La tarjeta PNG no es clicable fuera del sitio.
4. Los datos locales se pueden perder (modo privado, borrado, política de Safari).
5. `og:image`/`og:url` son relativas; al tener dominio propio conviene pasarlas a absolutas.
6. **Verificación no realizada por falta de dispositivo**: no se probó en hardware móvil real ni
   con lector de pantalla (VoiceOver/TalkBack), porque el revisor específico de móvil y
   accesibilidad agotó su tiempo de ejecución. El contraste, el foco, el teclado, las etiquetas y
   los tamaños táctiles sí están verificados de forma automatizada. No hay indicios de problema,
   pero la prueba en dispositivo físico queda pendiente.

Estos cinco puntos están detallados, con su vía de solución, en `Traspaso_Tu_Bicho_Raro.md`,
sección 6.
