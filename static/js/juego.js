
"use strict";

/* ==========================================
   ECORESCATE - MOTOR DEL JUEGO
========================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const $ = (id) => document.getElementById(id);

const scoreElement = $("score");
const recordElement = $("record");
const levelElement = $("level");
const livesElement = $("lives");
const missionTitle = $("missionTitle");
const missionText = $("missionText");
const progressText = $("progressText");
const progressBar = $("progressBar");
const levelName = $("levelName");
const gameStatus = $("gameStatus");

const overlay = $("gameOverlay");
const overlayIcon = $("overlayIcon");
const overlayTitle = $("overlayTitle");
const overlayText = $("overlayText");
const startButton = $("startButton");
const soundButton = $("soundButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE = 32;

const LEVELS = [
    {
        name: "BOSQUE",
        title: "Bosque verde",
        description: "Recoge 8 residuos y protege el bosque.",
        target: 8,
        points: 10,
        background: "#367b45",
        ground: "#459552",
        accent: "#8acb65",
        obstacle: "#235b36",
        enemyCount: 2
    },
    {
        name: "RÍO",
        title: "Río limpio",
        description: "Recoge 10 residuos y evita a los guardianes contaminantes.",
        target: 10,
        points: 15,
        background: "#267a78",
        ground: "#318e82",
        accent: "#74c9a3",
        obstacle: "#175d66",
        enemyCount: 3
    },
    {
        name: "PLAYA",
        title: "Playa sin plástico",
        description: "Recoge 12 residuos y salva la costa.",
        target: 12,
        points: 20,
        background: "#c7a65f",
        ground: "#ddc477",
        accent: "#f0e3a0",
        obstacle: "#a78343",
        enemyCount: 4
    }
];

const TRASH_TYPES = [
    { emoji: "🧴", name: "Botella" },
    { emoji: "🥫", name: "Lata" },
    { emoji: "🗑️", name: "Residuo" },
    { emoji: "♻️", name: "Reciclable" }
];

let levelIndex = 0;
let score = 0;
let lives = 3;
let collected = 0;
let record = readRecord();

let player = null;
let trash = [];
let enemies = [];
let obstacles = [];

let running = false;
let gameOver = false;
let levelTransition = false;
let invulnerable = 0;
let lastFrame = 0;
let animationId = null;
let soundEnabled = false;
let audioContext = null;
let movementCooldown = 0;

const keys = new Set();

const playerStart = {
    x: 64,
    y: 64,
    size: 23,
    speed: 155
};

/* ==========================================
   RÉCORD LOCAL
========================================== */

function readRecord() {
    try {
        return Math.max(
            0,
            Number(localStorage.getItem("ecorescate-record")) || 0
        );
    } catch (error) {
        return 0;
    }
}

function saveRecord() {
    try {
        localStorage.setItem("ecorescate-record", String(record));
    } catch (error) {
        console.warn("No se pudo guardar el récord local.");
    }
}

recordElement.textContent = record;

/* ==========================================
   UTILIDADES
========================================== */

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(a, b) {
    const ax = a.x + a.size / 2;
    const ay = a.y + a.size / 2;
    const bx = b.x + b.size / 2;
    const by = b.y + b.size / 2;

    return Math.hypot(ax - bx, ay - by);
}

function collides(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

function randomPosition(size = 22) {
    for (let attempt = 0; attempt < 150; attempt++) {
        const position = {
            x: random(45, WIDTH - 45),
            y: random(45, HEIGHT - 45),
            size
        };

        const blocked = obstacles.some(
            (obstacle) => collides(position, obstacle)
        );

        const nearPlayer = player &&
            distance(position, player) < 65;

        if (!blocked && !nearPlayer) {
            return position;
        }
    }

    return { x: WIDTH - 55, y: HEIGHT - 55, size };
}

/* ==========================================
   PREPARAR NIVEL
========================================== */

function createObstacles() {
    obstacles = [];

    const count = 9 + levelIndex * 3;

    for (let i = 0; i < count; i++) {
        const obstacle = randomPosition(32);

        if (
            distance(obstacle, player) > 80 &&
            !obstacles.some(
                (existing) => distance(existing, obstacle) < 48
            )
        ) {
            obstacles.push(obstacle);
        }
    }
}

function createTrash() {
    trash = [];

    const target = LEVELS[levelIndex].target;

    for (let i = 0; i < target; i++) {
        const position = randomPosition(23);

        trash.push({
            ...position,
            type: TRASH_TYPES[
                Math.floor(Math.random() * TRASH_TYPES.length)
            ],
            collected: false,
            bob: random(0, Math.PI * 2)
        });
    }
}

function createEnemies() {
    enemies = [];

    for (let i = 0; i < LEVELS[levelIndex].enemyCount; i++) {
        const position = randomPosition(24);

        enemies.push({
            ...position,
            vx: Math.random() < 0.5 ? 1 : -1,
            vy: Math.random() < 0.5 ? 1 : -1,
            speed: 48 + levelIndex * 16,
            color: ["#a34b35", "#b23e55", "#713e7d"][levelIndex],
            phase: random(0, 6)
        });
    }
}

function prepareLevel() {
    const level = LEVELS[levelIndex];

    player = {
        ...playerStart,
        x: 48,
        y: 48
    };

    collected = 0;
    invulnerable = 0;
    movementCooldown = 0;

    createObstacles();
    createTrash();
    createEnemies();

    missionTitle.textContent = level.title;
    missionText.textContent = level.description;
    levelName.textContent = level.name;
    levelElement.textContent = `${levelIndex + 1} / ${LEVELS.length}`;

    updateProgress();
    draw();
}

function updateProgress() {
    const target = LEVELS[levelIndex].target;
    const percent = Math.min(100, collected / target * 100);

    progressText.textContent = `${collected} / ${target}`;
    progressBar.style.width = `${percent}%`;

    scoreElement.textContent = score;
    recordElement.textContent = record;
    livesElement.textContent = "♥ ".repeat(lives).trim() || "0";
}

/* ==========================================
   DIBUJO PIXEL ART
========================================== */

function pixelRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        Math.round(x),
        Math.round(y),
        Math.round(width),
        Math.round(height)
    );
}

function drawBackground() {
    const level = LEVELS[levelIndex];

    pixelRect(0, 0, WIDTH, HEIGHT, level.background);

    for (let y = 0; y < HEIGHT; y += TILE) {
        for (let x = 0; x < WIDTH; x += TILE) {
            const variation = (x / TILE + y / TILE) % 2 === 0;

            pixelRect(
                x,
                y,
                TILE,
                TILE,
                variation ? level.ground : level.background
            );

            if (variation) {
                pixelRect(
                    x + 6,
                    y + 8,
                    4,
                    4,
                    level.accent
                );
            }
        }
    }

    if (levelIndex === 1) {
        // Agua decorativa en la parte superior e inferior.
        for (let x = 0; x < WIDTH; x += 48) {
            pixelRect(x, 5, 23, 3, "#a2e9db");
            pixelRect(x + 15, HEIGHT - 10, 20, 3, "#a2e9db");
        }
    }

    if (levelIndex === 2) {
        // Huellas de arena.
        for (let x = 18; x < WIDTH; x += 73) {
            pixelRect(x, 100 + (x % 3) * 30, 8, 4, "#f3dfa0");
        }
    }

    // Decoración ambiental.
    for (let i = 0; i < 10; i++) {
        const x = (i * 71 + 13) % WIDTH;
        const y = (i * 53 + 19) % HEIGHT;

        if (
            obstacles.some(
                (obstacle) =>
                    x > obstacle.x - 12 &&
                    x < obstacle.x + obstacle.size + 12 &&
                    y > obstacle.y - 12 &&
                    y < obstacle.y + obstacle.size + 12
            )
        ) {
            continue;
        }

        if (levelIndex === 0) {
            pixelRect(x, y, 5, 5, "#b2df78");
        } else if (levelIndex === 1) {
            pixelRect(x, y, 9, 2, "#a2e9db");
        } else {
            pixelRect(x, y, 5, 3, "#fff0bd");
        }
    }
}

function drawObstacle(obstacle) {
    const size = obstacle.size;
    const color = LEVELS[levelIndex].obstacle;

    if (levelIndex === 0) {
        // Árboles cuadrados.
        pixelRect(obstacle.x + 5, obstacle.y + 18, 22, 13, "#795438");
        pixelRect(obstacle.x, obstacle.y + 2, size, 21, "#174a2a");
        pixelRect(obstacle.x + 5, obstacle.y - 4, 22, 20, "#28693a");
        pixelRect(obstacle.x + 10, obstacle.y, 8, 6, "#4e9d4e");
    } else if (levelIndex === 1) {
        // Rocas de río.
        pixelRect(obstacle.x + 2, obstacle.y + 8, size - 4, 20, "#174e54");
        pixelRect(obstacle.x + 5, obstacle.y + 3, size - 10, 21, color);
        pixelRect(obstacle.x + 8, obstacle.y + 7, 8, 3, "#79b6a0");
    } else {
        // Rocas y conchas de la playa.
        pixelRect(obstacle.x + 4, obstacle.y + 9, 24, 20, "#967440");
        pixelRect(obstacle.x + 7, obstacle.y + 5, 18, 19, color);
        pixelRect(obstacle.x + 10, obstacle.y + 8, 6, 3, "#eddb9b");
    }
}

function drawTrash(item, time) {
    if (item.collected) return;

    const bob = Math.sin(time / 250 + item.bob) * 2;
    const x = Math.round(item.x);
    const y = Math.round(item.y + bob);

    // Sombra y base del objeto.
    pixelRect(x + 3, y + 19, 17, 4, "#10281b");

    if (item.type.name === "Botella") {
        pixelRect(x + 8, y + 1, 7, 4, "#a8f5db");
        pixelRect(x + 6, y + 5, 11, 15, "#54c9bd");
        pixelRect(x + 9, y + 7, 3, 8, "#b0fff0");
    } else if (item.type.name === "Lata") {
        pixelRect(x + 4, y + 4, 16, 15, "#d4dce1");
        pixelRect(x + 4, y + 4, 16, 4, "#f8f8f8");
        pixelRect(x + 4, y + 14, 16, 4, "#7e98a2");
        pixelRect(x + 9, y + 8, 6, 4, "#4cbb83");
    } else if (item.type.name === "Residuo") {
        pixelRect(x + 5, y + 7, 15, 13, "#e4a75b");
        pixelRect(x + 7, y + 3, 11, 5, "#eac27a");
        pixelRect(x + 8, y + 10, 3, 3, "#7e4d27");
    } else {
        // Símbolo de reciclaje en bloques.
        pixelRect(x + 8, y + 2, 7, 4, "#b9ff7b");
        pixelRect(x + 14, y + 5, 6, 5, "#b9ff7b");
        pixelRect(x + 4, y + 8, 8, 5, "#b9ff7b");
        pixelRect(x + 9, y + 13, 8, 5, "#b9ff7b");
        pixelRect(x + 3, y + 14, 5, 4, "#b9ff7b");
    }
}

function drawPlayer(time) {
    if (!player) return;

    // Parpadeo durante la invulnerabilidad.
    if (
        invulnerable > 0 &&
        Math.floor(time / 100) % 2 === 0
    ) {
        return;
    }

    const x = Math.round(player.x);
    const y = Math.round(player.y);

    // Sombra.
    pixelRect(x + 2, y + 20, 22, 5, "#143a27");

    // Mochila.
    pixelRect(x + 1, y + 8, 7, 12, "#a15f32");
    pixelRect(x + 3, y + 10, 4, 7, "#d58c45");

    // Cuerpo y brazos.
    pixelRect(x + 7, y + 10, 12, 12, "#f0f0d2");
    pixelRect(x + 4, y + 12, 5, 8, "#d6e9c4");
    pixelRect(x + 17, y + 12, 5, 8, "#d6e9c4");

    // Cabeza.
    pixelRect(x + 7, y + 2, 13, 10, "#e8b58b");
    pixelRect(x + 5, y, 17, 5, "#3d2921");
    pixelRect(x + 8, y - 2, 11, 4, "#523628");

    // Ojos.
    pixelRect(x + 10, y + 6, 2, 3, "#17251b");
    pixelRect(x + 16, y + 6, 2, 3, "#17251b");

    // Pantalón y botas.
    pixelRect(x + 8, y + 20, 5, 4, "#3659a4");
    pixelRect(x + 15, y + 20, 5, 4, "#3659a4");
    pixelRect(x + 6, y + 23, 7, 3, "#4b382a");
    pixelRect(x + 15, y + 23, 7, 3, "#4b382a");

    // Emblema ecológico.
    pixelRect(x + 11, y + 12, 5, 5, "#70f29b");
    pixelRect(x + 12, y + 11, 3, 6, "#256a43");
}

function drawEnemy(enemy, time) {
    const x = Math.round(enemy.x);
    const y = Math.round(enemy.y);
    const bounce = Math.sin(time / 140 + enemy.phase) * 1.5;

    pixelRect(x + 2, y + 22, 22, 4, "#18251e");
    pixelRect(x + 2, y + 6 + bounce, 21, 15, enemy.color);
    pixelRect(x + 5, y + 1 + bounce, 15, 11, enemy.color);

    // Ojos.
    pixelRect(x + 5, y + 7 + bounce, 5, 5, "#ffffff");
    pixelRect(x + 15, y + 7 + bounce, 5, 5, "#ffffff");
    pixelRect(x + 7, y + 9 + bounce, 3, 3, "#171717");
    pixelRect(x + 17, y + 9 + bounce, 3, 3, "#171717");

    // Boca.
    pixelRect(x + 9, y + 16 + bounce, 8, 3, "#291e2b");
}

function draw(time = 0) {
    if (!ctx) return;

    drawBackground();

    obstacles.forEach(drawObstacle);

    trash.forEach((item) => drawTrash(item, time));
    enemies.forEach((enemy) => drawEnemy(enemy, time));

    drawPlayer(time);

    // Instrucción pequeña dentro del escenario.
    ctx.font = "10px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
        "ECORESCATE  //  NIVEL " + (levelIndex + 1),
        12,
        HEIGHT - 12
    );
}

/* ==========================================
   MOVIMIENTO Y COLISIONES
========================================== */

function canMoveTo(nextX, nextY) {
    const next = {
        x: nextX,
        y: nextY,
        size: player.size
    };

    if (
        nextX < 0 ||
        nextY < 0 ||
        nextX + player.size > WIDTH ||
        nextY + player.size > HEIGHT
    ) {
        return false;
    }

    return !obstacles.some((obstacle) => collides(next, obstacle));
}

function movePlayer(delta) {
    if (!running || !player) return;

    let dx = 0;
    let dy = 0;

    if (keys.has("arrowleft") || keys.has("a")) dx--;
    if (keys.has("arrowright") || keys.has("d")) dx++;
    if (keys.has("arrowup") || keys.has("w")) dy--;
    if (keys.has("arrowdown") || keys.has("s")) dy++;

    if (dx === 0 && dy === 0) return;

    // Evita moverse más rápido en diagonal.
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;

    const distanceToMove = player.speed * delta;
    const nextX = player.x + dx * distanceToMove;
    const nextY = player.y + dy * distanceToMove;

    if (canMoveTo(nextX, player.y)) {
        player.x = nextX;
    }

    if (canMoveTo(player.x, nextY)) {
        player.y = nextY;
    }
}

function moveEnemies(delta) {
    enemies.forEach((enemy) => {
        let nextX = enemy.x + enemy.vx * enemy.speed * delta;
        let nextY = enemy.y + enemy.vy * enemy.speed * delta;

        if (
            nextX < 0 ||
            nextX + enemy.size > WIDTH ||
            obstacles.some((obstacle) =>
                collides(
                    { x: nextX, y: enemy.y, size: enemy.size },
                    obstacle
                )
            )
        ) {
            enemy.vx *= -1;
            nextX = enemy.x;
        }

        if (
            nextY < 0 ||
            nextY + enemy.size > HEIGHT ||
            obstacles.some((obstacle) =>
                collides(
                    { x: enemy.x, y: nextY, size: enemy.size },
                    obstacle
                )
            )
        ) {
            enemy.vy *= -1;
            nextY = enemy.y;
        }

        enemy.x = nextX;
        enemy.y = nextY;
    });
}

/* ==========================================
   PUNTUACIÓN Y MISIONES
========================================== */

function playSound(frequency = 600, duration = 0.08) {
    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        if (!audioContext) {
            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.035;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn("El sonido no está disponible.");
    }
}

function collectTrash() {
    for (const item of trash) {
        if (item.collected || !collides(player, item)) continue;

        item.collected = true;
        collected++;

        score += LEVELS[levelIndex].points;

        if (score > record) {
            record = score;
            saveRecord();
        }

        updateProgress();
        playSound(720 + collected * 20, 0.07);

        gameStatus.textContent = "¡RESIDUO RECICLADO! +"
            + LEVELS[levelIndex].points;

        if (collected >= LEVELS[levelIndex].target) {
            completeLevel();
        }

        break;
    }
}

function hitEnemy() {
    if (invulnerable > 0 || !running) return;

    for (const enemy of enemies) {
        if (!collides(player, enemy)) continue;

        lives--;
        invulnerable = 1.5;

        // Retroceso al recibir daño.
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const angle = Math.atan2(dy, dx);

        const knockbackX = player.x + Math.cos(angle) * 36;
        const knockbackY = player.y + Math.sin(angle) * 36;

        if (canMoveTo(knockbackX, player.y)) {
            player.x = knockbackX;
        }

        if (canMoveTo(player.x, knockbackY)) {
            player.y = knockbackY;
        }

        updateProgress();
        playSound(150, 0.2);

        gameStatus.textContent = "¡CUIDADO! HAS PERDIDO UNA VIDA";

        if (lives <= 0) {
            endGame(false);
        }

        break;
    }
}

function completeLevel() {
    if (!running) return;

    running = false;
    levelTransition = true;

    cancelAnimationFrame(animationId);

    if (levelIndex >= LEVELS.length - 1) {
        endGame(true);
        return;
    }

    score += 50 * (levelIndex + 1);

    if (score > record) {
        record = score;
        saveRecord();
    }

    updateProgress();

    overlayIcon.textContent = "🌟";
    overlayTitle.textContent = "¡Misión completada!";
    overlayText.textContent =
        "Has limpiado " + LEVELS[levelIndex].title +
        ". Recibes una bonificación y el siguiente nivel será más difícil.";

    startButton.textContent = "▶ Siguiente nivel";
    overlay.classList.remove("hidden");

    gameStatus.textContent = "NIVEL COMPLETADO";
    playSound(900, 0.18);
}

function endGame(victory) {
    running = false;
    gameOver = true;
    levelTransition = false;

    cancelAnimationFrame(animationId);

    if (score > record) {
        record = score;
        saveRecord();
    }

    updateProgress();

    overlayIcon.textContent = victory ? "🏆" : "🌎";

    overlayTitle.textContent = victory
        ? "¡Planeta salvado!"
        : "¡Fin de la aventura!";

    overlayText.textContent = victory
        ? `Completaste los 3 niveles. Puntuación final: ${score}. ¡Eres un verdadero guardián!`
        : `Puntuación: ${score}. Residuos recogidos en el último nivel: ${collected}. ¡Inténtalo de nuevo!`;

    startButton.textContent = "↻ Jugar otra vez";
    overlay.classList.remove("hidden");

    gameStatus.textContent = victory
        ? "VICTORIA ECOLÓGICA"
        : "PARTIDA TERMINADA";
}

/* ==========================================
   BUCLE PRINCIPAL
========================================== */

function gameLoop(timestamp) {
    if (!running) return;

    const delta = Math.min(
        Math.max((timestamp - lastFrame) / 1000, 0),
        0.035
    );

    lastFrame = timestamp;

    if (invulnerable > 0) {
        invulnerable = Math.max(0, invulnerable - delta);
    }

    movePlayer(delta);
    moveEnemies(delta);
    collectTrash();
    hitEnemy();

    if (running) {
        draw(timestamp);
        animationId = requestAnimationFrame(gameLoop);
    }
}

/* ==========================================
   INICIO Y REINICIO
========================================== */

function startGame() {
    cancelAnimationFrame(animationId);

    if (!levelTransition) {
        levelIndex = 0;
        score = 0;
        lives = 3;
    } else {
        levelIndex++;
    }

    gameOver = false;
    levelTransition = false;
    keys.clear();

    prepareLevel();

    running = true;
    overlay.classList.add("hidden");
    gameStatus.textContent = "MISIÓN EN CURSO";

    lastFrame = performance.now();
    animationId = requestAnimationFrame(gameLoop);

    canvas.focus();
}

startButton.addEventListener("click", startGame);

/* ==========================================
   CONTROLES DEL TECLADO
========================================== */

const movementKeys = [
    "arrowup", "arrowdown", "arrowleft", "arrowright",
    "w", "a", "s", "d"
];

window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (movementKeys.includes(key)) {
        event.preventDefault();

        if (running) {
            keys.add(key);
        }
    }

    if (
        key === "enter" &&
        !running &&
        !overlay.classList.contains("hidden")
    ) {
        startGame();
    }
});

window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
    keys.clear();
});

/* ==========================================
   SONIDO OPCIONAL
========================================== */

soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundButton.textContent = soundEnabled
        ? "🔊 Sonido"
        : "🔇 Sonido";

    soundButton.setAttribute(
        "aria-pressed",
        String(soundEnabled)
    );

    if (soundEnabled) {
        playSound(650, 0.1);
    }
});

/* ==========================================
   INICIALIZACIÓN
========================================== */

prepareLevel();

overlay.classList.remove("hidden");
gameStatus.textContent = "PREPARADO PARA JUGAR";
updateProgress();
