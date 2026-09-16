/* ============================================================
   Tu Bicho Raro — contenido del test
   Todo el texto visible del juego vive aquí. Para cambiar
   preguntas, opciones o bichos, edita solo este archivo.
   ============================================================ */
(function () {
  "use strict";

  var STATS = ["Caos", "Encanto", "Energía"];

  var BICHOS = [
    {
      id: "noctambulo",
      nombre: "El Noctámbulo",
      emoji: "🦉",
      gancho: "Tu mejor versión llega después de medianoche.",
      desc: "Funcionas con piloto automático hasta que cae el sol y entonces, por fin, despiertas. Las mejores ideas te llegan cuando el resto del mundo ya se rindió.",
      stats: { "Caos": 55, "Encanto": 68, "Energía": 42 },
      superpoder: "creatividad a las 3 a.m.",
      kriptonita: "alarmas antes del mediodía",
      color: "#6C5CE7",
      compartir: "Soy El Noctámbulo 🦉: mi cerebro arranca cuando el resto apaga la luz."
    },
    {
      id: "madrugador",
      nombre: "La Madrugadora",
      emoji: "🌅",
      gancho: "Para ti el día empieza cuando otros duermen.",
      desc: "Ya llevas tres cosas hechas antes de que el grupo de amigos despierte. Te sobra energía y, aunque nadie lo diga en voz alta, todos te envidian un poco a las 8 de la mañana.",
      stats: { "Caos": 28, "Encanto": 74, "Energía": 92 },
      superpoder: "ganarle horas al mundo",
      kriptonita: "trasnochar dos días seguidos",
      color: "#FFC145",
      compartir: "Soy La Madrugadora 🌅: a las 8 a.m. ya terminé medio día."
    },
    {
      id: "caotico",
      nombre: "El Caos Encantador",
      emoji: "🌀",
      gancho: "Tu vida es un remolino y aun así funciona.",
      desc: "Pierdes las llaves dos veces por semana y aun así llegas a todo. Improvisas tan bien que la gente cree que estaba planeado desde el principio.",
      stats: { "Caos": 96, "Encanto": 88, "Energía": 80 },
      superpoder: "improvisar bajo presión",
      kriptonita: "formularios y filas",
      color: "#FF6B35",
      compartir: "Soy El Caos Encantador 🌀: nada está bajo control y todo sale bien."
    },
    {
      id: "estratega",
      nombre: "La Mente Estratégica",
      emoji: "♟️",
      gancho: "Siempre vas tres jugadas adelante.",
      desc: "Mientras los demás debaten, tú ya evaluaste los escenarios. Ves el patrón escondido en las conversaciones y rara vez te sorprende un cambio de planes.",
      stats: { "Caos": 24, "Encanto": 70, "Energía": 62 },
      superpoder: "ver el patrón escondido",
      kriptonita: "planes sin explicación",
      color: "#457B9D",
      compartir: "Soy La Mente Estratégica ♟️: ya sabía cómo iba a terminar esto."
    },
    {
      id: "dramatico",
      nombre: "El Alma Dramática",
      emoji: "🎭",
      gancho: "Un martes cualquiera puede ser una escena memorable.",
      desc: "Cuentas una compra de supermercado como si fuera un final de temporada y la gente se queda escuchando. Sientes todo en mayúsculas y eso te hace inolvidable.",
      stats: { "Caos": 72, "Encanto": 95, "Energía": 70 },
      superpoder: "narrar cualquier anécdota",
      kriptonita: "los silencios incómodos",
      color: "#E84855",
      compartir: "Soy El Alma Dramática 🎭: incluso mi lista de compras tiene trama."
    },
    {
      id: "empatico",
      nombre: "La Empatía Andante",
      emoji: "🫂",
      gancho: "Sientes lo que pasa en la sala antes de que lo digan.",
      desc: "Detectas el cambio de humor de alguien a diez metros. Eres la persona a la que todos escriben a las 2 a.m., y aunque cansa a veces, es tu superpoder más querido.",
      stats: { "Caos": 30, "Encanto": 90, "Energía": 64 },
      superpoder: "leer el ambiente al instante",
      kriptonita: "decir que no",
      color: "#F15BB5",
      compartir: "Soy La Empatía Andante 🫂: puedo saber cómo estás antes de que hables."
    },
    {
      id: "aventurero",
      nombre: "El Aventurero",
      emoji: "🧭",
      gancho: "Si dice 'no sé adónde vamos', ya estás dentro.",
      desc: "La palabra 'espontáneo' te activa el modo héroe. Te acomodas rápido a cualquier lugar y sacas plan B, C y D sin dejar de sonreír.",
      stats: { "Caos": 78, "Encanto": 76, "Energía": 94 },
      superpoder: "aterrizar en cualquier lado",
      kriptonita: "planes que no cambian nunca",
      color: "#1B9C85",
      compartir: "Soy El Aventurero 🧭: dije 'vamos' antes de preguntar dónde."
    },
    {
      id: "hogareno",
      nombre: "El Hogareño Compulsivo",
      emoji: "🛋️",
      gancho: "Tu casa es un ecosistema perfecto y lo sabes.",
      desc: "Tienes la mantita, la taza correcta y la temperatura ideal. Nada compite con tu sofá un viernes por la noche y no piensas disculparte por eso.",
      stats: { "Caos": 22, "Encanto": 66, "Energía": 46 },
      superpoder: "crear confort de la nada",
      kriptonita: "eventos con 200 personas",
      color: "#B5838D",
      compartir: "Soy El Hogareño Compulsivo 🛋️: mi plan perfecto ya está en mi sofá."
    },
    {
      id: "ironico",
      nombre: "El Irónico de Guardia",
      emoji: "😏",
      gancho: "Dices lo que todos piensan, pero con mejor timing.",
      desc: "Tu comentario exacto en el momento exacto salva cualquier conversación. Usas el humor como escudo y como brújula, y la gente te recuerda por esa frase.",
      stats: { "Caos": 58, "Encanto": 82, "Energía": 56 },
      superpoder: "comentar la vida en directo",
      kriptonita: "charlas motivacionales",
      color: "#5C8001",
      compartir: "Soy El Irónico de Guardia 😏: mi comentario fue mejor que el momento."
    },
    {
      id: "perfeccionista",
      nombre: "La Perfeccionista",
      emoji: "📐",
      gancho: "Si no queda bien, no queda.",
      desc: "Revisas una vez, luego otra y todavía le encuentras algo. Tu estándar es alto y eso hace que todo lo que toca tu mano salga mejor de lo esperado.",
      stats: { "Caos": 34, "Encanto": 62, "Energía": 82 },
      superpoder: "detectar el detalle mínimo",
      kriptonita: "entregar algo a medias",
      color: "#2EC4B6",
      compartir: "Soy La Perfeccionista 📐: ya lo revisé tres veces y todavía no está."
    },
    {
      id: "libre",
      nombre: "El Espíritu Libre",
      emoji: "🎈",
      gancho: "Tu plan favorito es no tener plan.",
      desc: "No te dan miedo los cambios, te dan adrenalina. Encuentras magia en lo simple y arrastras a quien se deje a vivir algo que no estaba en la agenda.",
      stats: { "Caos": 90, "Encanto": 84, "Energía": 88 },
      superpoder: "encontrar magia en lo simple",
      kriptonita: "horarios rígidos",
      color: "#9C6644",
      compartir: "Soy El Espíritu Libre 🎈: mi agenda dice 'improvisar' otra vez."
    },
    {
      id: "tranquilo",
      nombre: "La Calma Andante",
      emoji: "🍃",
      gancho: "Tu superpoder es que nada te altera demasiado.",
      desc: "Se cae el mundo y tú respiras hondo. Bajas el volumen del caos ajeno sin esfuerzo y por eso todos quieren tenerte cerca en los días difíciles.",
      stats: { "Caos": 16, "Encanto": 72, "Energía": 52 },
      superpoder: "bajarle el volumen al caos",
      kriptonita: "gente que grita",
      color: "#A3B18A",
      compartir: "Soy La Calma Andante 🍃: se cayó el mundo y yo seguía con mi té."
    }
  ];

  var PREGUNTAS = [
    {
      id: "p1",
      texto: "Suena la alarma. ¿Qué pasa después?",
      opciones: [
        { texto: "La apago y negocio cinco minutos más de gloria", ids: ["noctambulo", "tranquilo"] },
        { texto: "Salto de la cama con una energía sospechosa", ids: ["madrugador", "aventurero"] },
        { texto: "Le echo la culpa al universo en voz alta", ids: ["dramatico", "ironico"] },
        { texto: "Ya estaba despierto con un plan en la cabeza", ids: ["estratega", "perfeccionista"] }
      ]
    },
    {
      id: "p2",
      texto: "Llegas a una fiesta donde no conoces a casi nadie.",
      opciones: [
        { texto: "Me hago amigo del perro de la casa", ids: ["tranquilo", "hogareno"] },
        { texto: "En diez minutos ya hablé con medio salón", ids: ["libre", "empatico"] },
        { texto: "Observo desde la cocina hasta entender el ambiente", ids: ["estratega", "ironico"] },
        { texto: "Encuentro a alguien y le cuento mi día con lujo de detalle", ids: ["dramatico", "madrugador"] }
      ]
    },
    {
      id: "p3",
      texto: "Tu plan se cancela a última hora.",
      opciones: [
        { texto: "Qué alivio, vuelvo a mi cueva", ids: ["hogareno", "tranquilo"] },
        { texto: "Perfecto, improviso algo mejor", ids: ["libre", "aventurero"] },
        { texto: "Mejor: por fin avanzo eso que tenía pendiente", ids: ["noctambulo", "perfeccionista"] },
        { texto: "Primero lo proceso y después decido", ids: ["empatico", "caotico"] }
      ]
    },
    {
      id: "p4",
      texto: "Eliges serie para ver tranquilamente.",
      opciones: [
        { texto: "Algo tan intenso que le grite a la pantalla", ids: ["dramatico", "caotico"] },
        { texto: "Comedia ligera, no quiero pensar hoy", ids: ["tranquilo", "ironico"] },
        { texto: "La que todo el mundo recomienda, por no quedar fuera", ids: ["empatico", "madrugador"] },
        { texto: "La abandono porque ya intuí el final", ids: ["perfeccionista", "estratega"] }
      ]
    },
    {
      id: "p5",
      texto: "¿Cómo está tu mesa de trabajo ahora mismo?",
      opciones: [
        { texto: "Caos creativo, pero sé dónde está cada cosa", ids: ["caotico", "libre"] },
        { texto: "Todo alineado y, si se puede, etiquetado", ids: ["perfeccionista", "estratega"] },
        { texto: "Un rincón cómodo con mantita y taza", ids: ["hogareno", "tranquilo"] },
        { texto: "Solo la uso de noche, y se nota", ids: ["dramatico", "noctambulo"] }
      ]
    },
    {
      id: "p6",
      texto: "Son las 2 a. m. ¿Qué estás haciendo?",
      opciones: [
        { texto: "Durmiendo como un tronco desde hace horas", ids: ["madrugador", "tranquilo"] },
        { texto: "Viendo un video que no tiene nada que ver con nada", ids: ["noctambulo", "caotico"] },
        { texto: "Planeando la próxima escapada y a quién llevaría", ids: ["aventurero", "empatico"] },
        { texto: "Terminando esa cosa que no podía dejar a medias", ids: ["perfeccionista", "hogareno"] }
      ]
    },
    {
      id: "p7",
      texto: "Tu grupo de amigos te describiría como...",
      opciones: [
        { texto: "Quien tiene las mejores historias", ids: ["dramatico", "aventurero"] },
        { texto: "Quien siempre tiene un dato útil", ids: ["estratega", "ironico"] },
        { texto: "La energía que mueve al grupo", ids: ["caotico", "libre"] },
        { texto: "Quien escucha a todos sin apurarse", ids: ["empatico", "madrugador"] }
      ]
    },
    {
      id: "p8",
      texto: "Te regalan un boleto de avión sorpresa. ¿Qué sientes?",
      opciones: [
        { texto: "Emoción total: ya estoy haciendo la maleta", ids: ["aventurero", "libre"] },
        { texto: "Ansiedad: necesito el itinerario completo", ids: ["perfeccionista", "hogareno"] },
        { texto: "Ganas de ir, pero ¿y si no conozco a nadie allá?", ids: ["empatico", "madrugador"] },
        { texto: "¿A qué hora sale? Seguro me entero tarde de todo", ids: ["noctambulo", "ironico"] }
      ]
    },
    {
      id: "p9",
      texto: "Karaoke. Todos te miran a ti.",
      opciones: [
        { texto: "Canto como si fuera el número final del show", ids: ["dramatico", "aventurero"] },
        { texto: "Lo hago bien o no lo hago", ids: ["perfeccionista", "estratega"] },
        { texto: "Pongo la canción y bailo por todo el lugar", ids: ["libre", "hogareno"] },
        { texto: "Me río desde el fondo del salón", ids: ["caotico", "ironico"] }
      ]
    },
    {
      id: "p10",
      texto: "Lunes por la mañana, todavía sin café.",
      opciones: [
        { texto: "Peligro público: mejor no me hablen todavía", ids: ["ironico", "dramatico"] },
        { texto: "Ya llevo dos cosas resueltas", ids: ["madrugador", "estratega"] },
        { texto: "Modo automático hasta el mediodía", ids: ["noctambulo", "tranquilo"] },
        { texto: "Música alta y a comerme el día", ids: ["caotico", "aventurero"] }
      ]
    }
  ];

  window.BICHO_DATA = {
    version: 1,
    stats: STATS,
    bichos: BICHOS,
    preguntas: PREGUNTAS,
    totalBichos: BICHOS.length,
    totalPreguntas: PREGUNTAS.length,
    segundosContrarreloj: 40,
    puntosPorRespuesta: 10,
    puntosPorSegundoSobrante: 2
  };
})();
