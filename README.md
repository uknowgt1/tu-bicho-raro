# Tu Bicho Raro

Sitio web de entretenimiento: un test de personalidad juguetón que convierte 10 respuestas
cotidianas en una de **12 criaturas**, con tarjeta de resultado compartible, modo contrarreloj,
colección de bichos y panel de uso local.

## Enlaces en vivo

- **Repositorio:** https://github.com/uknowgt1/tu-bicho-raro
- **Publicado con GitHub Pages:** https://uknowgt1.github.io/tu-bicho-raro/
- **Publicado en el hosting de AutoClaw:** https://fnipfhng.autoclawai.space/

No usa dependencias, ni frameworks, ni servicios externos: son archivos estáticos que funcionan
tal cual. Todo el juego corre en el navegador de quien visita el sitio.

---

## Contenido del repositorio

```
index.html                  Página única con todas las vistas
assets/css/style.css        Hoja de estilo única (colores, tipografía, animaciones)
assets/js/data.js           TODO el contenido editable: preguntas, opciones y bichos
assets/js/app.js            Toda la lógica: test, tarjeta, ciclo viral, contrarreloj, colección, panel
assets/img/og.png           Imagen de vista previa para redes (1200×630)
assets/img/favicon.svg      Icono
docs/                       Documentación de entrega (traspaso, verificación, textos de lanzamiento)
```

## Cómo verlo en local

Solo necesitas Python (o cualquier servidor estático):

```
cd tu-bicho-raro
python -m http.server 8777
```

Y abrir `http://127.0.0.1:8777/`.

> Abrir `index.html` con doble clic también funciona, pero las funciones de compartir y
> portapapeles se comportan mejor servidas por HTTP.

## Cómo cambiar el contenido

Casi todo el texto del juego vive en **`assets/js/data.js`**:

- **Preguntas y opciones** → array `PREGUNTAS`. Cada opción lleva `ids`, la lista de bichos a los
  que suma un punto.
- **Bichos** → array `BICHOS`. Campos: `id`, `nombre`, `emoji`, `gancho`, `desc`, `stats`,
  `superpoder`, `kriptonita`, `color` y `compartir`.
- **Duración y puntaje del contrarreloj** → `segundosContrarreloj`, `puntosPorRespuesta`,
  `puntosPorSegundoPorsobrante`.

⚠️ **Regla de oro:** cada bicho debe aparecer en **6 o 7 preguntas distintas**. Si uno aparece en
muchas, ganará casi siempre y el test pierde gracia; si aparece en muy pocas, casi nadie lo verá.

**Colores y aire visual** → `assets/css/style.css`, bloque `:root`.
**Textos de portada y secciones** → `index.html`.

## Cómo funciona la mecánica viral

El resultado viaja codificado en la URL (`?r=…`, unos 20 caracteres). Quien abre ese enlace ve el
bicho de otra persona —etiquetado como ajeno— y un botón para hacer su propio test, que genera un
enlace nuevo. El ciclo se repite sin servidor ni base de datos.

## Accesibilidad

Contraste verificado según WCAG AA, foco visible, navegación completa por teclado, textos
alternativos, y todas las animaciones se desactivan con `prefers-reduced-motion`.

## Qué NO hace (límites conocidos)

- **No hay métricas agregadas.** Sin servidor, el panel mide solo el dispositivo de cada visitante.
- **La vista previa al compartir es fija.** Las plataformas sociales no ejecutan JavaScript, así que
  la tarjeta que se ve al pegar el enlace es siempre la misma.
- **Los datos locales se pueden perder**: modo privado, borrado del navegador o la política de
  almacenamiento de Safari.

Detalles y vías de solución en [`docs/Traspaso_Tu_Bicho_Raro.md`](docs/Traspaso_Tu_Bicho_Raro.md).
