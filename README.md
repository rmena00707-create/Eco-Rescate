# 🌎 EcoGuardian — Salvando el planeta

**EcoGuardian** es una página web educativa creada para combatir la contaminación, promover el cuidado del medioambiente y crear conciencia sobre el cambio climático.

El proyecto utiliza la tecnología para enseñar a las personas cómo proteger nuestro planeta mediante información educativa, consejos ecológicos, cuestionarios interactivos y un videojuego llamado **EcoRescate**.

## 🌱 Objetivos del proyecto

- Concientizar sobre la contaminación y el cambio climático.
- Promover el reciclaje y el uso responsable de los recursos naturales.
- Enseñar hábitos que ayuden a proteger el medioambiente.
- Utilizar la tecnología para fomentar la educación ambiental.
- Motivar a los usuarios a participar en el cuidado del planeta.

## ✨ Características principales

### 🌿 Página educativa
- Información sobre el medioambiente y el cambio climático.
- Consejos para cuidar la naturaleza.
- Diseño moderno, interactivo y adaptable a diferentes dispositivos.
- Modo claro y oscuro.
- Animaciones y elementos visuales ambientales.

### 🧠 Cuestionarios ambientales
- Preguntas educativas sobre diferentes temas.
- Categorías como reciclaje, agua, energía, naturaleza, océanos y contaminación.
- Sistema de puntuación para evaluar los conocimientos.
- Explicaciones que ayudan a aprender de forma interactiva.

### 🎮 EcoRescate
Videojuego educativo con estilo **pixel art retro**, diseñado para combinar diversión y aprendizaje ambiental.

- Niveles y misiones.
- Enemigos y desafíos.
- Recolección de objetos.
- Puntuación, vidas y progreso.
- Récord guardado mediante `localStorage`.
- Controles para computadora y dispositivos móviles.

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Python | Lógica del servidor |
| Flask | Aplicación web y rutas |
| HTML5 | Estructura de las páginas |
| CSS3 | Diseño y animaciones |
| JavaScript | Interactividad y videojuego |
| Bootstrap 5.3.3 | Diseño adaptable |
| Bootstrap Icons | Iconos |
| Jinja2 | Plantillas dinámicas |
| LocalStorage | Guardado local del tema y récord del juego |

## 📁 Estructura del proyecto

```text
EcoGuardian/
├── app.py
├── requirements.txt
├── templates/
│   ├── index.html
│   ├── quiz.html
│   ├── aprender.html
│   └── jugar.html
└── static/
    ├── css/
    │   ├── style.css
    │   └── juego.css
    ├── js/
    │   ├── script.js
    │   └── juego.js
    └── images/
        └── images.jpg
```

*Nota: esta estructura representa los archivos principales previstos. Conserva los archivos adicionales que ya tengas y ajusta los nombres si tu proyecto está organizado de otra manera.*

## ⚙️ Instalación y ejecución

### 1. Requisitos

- Python instalado.
- `pip` disponible.
- Un navegador web moderno.

### 2. Descargar o clonar el proyecto

Si utilizas Git:

```bash
git clone URL_DE_TU_REPOSITORIO
cd EcoGuardian
```

Reemplaza `URL_DE_TU_REPOSITORIO` por el enlace real de tu repositorio.

Si ya tienes el proyecto en tu computadora, abre la terminal en su carpeta.

### 3. Crear un entorno virtual

```bash
python -m venv venv
```

### 4. Activar el entorno virtual

En Windows:

```powershell
venv\Scripts\activate
```

### 5. Instalar las dependencias

```bash
pip install -r requirements.txt
```

### 6. Ejecutar la aplicación

```
python app.py
```

### 7. Abrir en el navegador

Visita:

- Página principal: http://127.0.0.1:5000
- Videojuego EcoRescate: http://127.0.0.1:5000/jugar

La ruta del videojuego debe estar definida en `app.py`.

## 🌍 Importancia del proyecto

La contaminación y el cambio climático representan desafíos para nuestro planeta. EcoGuardian busca contribuir a la educación ambiental ofreciendo recursos interactivos que ayuden a comprender estos problemas y a adoptar hábitos más responsables.

A través de sus cuestionarios y su videojuego, el proyecto demuestra que aprender a cuidar la naturaleza también puede ser una experiencia divertida.

## 🎯 Resultado esperado

Fomentar una comunidad más consciente, responsable y comprometida con la protección del medioambiente.

**Cada pequeña acción cuenta. ¡Juntos podemos salvar el planeta! 🌎💚**

## 👨‍💻 Autor

**Rafael Manuel Mena Pérez**

Proyecto educativo desarrollado con Python, Flask, HTML, CSS y JavaScript.

---

*EcoGuardian — Aprende, juega y protege nuestro planeta.*
