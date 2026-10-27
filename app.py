
from flask import Flask, jsonify, render_template

app = Flask(__name__)


# ==========================================
# BANCO DE PREGUNTAS
# ==========================================

PREGUNTAS_AMBIENTALES = {
    "reciclaje": [
        {
            "p": "¿Qué significa reciclar?",
            "o": [
                "Quemar todos los residuos",
                "Transformar residuos en nuevos materiales",
                "Tirar todo al mismo contenedor",
                "Enterrar la basura"
            ],
            "c": 1
        },
        {
            "p": "¿Qué debes hacer con una botella reutilizable?",
            "o": [
                "Usarla varias veces",
                "Tirarla después de usarla",
                "Dejarla en la calle",
                "Quemarla"
            ],
            "c": 0
        },
        {
            "p": "¿Cuál es una buena forma de reducir residuos?",
            "o": [
                "Comprar productos innecesarios",
                "Usar más bolsas desechables",
                "Evitar productos de un solo uso",
                "Mezclar toda la basura"
            ],
            "c": 2
        },
        {
            "p": "¿Qué representa el símbolo de reciclaje?",
            "o": [
                "Un producto tóxico",
                "Un proceso de reutilización de materiales",
                "Una advertencia de fuego",
                "Agua potable"
            ],
            "c": 1
        },
        {
            "p": "¿Qué debes hacer antes de reciclar un envase?",
            "o": [
                "Llenarlo de tierra",
                "Quemarlo",
                "Dejar comida dentro",
                "Seguir las normas locales de separación"
            ],
            "c": 3
        }
    ],

    # Agrega aquí las preguntas de las demás categorías.
    "agua": [],
    "energia": [],
    "naturaleza": [],
    "oceanos": [],
    "clima": [],
    "transporte": [],
    "contaminacion": [],
    "ambiente": []
}


# ==========================================
# RUTAS DE LA APLICACIÓN
# ==========================================

@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/jugar")
def jugar():
    return render_template("juego.html")


@app.route("/api/preguntas")
def obtener_preguntas():
    return jsonify(PREGUNTAS_AMBIENTALES)


# ==========================================
# INICIAR SERVIDOR
# ==========================================

if __name__ == "__main__":
    app.run(debug=True)
