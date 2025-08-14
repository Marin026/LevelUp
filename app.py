from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Simulación de estado de sesión.
is_logged_in = True

@app.route('/')
def home():
    """Ruta principal que renderiza el panel si el usuario está logueado."""
    if not is_logged_in:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login')
def login():
    """Ruta para la página de inicio de sesión."""
    return "<h1>Página de Login</h1><p>Esta es la página de inicio de sesión. Por favor, inicie sesión para acceder al panel.</p>"

@app.route('/logout')
def logout():
    """Ruta para cerrar sesión."""
    global is_logged_in
    is_logged_in = False
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)