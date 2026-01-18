import streamlit as st
import hashlib
import pandas as pd
from streamlit_gsheets import GSheetsConnection

import correo
from gsheets_utils import ensure_columns

# --- CONEXIÓN A GOOGLE SHEETS ---
def init_connection():
    # Usamos el conector de Sheets
    return st.connection("gsheets", type=GSheetsConnection)

def hash_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

# --- FUNCIÓN PARA EVITAR DUPLICADOS ---
def verificar_duplicado(conn, email, username):
    """Retorna mensaje si ya existe el usuario o email"""
    df = conn.read(worksheet="usuarios")

    if df is not None and not df.empty:
        if 'email' in df.columns and email in df['email'].values:
            return "El correo electrónico ya está registrado."
        if 'usuario' in df.columns and username in df['usuario'].values:
            return "El nombre de usuario ya está en uso."
    return None 

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal(conn, t):
    st.markdown('<p class="swarco-title">REGISTRAR USUARIO <small style="color:red;">(vSheets)</small></p>', unsafe_allow_html=True)
    
    with st.form("registro_form"):
        col1, col2 = st.columns(2)
        with col1:
            nuevo_usuario = st.text_input(t.get("reg_usuario", "Usuario*"))
            nuevo_nombre = st.text_input(t.get("reg_nombre", "Nombre Completo*"))
            nuevo_email = st.text_input(t.get("reg_email", "Email*"))
        with col2:
            nueva_clave = st.text_input(t.get("reg_pass", "Contraseña*"), type="password")
            confirmar_clave = st.text_input(t.get("reg_pass_conf", "Confirmar Contraseña*"), type="password")
            rol = st.selectbox(t.get("reg_rol", "Rol"), ["Técnico", "Gestor", "Administrador"])
            
        submit = st.form_submit_button(t.get("reg_btn", "Crear Cuenta"))
        
        if submit:
            if not (nuevo_usuario and nuevo_nombre and nuevo_email and nueva_clave):
                st.error(t.get("reg_campos_req", "Todos los campos marcados con * son obligatorios"))
                return
                
            if nueva_clave != confirmar_clave:
                st.error(t.get("reg_pass_mismatch", "Las contraseñas no coinciden"))
                return
            
            error_duplicado = verificar_duplicado(conn, nuevo_email, nuevo_usuario)
            if error_duplicado:
                st.error(t.get("reg_duplicado", "❌ ERROR: {msg}").format(msg=error_duplicado))
                return 
                
            try:
                columnas = ["usuario", "nombre", "email", "password", "rol", "activo", "idioma"]
                df_actual = conn.read(worksheet="usuarios")
                df_actual = ensure_columns(df_actual, columnas)
                nuevos_datos = {
                    "usuario": nuevo_usuario,
                    "nombre": nuevo_nombre,
                    "email": nuevo_email,
                    "password": hash_password(nueva_clave),
                    "rol": rol,
                    "activo": True,
                    "idioma": st.session_state.get("lang", "es")
                }
                df_final = pd.concat([df_actual, pd.DataFrame([nuevos_datos])], ignore_index=True)
                conn.update(worksheet="usuarios", data=df_final)
                
                st.success(t.get("reg_exito", "✅ Usuario creado exitosamente"))
                ok = correo.enviar_correo_bienvenida(nuevo_email, nuevo_nombre, nuevo_usuario, nueva_clave)
                if not ok:
                    st.warning(t.get("reg_email_warn", "⚠️ Usuario creado, pero no se pudo enviar el correo."))
                st.info(t.get("reg_info", "Por favor inicie sesión"))
            except Exception as e:
                st.error(f"Error al guardar: {e}")

def login_form(conn, t):
    st.markdown('<p class="swarco-title">ACCESO USUARIOS</p>', unsafe_allow_html=True)
    with st.form("login_form"):
        usuario = st.text_input(t.get("login_user_or_email", "Usuario o Email"))
        password = st.text_input(t.get("login_pass", "Contraseña"), type="password")
        submit = st.form_submit_button(t.get("login_btn", "Entrar"))
        
        if submit:
            try:
                df = conn.read(worksheet="usuarios")
                hashed_pw = hash_password(password)
                if df is None or df.empty:
                    st.error("No hay usuarios registrados")
                    return
                df = ensure_columns(df, ["usuario", "nombre", "email", "password", "rol", "activo", "idioma"])
                user_match = df[
                    ((df['usuario'] == usuario) | (df['email'] == usuario))
                    & (df['password'] == hashed_pw)
                ]
                
                if not user_match.empty:
                    user_data = user_match.iloc[0]
                    if user_data.get('activo'):
                        st.session_state.usuario = user_data['usuario']
                        st.session_state.rol = user_data['rol']
                        st.session_state.user_email = user_data.get('email')
                        st.session_state.nombre = user_data.get('nombre')
                        st.rerun()
                    else:
                        st.error("Usuario inactivo")
                else:
                    st.error("Usuario o contraseña incorrectos")
            except Exception as e:
                st.error(f"Error de conexión: {e}")

def app(conn=None, t=None):
    if conn is None:
        conn = init_connection()
    if t is None:
        t = {}
    tab1, tab2 = st.tabs([t.get("btn_entrar", "Iniciar Sesión"), t.get("btn_ir_registro", "Crear Cuenta")])
    with tab1:
        login_form(conn, t)
    with tab2:
        interfaz_registro_legal(conn, t)
