from flask import Flask, render_template, redirect, url_for, request, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User

app = Flask(__name__)
app.config.from_object(Config)

# Inicializar DB
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('home.html', user=session['user_id'])

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        documento = request.form['documento']
        password = request.form['password']
        role = request.form['role']

        # Validar si ya existe usuario o correo
        if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
            flash("Usuario o correo ya existe", "danger")
            return redirect(url_for('register'))

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, email=email, documento=documento, password=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()

        flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['role'] = user.role
            session['username'] = user.username
            flash("Inicio de sesión exitoso", "success")
            return redirect(url_for('home'))
        else:
            flash("Usuario o contraseña incorrectos", "danger")

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash("Sesión cerrada correctamente", "info")
    return redirect(url_for('home'))

@app.route('/admin')
def admin():
    if session.get('role') != 'Administrador':
        flash("No tienes permisos para acceder aquí", "danger")
        return redirect(url_for('home'))
    return render_template('admin.html')

@app.route('/creator')
def creator():
    if session.get('role') != 'Creador':
        flash("No tienes permisos para acceder aquí", "danger")
        return redirect(url_for('home'))
    return render_template('creator.html')

@app.route('/user')
def user_page():
    if session.get('role') != 'Usuario':
        flash("No tienes permisos para acceder aquí", "danger")
        return redirect(url_for('home'))
    return render_template('user.html')

if __name__ == '__main__':
    app.run(debug=True)
