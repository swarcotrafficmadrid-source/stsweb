import streamlit as st
import hashlib
from supabase import create_client, Client
import re

# Conexión a Supabase
def init_connection():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)

def hash_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

# --- FUNCIÓN CLAVE PARA EVITAR DUPLICADOS ---
def verificar_duplicado(email, username):
    """Retorna True si el usuario o email ya existen"""
    supabase = init_connection()
    
    # 1. Chequear email
    res_email = supabase.table('usuarios').select("*").eq('email', email).execute()
    if res_email.data and len(res_email.data) > 0:
        return "El correo electrónico ya está registrado."
        
    # 2. Chequear usuario
    res_user = supabase.table('usuarios').select("*").eq('usuario', username).execute()
    if res_user.data and len(res_user.data) > 0:
        return "El nombre de usuario ya está en uso."
        
    return None # No hay duplicados

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal():
    st.markdown('<p class="swarco-title">REGISTRAR USUARIO <small style="color:red;">(vFinal)</small></p>', unsafe_allow_html=True)
    
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
            
            # VERIFICACIÓN DE DUPLICADOS
            error_duplicado = verificar_duplicado(nuevo_email, nuevo_usuario)
            if error_duplicado:
                st.error(f"❌ ERROR: {error_duplicado}")
                return # Detener aquí
                
            # Si pasa, guardar
            try:
                supabase = init_connection()
                datos = {
                    "usuario": nuevo_usuario,
                    "nombre": nuevo_nombre,
                    "email": nuevo_email,
                    "password": hash_password(nueva_clave),
                    "rol": rol,
                    "activo": True
                }
                supabase.table("usuarios").insert(datos).execute()
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
                supabase = init_connection()
                hashed_pw = hash_password(password)
                response = supabase.table("usuarios").select("*").eq("usuario", usuario).eq("password", hashed_pw).execute()
                
                if response.data:
                    user_data = response.data[0]
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