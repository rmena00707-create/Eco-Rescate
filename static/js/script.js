
document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const reducirMovimiento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // ==========================================
    // MODO CLARO Y OSCURO
    // ==========================================

    const modoBtn = $("#modoBtn");

    function actualizarTema() {
        if (!modoBtn) return;

        const claro = document.body.classList.contains("light-mode");

        modoBtn.innerHTML = claro
            ? '<i class="bi bi-moon-stars-fill"></i>'
            : '<i class="bi bi-sun-fill"></i>';

        modoBtn.setAttribute(
            "aria-label",
            claro ? "Activar modo oscuro" : "Activar modo claro"
        );
    }

    try {
        if (localStorage.getItem("ecoguardian-tema") === "claro") {
            document.body.classList.add("light-mode");
        }
    } catch (error) {
        console.warn("No se pudo recuperar el tema guardado.");
    }

    actualizarTema();

    if (modoBtn) {
        modoBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");

            try {
                localStorage.setItem(
                    "ecoguardian-tema",
                    document.body.classList.contains("light-mode")
                        ? "claro"
                        : "oscuro"
                );
            } catch (error) {
                console.warn("No se pudo guardar el tema.");
            }

            actualizarTema();
        });
    }

    // ==========================================
    // BARRA DE NAVEGACIÓN
    // ==========================================

    const navbar = $("#navbar");

    function actualizarNavbar() {
        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 30);
        }
    }

    window.addEventListener("scroll", actualizarNavbar, {
        passive: true
    });

    actualizarNavbar();

    $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            $$(".nav-link").forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            const menu = $("#menu");
            if (menu && menu.classList.contains("show") && window.bootstrap) {
                bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });

    // ==========================================
    // PARTÍCULAS ANIMADAS
    // ==========================================

    const canvas = $("#particleCanvas");
    let animacionCanvas = null;

    if (canvas) {
        const ctx = canvas.getContext("2d");

        let ancho = window.innerWidth;
        let alto = window.innerHeight;
        let particulas = [];

        function crearParticulas() {
            const cantidad = reducirMovimiento
                ? 0
                : Math.min(60, Math.floor(ancho / 22));

            particulas = Array.from({ length: cantidad }, () => ({
                x: Math.random() * ancho,
                y: Math.random() * alto,
                radio: Math.random() * 2 + 0.5,
                velocidad: Math.random() * 0.35 + 0.08,
                opacidad: Math.random() * 0.5 + 0.15,
                fase: Math.random() * Math.PI * 2
            }));
        }

        function ajustarCanvas() {
            ancho = window.innerWidth;
            alto = window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = ancho * dpr;
            canvas.height = alto * dpr;
            canvas.style.width = `${ancho}px`;
            canvas.style.height = `${alto}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            crearParticulas();
        }

        function dibujarParticulas() {
            ctx.clearRect(0, 0, ancho, alto);

            const colores = [
                [84, 232, 224],
                [169, 154, 255],
                [255, 157, 178],
                [255, 207, 121]
            ];

            particulas.forEach((p) => {
                p.y -= p.velocidad;
                p.fase += 0.015;
                p.x += Math.sin(p.fase) * 0.25;

                if (p.y < -5) {
                    p.y = alto + 5;
                    p.x = Math.random() * ancho;
                }

                const indiceColor = Math.min(
                    colores.length - 1,
                    Math.floor((p.x / Math.max(ancho, 1)) * colores.length)
                );

                const color = colores[indiceColor];

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
                ctx.fillStyle =
                    `rgba(${color.join(", ")}, ${p.opacidad})`;
                ctx.shadowColor = `rgb(${color.join(", ")})`;
                ctx.shadowBlur = 8;
                ctx.fill();
            });

            ctx.shadowBlur = 0;

            if (!reducirMovimiento && !document.hidden) {
                animacionCanvas = requestAnimationFrame(dibujarParticulas);
            }
        }

        ajustarCanvas();

        if (!reducirMovimiento) {
            dibujarParticulas();
        }

        window.addEventListener("resize", ajustarCanvas);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animacionCanvas);
            } else if (!reducirMovimiento) {
                cancelAnimationFrame(animacionCanvas);
                dibujarParticulas();
            }
        });
    }

    // ==========================================
    // NATURALEZA FLOTANTE
    // ==========================================

    const naturaleza = $("#floatingNature");
    const simbolos = ["✦", "✧", "❋", "❧", "✿", "·"];

    if (naturaleza && !reducirMovimiento) {
        const cantidad = window.innerWidth < 600 ? 10 : 24;

        for (let i = 0; i < cantidad; i++) {
            const elemento = document.createElement("span");

            elemento.className = "nature-particle";
            elemento.textContent =
                simbolos[Math.floor(Math.random() * simbolos.length)];

            elemento.style.left = `${Math.random() * 100}%`;
            elemento.style.fontSize = `${Math.random() * 18 + 8}px`;
            elemento.style.animationDuration =
                `${Math.random() * 18 + 16}s`;
            elemento.style.animationDelay =
                `${Math.random() * -30}s`;

            naturaleza.appendChild(elemento);
        }
    }

    // ==========================================
    // EFECTO 3D DE LAS TARJETAS
    // ==========================================

    const tarjetas = $$(".mission-card");
    const tieneRaton = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!reducirMovimiento && tieneRaton) {
        tarjetas.forEach((tarjeta) => {
            tarjeta.addEventListener("pointermove", (evento) => {
                const rect = tarjeta.getBoundingClientRect();

                const x = evento.clientX - rect.left;
                const y = evento.clientY - rect.top;

                const giroY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
                const giroX = (
                    (rect.height / 2 - y) / (rect.height / 2)
                ) * 5;

                tarjeta.style.setProperty("--rx", `${giroX}deg`);
                tarjeta.style.setProperty("--ry", `${giroY}deg`);
                tarjeta.style.setProperty("--mx", `${x}px`);
                tarjeta.style.setProperty("--my", `${y}px`);
            });

            tarjeta.addEventListener("pointerleave", () => {
                tarjeta.style.setProperty("--rx", "0deg");
                tarjeta.style.setProperty("--ry", "0deg");
                tarjeta.style.setProperty("--mx", "50%");
                tarjeta.style.setProperty("--my", "50%");
            });
        });
    }

    // ==========================================
    // ANIMACIÓN AL APARECER
    // ==========================================

    const elementosReveal = $$(".reveal");

    if (reducirMovimiento || !("IntersectionObserver" in window)) {
        elementosReveal.forEach((elemento) => {
            elemento.classList.add("visible");
        });
    } else {
        const observador = new IntersectionObserver(
            (entradas, observer) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visible");
                        observer.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        elementosReveal.forEach((elemento) => {
            observador.observe(elemento);
        });
    }

    // ==========================================
    // BANCO DE PREGUNTAS
    // 9 MISIONES CON 5 PREGUNTAS CADA UNA
    // ==========================================

    const preguntas = {
        reciclaje: [
            {
                p: "¿Qué significa reciclar?",
                o: [
                    "Quemar todos los residuos",
                    "Transformar residuos en nuevos materiales",
                    "Tirar todo al mismo contenedor",
                    "Enterrar toda la basura"
                ],
                c: 1
            },
            {
                p: "¿Cuál de estos objetos puede reciclarse?",
                o: [
                    "Una botella de vidrio",
                    "Un residuo tóxico sin tratar",
                    "Basura mezclada con productos químicos",
                    "Un objeto contaminado que requiere tratamiento especial"
                ],
                c: 0
            },
            {
                p: "¿Qué debemos hacer con un envase antes de reciclarlo?",
                o: [
                    "Quemarlo",
                    "Llenarlo de tierra",
                    "Vaciarlo y limpiarlo cuando sea necesario",
                    "Mezclarlo con residuos orgánicos"
                ],
                c: 2
            },
            {
                p: "¿Qué significan las tres R?",
                o: [
                    "Recoger, romper y retirar",
                    "Reducir, reutilizar y reciclar",
                    "Reparar, quemar y reciclar",
                    "Reutilizar, rechazar y revolver"
                ],
                c: 1
            },
            {
                p: "¿Dónde debemos depositar las pilas usadas?",
                o: [
                    "En el río",
                    "En un punto de recogida especializado",
                    "En el suelo",
                    "En cualquier contenedor"
                ],
                c: 1
            }
        ],

        agua: [
            {
                p: "¿Cómo puedes ahorrar agua al cepillarte?",
                o: [
                    "Dejar el grifo abierto",
                    "Cerrar el grifo mientras te cepillas",
                    "Usar agua todo el tiempo",
                    "Llenar recipientes sin necesitarlos"
                ],
                c: 1
            },
            {
                p: "¿Qué puede contaminar los ríos?",
                o: [
                    "Plantar árboles",
                    "Recoger basura",
                    "Arrojar residuos y productos químicos",
                    "Proteger sus orillas"
                ],
                c: 2
            },
            {
                p: "¿Por qué es importante cuidar el agua?",
                o: [
                    "Porque es esencial para la vida",
                    "Porque nunca se agota",
                    "Porque solo la utilizan las plantas",
                    "Porque no necesita protección"
                ],
                c: 0
            },
            {
                p: "¿Qué debemos hacer si encontramos una fuga de agua?",
                o: [
                    "Ignorarla",
                    "Abrir más el grifo",
                    "Repararla o informar para que la reparen",
                    "Dejar correr el agua"
                ],
                c: 2
            },
            {
                p: "¿Cómo se puede aprovechar el agua de lluvia?",
                o: [
                    "Usarla para regar cuando se recoge adecuadamente",
                    "Beberla sin tratamiento",
                    "Mezclarla con productos químicos",
                    "Arrojar residuos en ella"
                ],
                c: 0
            }
        ],

        energia: [
            {
                p: "¿Cuál es una fuente de energía renovable?",
                o: ["Carbón", "Petróleo", "Energía solar", "Gasolina"],
                c: 2
            },
            {
                p: "¿Qué debes hacer al salir de una habitación?",
                o: [
                    "Dejar todas las luces encendidas",
                    "Apagar las luces innecesarias",
                    "Encender más aparatos",
                    "Dejar el televisor encendido"
                ],
                c: 1
            },
            {
                p: "¿Qué ayuda a reducir el consumo eléctrico?",
                o: [
                    "Usar bombillas eficientes",
                    "Dejar los equipos encendidos",
                    "Abrir la nevera constantemente",
                    "Mantener las luces encendidas durante el día"
                ],
                c: 0
            },
            {
                p: "¿Qué aprovechan los paneles solares?",
                o: [
                    "El ruido",
                    "La energía del Sol",
                    "El humo de los vehículos",
                    "Los residuos plásticos directamente"
                ],
                c: 1
            },
            {
                p: "¿Qué hábito ayuda a ahorrar electricidad?",
                o: [
                    "Dejar equipos innecesarios encendidos",
                    "Encender todas las luces",
                    "Desconectar equipos que no se necesitan cuando sea apropiado",
                    "Abrir la nevera repetidamente"
                ],
                c: 2
            }
        ],

        naturaleza: [
            {
                p: "¿Qué es la biodiversidad?",
                o: [
                    "La variedad de seres vivos",
                    "La cantidad de edificios",
                    "El número de carreteras",
                    "La ausencia de animales"
                ],
                c: 0
            },
            {
                p: "¿Por qué son importantes los árboles?",
                o: [
                    "Porque contaminan el aire",
                    "Porque producen residuos tóxicos",
                    "Porque proporcionan hábitat y capturan carbono",
                    "Porque impiden toda forma de vida"
                ],
                c: 2
            },
            {
                p: "¿Cómo puedes proteger a los animales silvestres?",
                o: [
                    "Destruyendo sus hábitats",
                    "Respetando su entorno natural",
                    "Capturándolos por diversión",
                    "Contaminando los bosques"
                ],
                c: 1
            },
            {
                p: "¿Qué es la deforestación?",
                o: [
                    "La recuperación de un bosque",
                    "La eliminación de árboles y bosques",
                    "La protección de animales",
                    "La limpieza de una playa"
                ],
                c: 1
            },
            {
                p: "¿Qué hacer si encuentras un animal silvestre herido?",
                o: [
                    "Llevártelo como mascota",
                    "Alimentarlo con cualquier comida",
                    "Contactar con personal especializado",
                    "Asustarlo para que se vaya"
                ],
                c: 2
            }
        ],

        oceanos: [
            {
                p: "¿Qué amenaza a la vida marina?",
                o: [
                    "Las playas limpias",
                    "La protección de los arrecifes",
                    "La contaminación por plástico",
                    "La conservación de especies"
                ],
                c: 2
            },
            {
                p: "¿Qué puedes hacer para proteger los océanos?",
                o: [
                    "Arrojar basura al agua",
                    "Reducir los plásticos de un solo uso",
                    "Verter aceite por el desagüe",
                    "Dejar residuos en la playa"
                ],
                c: 1
            },
            {
                p: "¿Qué ecosistema marino sirve de refugio a muchas especies?",
                o: ["Los arrecifes de coral", "Los vertederos", "Las carreteras", "Las fábricas"],
                c: 0
            },
            {
                p: "¿Qué función cumplen los manglares?",
                o: [
                    "Sirven de hábitat y ayudan a proteger las costas",
                    "Aumentan siempre la contaminación",
                    "Eliminan toda la vida marina",
                    "Impiden que existan peces"
                ],
                c: 0
            },
            {
                p: "¿Qué debes hacer con la basura cuando visitas una playa?",
                o: [
                    "Enterrarla en la arena",
                    "Dejarla junto al agua",
                    "Lanzarla al mar",
                    "Recogerla y depositarla correctamente"
                ],
                c: 3
            }
        ],

        clima: [
            {
                p: "¿Qué contribuye al cambio climático actual?",
                o: [
                    "El uso excesivo de combustibles fósiles",
                    "La protección de los bosques",
                    "El ahorro de energía",
                    "La conservación de los ecosistemas"
                ],
                c: 0
            },
            {
                p: "¿Qué gas contribuye al calentamiento global?",
                o: ["Oxígeno", "Dióxido de carbono", "Helio", "Neón"],
                c: 1
            },
            {
                p: "¿Qué acción ayuda a reducir las emisiones?",
                o: [
                    "Quemar más combustibles",
                    "Talar todos los árboles",
                    "Utilizar transporte público cuando sea posible",
                    "Desperdiciar electricidad"
                ],
                c: 2
            },
            {
                p: "¿Cuál es una consecuencia del calentamiento global?",
                o: [
                    "La desaparición de todos los fenómenos meteorológicos",
                    "El aumento del nivel del mar",
                    "La eliminación de toda contaminación",
                    "El fin de las estaciones en todo el mundo"
                ],
                c: 1
            },
            {
                p: "¿Cómo ayudan los bosques frente al cambio climático?",
                o: [
                    "Producen todo el dióxido de carbono",
                    "Impiden que llueva",
                    "Almacenan carbono y ayudan a regular el clima",
                    "Aumentan necesariamente la temperatura"
                ],
                c: 2
            }
        ],

        transporte: [
            {
                p: "¿Qué transporte no produce emisiones durante su uso?",
                o: [
                    "Un automóvil de gasolina",
                    "Una motocicleta de gasolina",
                    "Una bicicleta convencional",
                    "Un autobús diésel"
                ],
                c: 2
            },
            {
                p: "¿Qué opción puede reducir las emisiones por pasajero?",
                o: [
                    "Viajar siempre solo en automóvil",
                    "Compartir vehículo o usar transporte público",
                    "Mantener el motor encendido sin necesidad",
                    "Realizar viajes innecesarios"
                ],
                c: 1
            },
            {
                p: "¿Qué beneficio tiene caminar en trayectos cortos?",
                o: [
                    "Reduce las emisiones del transporte",
                    "Aumenta el consumo de gasolina",
                    "Produce humo de escape",
                    "Contamina más que todos los vehículos"
                ],
                c: 0
            },
            {
                p: "¿Qué puede reducir los viajes individuales en automóvil?",
                o: [
                    "Compartir el vehículo",
                    "Realizar más viajes por separado",
                    "Dejar el motor encendido mientras se espera",
                    "Usar el automóvil para todo"
                ],
                c: 0
            },
            {
                p: "¿Qué debes revisar para que una bicicleta sea segura?",
                o: [
                    "Solo el color",
                    "Los frenos, las ruedas y las luces cuando correspondan",
                    "Únicamente la marca",
                    "Nada antes de usarla"
                ],
                c: 1
            }
        ],

        contaminacion: [
            {
                p: "¿Qué puede causar la contaminación del aire?",
                o: [
                    "Problemas respiratorios",
                    "Agua más limpia",
                    "Mayor biodiversidad automáticamente",
                    "La desaparición de todos los residuos"
                ],
                c: 0
            },
            {
                p: "¿Cómo puedes ayudar a reducir los residuos?",
                o: [
                    "Comprar productos innecesarios",
                    "Usar productos reutilizables",
                    "Arrojar basura a la calle",
                    "Quemar plástico en casa"
                ],
                c: 1
            },
            {
                p: "¿Qué debes hacer con el aceite usado?",
                o: [
                    "Verterlo en el río",
                    "Tirarlo al suelo",
                    "Gestionarlo mediante un sistema de recogida adecuado",
                    "Echarlo directamente al desagüe"
                ],
                c: 2
            },
            {
                p: "¿Qué puede provocar la contaminación del agua?",
                o: [
                    "La desaparición de todos los residuos",
                    "La purificación automática de los ríos",
                    "Daños a los ecosistemas y a la salud",
                    "El aumento garantizado de peces"
                ],
                c: 2
            },
            {
                p: "¿Qué ayuda a reducir la contaminación acústica?",
                o: [
                    "Tocar la bocina continuamente",
                    "Aumentar el volumen de los altavoces",
                    "Usar maquinaria ruidosa sin necesidad",
                    "Evitar ruidos innecesarios y controlar el volumen"
                ],
                c: 3
            }
        ],

        ambiente: [
            {
                p: "¿Cuál es una acción positiva para el planeta?",
                o: [
                    "Desperdiciar agua",
                    "Tirar residuos en la naturaleza",
                    "Reducir, reutilizar y reciclar",
                    "Destruir los bosques"
                ],
                c: 2
            },
            {
                p: "¿Qué debemos hacer al visitar un espacio natural?",
                o: [
                    "Dejar basura",
                    "Respetar la naturaleza y llevarnos nuestros residuos",
                    "Arrancar todas las plantas",
                    "Molestar a los animales"
                ],
                c: 1
            },
            {
                p: "¿Quién puede contribuir a cuidar el medio ambiente?",
                o: [
                    "Solamente los científicos",
                    "Solamente los gobiernos",
                    "Todas las personas mediante sus acciones",
                    "Nadie puede hacer nada"
                ],
                c: 2
            },
            {
                p: "¿Qué significa consumir responsablemente?",
                o: [
                    "Comprar todo lo que vemos",
                    "Elegir productos considerando su necesidad e impacto",
                    "Desechar objetos que todavía sirven",
                    "Utilizar recursos sin límites"
                ],
                c: 1
            },
            {
                p: "¿Cuál es una buena práctica al plantar árboles?",
                o: [
                    "Elegir especies adecuadas para el lugar",
                    "Plantar especies invasoras en cualquier ecosistema",
                    "Eliminar toda la vegetación existente",
                    "Ignorar las necesidades de agua y espacio"
                ],
                c: 0
            }
        ]
    };

    // ==========================================
    // SISTEMA DE CUESTIONARIOS
    // ==========================================

    const quizPanel = $("#quizPanel");
    const quizTitle = $("#quizTitle");
    const questionText = $("#questionText");
    const answerOptions = $("#answerOptions");
    const questionCount = $("#questionCount");
    const quizScore = $("#quizScore");
    const quizProgressBar = $("#quizProgressBar");
    const quizFeedback = $("#quizFeedback");
    const quizStreak = $("#quizStreak");
    const nextQuestion = $("#nextQuestion");
    const quizResult = $("#quizResult");
    const closeQuiz = $("#closeQuiz");

    let preguntasActuales = [];
    let indicePregunta = 0;
    let puntuacion = 0;
    let racha = 0;
    let respondida = false;
    let categoriaActual = "";

    function mezclar(lista) {
        const copia = [...lista];

        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }

        return copia;
    }

    function comenzarQuiz(categoria) {
        if (!preguntas[categoria] || !quizPanel) {
            console.error("No existe el cuestionario:", categoria);
            return;
        }

        categoriaActual = categoria;
        preguntasActuales = mezclar(preguntas[categoria]);

        indicePregunta = 0;
        puntuacion = 0;
        racha = 0;
        respondida = false;

        const nombre = categoria.charAt(0).toUpperCase() + categoria.slice(1);

        quizTitle.textContent = `Misión: ${nombre}`;

        questionText.hidden = false;
        answerOptions.hidden = false;
        quizFeedback.hidden = false;
        nextQuestion.hidden = false;
        quizResult.hidden = true;

        quizPanel.hidden = false;

        quizPanel.scrollIntoView({
            behavior: reducirMovimiento ? "auto" : "smooth",
            block: "start"
        });

        mostrarPregunta();
    }

    function mostrarPregunta() {
        const pregunta = preguntasActuales[indicePregunta];

        respondida = false;

        questionText.hidden = false;
        answerOptions.hidden = false;
        quizFeedback.hidden = false;
        nextQuestion.hidden = false;

        questionText.textContent = pregunta.p;

        questionCount.textContent =
            `Pregunta ${indicePregunta + 1} de ${preguntasActuales.length}`;

        quizScore.textContent = puntuacion;

        quizProgressBar.style.width =
            `${(indicePregunta / preguntasActuales.length) * 100}%`;

        quizFeedback.textContent = "";
        quizStreak.textContent = racha > 1
            ? `¡Racha de ${racha} respuestas correctas!`
            : "¡Demuestra lo que sabes!";

        nextQuestion.disabled = true;

        nextQuestion.innerHTML =
            indicePregunta === preguntasActuales.length - 1
                ? 'Ver resultados <i class="bi bi-trophy"></i>'
                : 'Siguiente <i class="bi bi-arrow-right"></i>';

        answerOptions.replaceChildren();

        mezclar(
            pregunta.o.map((opcion, indice) => ({
                texto: opcion,
                esCorrecta: indice === pregunta.c
            }))
        ).forEach((opcion) => {
            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "answer-option";
            boton.textContent = opcion.texto;

            boton.addEventListener("click", () => {
                responder(opcion.esCorrecta, boton);
            });

            answerOptions.appendChild(boton);
        });
    }

    function responder(esCorrecta, botonElegido) {
        if (respondida) return;

        respondida = true;

        const botones = answerOptions.querySelectorAll("button");

        botones.forEach((boton) => {
            boton.disabled = true;

            if (preguntasActuales[indicePregunta].o[
                preguntasActuales[indicePregunta].c
            ] === boton.textContent) {
                boton.classList.add("correct");
            }
        });

        if (esCorrecta) {
            puntuacion += 10;
            racha++;

            botonElegido.classList.add("correct");
            quizFeedback.textContent = "¡Correcto! Excelente trabajo.";
        } else {
            racha = 0;
            botonElegido.classList.add("incorrect");

            const correcta =
                preguntasActuales[indicePregunta].o[
                    preguntasActuales[indicePregunta].c
                ];

            quizFeedback.textContent = `Respuesta correcta: ${correcta}.`;
        }

        quizScore.textContent = puntuacion;
        nextQuestion.disabled = false;
    }

    function mostrarResultados() {
        questionText.hidden = true;
        answerOptions.hidden = true;
        quizFeedback.hidden = true;
        nextQuestion.hidden = true;

        quizProgressBar.style.width = "100%";
        questionCount.textContent = "Misión completada";

        const total = preguntasActuales.length * 10;
        const porcentaje = Math.round((puntuacion / total) * 100);

        let titulo = "¡Buen comienzo!";
        let mensaje = "Sigue aprendiendo y cuidando nuestro planeta.";

        if (porcentaje >= 80) {
            titulo = "¡Guardián extraordinario!";
            mensaje = "Has demostrado grandes conocimientos ambientales.";
        } else if (porcentaje >= 60) {
            titulo = "¡Vas por buen camino!";
            mensaje = "Continúa practicando para convertirte en experto.";
        }

        quizResult.replaceChildren();
        quizResult.hidden = false;

        const icono = document.createElement("div");
        icono.className = "result-icon";
        icono.innerHTML = '<i class="bi bi-trophy-fill"></i>';

        const encabezado = document.createElement("h3");
        encabezado.textContent = titulo;

        const descripcion = document.createElement("p");
        descripcion.textContent = mensaje;

        const resultado = document.createElement("p");
        resultado.append(
            "Resultado: ",
            `${puntuacion} de ${total} puntos (${porcentaje}%).`
        );

        const repetir = document.createElement("button");
        repetir.type = "button";
        repetir.className = "btn-primary-custom";
        repetir.innerHTML =
            '<i class="bi bi-arrow-repeat"></i> Intentar de nuevo';

        repetir.addEventListener("click", () => {
            comenzarQuiz(categoriaActual);
        });

        quizResult.append(icono, encabezado, descripcion, resultado, repetir);
    }

    $$(".start-quiz").forEach((boton) => {
        boton.addEventListener("click", () => {
            comenzarQuiz(boton.dataset.quiz);
        });
    });

    if (nextQuestion) {
        nextQuestion.addEventListener("click", () => {
            if (!respondida) return;

            if (indicePregunta < preguntasActuales.length - 1) {
                indicePregunta++;
                mostrarPregunta();
            } else {
                mostrarResultados();
            }
        });
    }

    if (closeQuiz) {
        closeQuiz.addEventListener("click", () => {
            quizPanel.hidden = true;
        });
    }

    // ==========================================
    // BOTÓN PARA VOLVER ARRIBA
    // ==========================================

    const arribaBtn = $("#arribaBtn");

    if (arribaBtn) {
        arribaBtn.addEventListener("click", (evento) => {
            evento.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: reducirMovimiento ? "auto" : "smooth"
            });
        });
    }

    // ==========================================
    // CURSOR PERSONALIZADO PARA COMPUTADORAS
    // ==========================================

    if (tieneRaton && !reducirMovimiento) {
        const halo = document.createElement("div");
        halo.className = "cursor-halo";
        document.body.appendChild(halo);

        let ultimoEfecto = 0;

        document.addEventListener("mousemove", (evento) => {
            halo.style.left = `${evento.clientX}px`;
            halo.style.top = `${evento.clientY}px`;

            const ahora = performance.now();

            if (ahora - ultimoEfecto > 60) {
                ultimoEfecto = ahora;

                const particula = document.createElement("div");
                particula.className = "cursor-particula";
                particula.style.left = `${evento.clientX}px`;
                particula.style.top = `${evento.clientY}px`;

                document.body.appendChild(particula);

                particula.addEventListener("animationend", () => {
                    particula.remove();
                });
            }
        });

        document.addEventListener("mousedown", (evento) => {
            halo.classList.add("cursor-activo");

            const onda = document.createElement("div");
            onda.className = "onda-cursor";
            onda.style.left = `${evento.clientX}px`;
            onda.style.top = `${evento.clientY}px`;

            document.body.appendChild(onda);

            onda.addEventListener("animationend", () => {
                onda.remove();
            });
        });

        document.addEventListener("mouseup", () => {
            halo.classList.remove("cursor-activo");
        });

        document.addEventListener("mouseleave", () => {
            halo.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            halo.style.opacity = "1";
        });
    }
});
