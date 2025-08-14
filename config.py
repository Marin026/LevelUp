class Config:
    # Conexión a MySQL (XAMPP)
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root@localhost:3306/loginlevelup'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'clave_secreta_segura'
