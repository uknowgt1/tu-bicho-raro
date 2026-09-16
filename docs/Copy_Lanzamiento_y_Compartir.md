# Copy de lanzamiento y textos de compartir — "Tu Bicho Raro"

Material listo para copiar y pegar. Tono juguetón, cálido, humor neutro (válido en LATAM y España).
El sitio tiene **10 preguntas** y **12 bichos**; todo el copy está ajustado a eso.

---

## 1. Portada

**Titular principal (48 caracteres)**
> ¿Qué bicho raro habita en ti?

**Subtítulo (156 caracteres)**
> Responde 10 preguntas absurdamente cotidianas y descubre tu criatura interior: su nombre, sus poderes y su kriptonita. Luego presúmelo.

**Variantes del titular**
1. Todo el mundo esconde un bicho raro. ¿Y el tuyo?
2. Hay una criatura esperándote dentro. Vamos a conocerla.
3. Dinos cómo vives y te diremos qué bicho eres.

**Línea de datos de la portada**
> 12 bichos por descubrir · 10 preguntas · 0 registros

---

## 2. Hooks para redes

| # | Texto | Dónde funciona mejor |
|---|---|---|
| 1 | Hicimos un test que te dice qué criatura rara eres 🌀 ¿te atreves? | TikTok |
| 2 | 2 minutos. 10 preguntas. 1 bicho con tu nombre. | X / WhatsApp |
| 3 | Ya sé qué bicho soy y ahora todos quieren saber el suyo 🎴 | Instagram |
| 4 | Reto: ¿averiguas tu criatura antes de que se acabe el tiempo? ⏱️ | X / Stories |
| 5 | No sabías que necesitabas saber qué bicho raro eres. Ahora sí. | WhatsApp / grupos |

Sustituye el final por el enlace del sitio cuando lo tengas.

---

## 3. Botones y llamadas a la acción (texto principal → alternativa)

| Acción | Principal (en el sitio) | Alternativa |
|---|---|---|
| Empezar | Empezar el test | Vamos, descúbrete |
| Empezar desde el hero | Descubrir mi bicho | Muéstrame mi criatura |
| Contrarreloj | Reto contrarreloj | A ver qué tan rápido eres |
| Compartir | Compartir | Enviar mi tarjeta |
| Copiar | Copiar enlace | Copiar para pegar |
| Descargar | Descargar tarjeta | Guardar imagen |
| Reto | Retar a un amigo | Envía el reto |
| Colección | Ver mi colección | Mis bichos |
| Repetir | Repetir el test | Otra vez, a ver si cambio |
| Terminar | Hacer mi test ahora | Quiero el mío |

---

## 4. Microcopy de estados

- **Cargando (referencia):** Un momento, invocando a tu bicho…
- **Vacío (colección sin bichos):** Todavía no has conocido a ninguno. Haz el test y empieza tu bestiario.
- **Vacío (laboratorio):** Sin actividad aún: juega una partida y este panel se llena solo.
- **Error (enlace roto):** Ese enlace de resultado no se pudo leer (puede estar incompleto o modificado). ¡Pero puedes hacer tu propio test!
- **Copiado:** ✅ Enlace copiado. Pégalo donde quieras.
- **Respaldo de compartir:** Tu navegador no abrió el menú de compartir, así que copiamos el enlace.
- **Sin exportar imagen:** Tu navegador no permitió exportar la imagen; puedes compartir el enlace.
- **Fin de test:** ¡Listo! Ya sabemos qué bicho eres.
- **Tiempo agotado:** ¡Se acabó el tiempo!
- **Récord nuevo:** ¡Nuevo récord personal! 🏆
- **Reto enviado:** Reto enviado ⚔️
- **Datos borrados:** Datos borrados de este dispositivo.

---

## 5. Textos de resultado compartible

**Corto (máx. 140 caracteres)**
> Soy [BICHO], mi criatura interior 🌀 ¿Y tú qué bicho raro eres? Haz el test: [URL]

**Largo (máx. 280 caracteres)**
> Hice el test de Tu Bicho Raro y me tocó [BICHO]. 10 preguntas cotidianas, 12 criaturas posibles y una tarjeta lista para presumir. Sin registros ni cuentas. Descubre el tuyo en 2 minutos: [URL]

**Los 12 textos que el sitio usa por defecto** (viven en `assets/js/data.js`, campo `compartir`)

| Bicho | Texto |
|---|---|
| El Noctámbulo | Soy El Noctámbulo 🦉: mi cerebro arranca cuando el resto apaga la luz. |
| La Madrugadora | Soy La Madrugadora 🌅: a las 8 a.m. ya terminé medio día. |
| El Caos Encantador | Soy El Caos Encantador 🌀: nada está bajo control y todo sale bien. |
| La Mente Estratégica | Soy La Mente Estratégica ♟️: ya sabía cómo iba a terminar esto. |
| El Alma Dramática | Soy El Alma Dramática 🎭: incluso mi lista de compras tiene trama. |
| La Empatía Andante | Soy La Empatía Andante 🫂: puedo saber cómo estás antes de que hables. |
| El Aventurero | Soy El Aventurero 🧭: dije "vamos" antes de preguntar dónde. |
| El Hogareño Compulsivo | Soy El Hogareño Compulsivo 🛋️: mi plan perfecto ya está en mi sofá. |
| El Irónico de Guardia | Soy El Irónico de Guardia 😏: mi comentario fue mejor que el momento. |
| La Perfeccionista | Soy La Perfeccionista 📐: ya lo revisé tres veces y todavía no está. |
| El Espíritu Libre | Soy El Espíritu Libre 🎈: mi agenda dice "improvisar" otra vez. |
| La Calma Andante | Soy La Calma Andante 🍃: se cayó el mundo y yo seguía con mi té. |

---

## 6. Mensaje de reto (lo genera el sitio con el botón "Retar a un amigo")

> **[NOMBRE] te reta** ⚔️
> Su bicho es **[BICHO]**. ¿Crees que el tuyo le gana?
> Haz el test y compara resultados: [URL]

---

## 7. Open Graph y Twitter Card (ya implementados en `index.html`)

- **og:title (56):** Tu Bicho Raro — descubre qué criatura habita tu caos
- **og:description (120):** Un test juguetón de 10 preguntas que revela tu Bicho Raro interior. Comparte tu tarjeta, reta a tus amigos y completa el bestiario de 12 criaturas.
- **og:image:** `assets/img/og.png` — 1200×630, con el titular, tres criaturas ilustradas y la llamada "Descúbrelo gratis".
- **twitter:card:** `summary_large_image`.
- **Pendiente al publicar con dominio propio:** cambiar `og:image` y `og:url` de rutas relativas a **absolutas** (`https://tudominio/assets/img/og.png`). Es una línea en el `<head>`.

---

## 8. Acerca del sitio y privacidad (ya en la vista "Acerca")

**Acerca (≈390 caracteres)**
> Tu Bicho Raro es un test de personalidad juguetón, hecho para compartir. Diez preguntas cotidianas se convierten en una de doce criaturas, cada una con su carácter, su superpoder y su punto débil. Es un juego: no pretende describirte de verdad, solo hacerte sonreír noventa segundos y darte algo bonito para mandar al chat.

**Privacidad (texto honesto, ya publicado)**
> Tus respuestas y tus métricas se guardan solo en tu navegador (almacenamiento local). No hay cuentas, no hay correos, no hay servidores que reciban tus datos. Si borras los datos del navegador, se borra todo.

---

## 9. Textos de lanzamiento (primeros mensajes)

**Anuncio corto para el grupo de amigos / WhatsApp**
> Hice un test tonto y me salió un bicho. Ahora no puedo dejar de preguntarle a todo el mundo cuál le toca. Son 10 preguntas: [URL]

**Anuncio para X**
> Abrimos Tu Bicho Raro 🌀 10 preguntas, 12 criaturas, 0 registros. Descubre la tuya, descarga la tarjeta y reta a quien se atreva. [URL]

**Anuncio para Instagram (pie de publicación)**
> 10 preguntas. 12 criaturas. Una tarjeta para presumir. ¿Cuál te toca a ti? Guarda el resultado y etiquétame cuando lo hagas. Enlace en la bio.
