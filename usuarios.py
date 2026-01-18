import streamlit as st
import hashlib
import pandas as pd
from streamlit_gsheets import GSheetsConnection

# --- CONEXIÓN A GOOGLE SHEETS ---
def init_connection():
    # Usamos el conector de Sheets, eliminamos Supabase por completo
    return st.connection("gsheets", type=GSheetsConnection)

def hash_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

# --- FUNCIÓN PARA EVITAR DUPLICADOS ---
def verificar_duplicado(email, username):
    """Retorna mensaje si ya existe el usuario o email"""
    conn = init_connection()
    df = conn.read(worksheet="usuarios")
    
    if df is not None and not df.empty:
        if email in df['email'].values:
            return "El correo electrónico ya está registrado."
        if username in df['usuario'].values:
            return "El nombre de usuario ya está en uso."
    return None 

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal():
    st.markdown('<p class="swarco-title">REGISTRAR USUARIO <small style="color:red;">(vSheets)</small></p>', unsafe_allow_html=True)
    
    with st.form("registro_form"):
        col1, col2 = st.columns(2)
        with col1:
            nuevo_usuario = st.text_input("Usuario*")
            nuevo_nombre = st.text_input("Nombre Completo*")
            nuevo_email = st.text_input("Email*")
        with col2:
            nueva_clave = st.text_input("Contraseña*", type="password")
            confirmar_clave = st.text_input("Confirmar Contraseña*", type="password")
            rol = st.selectbox("Rol", ["Técnico", "Gestor", "Administrador"])
            
        submit = st.form_submit_button("Crear Cuenta")
        
        if submit:
            if not (nuevo_usuario and nuevo_nombre and nuevo_email and nueva_clave):
                st.error("Todos los campos marcados con * son obligatorios")
                return
                
            if nueva_clave != confirmar_clave:
                st.error("Las contraseñas no coinciden")
                return
            
            error_duplicado = verificar_duplicado(nuevo_email, nuevo_usuario)
            if error_duplicado:
                st.error(f"❌ ERROR: {error_duplicado}")
                return 
                
            try:
                conn = init_connection()
                df_actual = conn.read(worksheet="usuarios")
                
                nuevos_datos = pd.DataFrame([{
                    "usuario": nuevo_usuario,
                    "nombre": nuevo_nombre,
                    "email": nuevo_email,
                    "password": hash_password(nueva_clave),
                    "rol": rol,
                    "activo": True
                }])
                
                df_final = pd.concat([df_actual, nuevos_datos], ignore_index=True)
                conn.update(worksheet="usuarios", data=df_final)
                
                st.success("✅ Usuario creado exitosamente")
                st.info("Por favor inicie sesión")
            except Exception as e:
                st.error(f"Error al guardar: {e}")

def login_form():
    st.markdown('<p class="swarco-title">ACCESO USUARIOS</p>', unsafe_allow_html=True)
    with st.form("login_form"):
        usuario = st.text_input("Usuario")
        password = st.text_input("Contraseña", type="password")
        submit = st.form_submit_button("Entrar")
        
        if submit:
            try:
                conn = init_connection()
                df = conn.read(worksheet="usuarios")
                hashed_pw = hash_password(password)
                
                user_match = df[(df['usuario'] == usuario) & (df['password'] == hashed_pw)]
                
                if not user_match.empty:
                    user_data = user_match.iloc[0]
                    if user_data.get('activo'):
                        st.session_state.usuario = user_data['usuario']
                        st.session_state.rol = user_data['rol']
                        st.rerun()
                    else:
                        st.error("Usuario inactivo")
                else:
                    st.error("Usuario o contraseña incorrectos")
            except Exception as e:
                st.error(f"Error de conexión: {e}")

def app():
    tab1, tab2 = st.tabs(["Iniciar Sesión", "Crear Cuenta"])
    with tab1:
        login_form()
    with tab2:
        interfaz_registro_legal()
