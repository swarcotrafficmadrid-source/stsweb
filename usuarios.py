# =============================================================================
# ARCHIVO: usuarios.py
# DESCRIPCIÓN: Módulo de gestión de usuarios. Contiene la lógica de FRENO.
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos

# --- FUNCIONES DE SOPORTE (Lógica Pura) ---

def encriptar_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def es_email_valido(email):
    patron = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return re.match(patron, email) is not None

def validar_fuerza_clave(password):
    score = 0
    if len(password) >= 8: score += 1
    if re.search(r"[A-Z]", password): score += 1
    if re.search(r"[a-z]", password): score += 1
    if re.search(r"[0-9]", password): score += 1
    if re.search(r"[@$!%*?&#]", password): score += 1
    if score < 3: return 20, "Débil 🔴", "#ff4b4b"
    elif score < 5: return 60, "Media 🟡", "#ffa500"
    else: return 100, "Robusta 🟢", "#21c354"

def obtener_lista_emails(conn):
    """Descarga SOLO la lista de emails para verificar duplicados rápido."""
    try:
        df = conn.read(worksheet="Usuarios", ttl=0) # ttl=0 fuerza datos frescos
        if df.empty: return []
        # Normalizar columnas (todo a minúsculas y sin espacios)
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Buscar la columna que contenga el email
        col = next((c for c in ['email', 'correo', 'usuario'] if c in df.columns), None)
        if col:
            return df[col].astype(str).str.lower().str.strip().tolist()
        return []
    except Exception:
        return []

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown('<p class="swarco-title">ALTA DE USUARIO <small>(vFinal)</small></p>', unsafe_allow_html=True)

    # 1. FORMULARIO
    with st.container(border=True):
        c1, c2 = st.columns(2)
        n = c1.text_input("Nombre *")
        a = c2.text_input("Apellido *")
        
        c3, c4 = st.columns(2)
        cargo = c3.text_input("Cargo *")
        e = c4.text_input("Empresa *")
        
        # Campo Crítico: EMAIL
        m = st.text_input("Email Corporativo *").lower().strip()
        
        # Validación Visual Inmediata
        if m:
            if not es_email_valido(m):
                st.caption("⚠️ Formato de correo incorrecto")
            else:
                st.caption("✅ Formato correcto")

        col_pais, col_pref, col_tel = st.columns([3, 1.2, 3])
        with col_pais:
            lista = paises.obtener_lista_nombres()
            idx = lista.index("España") if "España" in lista else 0
            pais_sel = st.selectbox("País *", lista, index=idx)
        with col_pref:
            pref = paises.obtener_prefijo(pais_sel)
            st.text_input("Prefijo", value=pref, disabled=True)
        with col_tel:
            tl_num = st.text_input("Móvil *")

        p1 = st.text_input("Contraseña *", type="password")
        if p1:
            prog, etiq, col = validar_fuerza_clave(p1)
            st.caption(f"Seguridad: {etiq}")
        p2 = st.text_input("Repetir Contraseña *", type="password")
        
        chk = st.checkbox("Acepto la Política de Privacidad")

    st.divider()

    # 2. LOGICA DE CONTROL (EL FRENO)
    if st.button("REGISTRAR USUARIO", type="primary", use_container_width=True):
        
        # A. Revisión de Campos Vacíos
        errores = []
        if not n or not a: errores.append("Falta Nombre/Apellido")
        if not cargo or not e: errores.append("Falta Cargo/Empresa")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not tl_num: errores.append("Falta Teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas no coinciden")
        if not chk: errores.append("Debe aceptar política")

        if errores:
            st.error(f"❌ ERROR: {', '.join(errores)}")
            st.stop() # Freno 1: Datos incompletos

        # B. Revisión de Duplicados (CRÍTICO)
        # Se hace ANTES de intentar guardar o enviar correo.
        emails_existentes = obtener_lista_emails(conn)
        
        if m in emails_existentes:
            st.error(f"⛔ DETENIDO: El usuario '{m}' YA EXISTE en la base de datos.")
            st.warning("No se ha creado nada nuevo. Por favor use otro correo.")
            st.stop() # Freno 2: Duplicado encontrado

        # C. Proceso de Guardado (Solo si pasó los frenos)
        try:
            with st.spinner("Guardando y enviando correo..."):
                # 1. Guardar en Excel
                conn.worksheet("Usuarios").append_row([
                    n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
                ])
                
                # 2. Enviar Correo (Usando tu configuración de secrets [emails])
                ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success("✅ Usuario creado y notificado correctamente.")
                if st.button("Ir al Login"):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("⚠️ El usuario se guardó en Excel, pero FALLÓ el envío de correo.")
                st.error("Verifique la configuración de [emails] en secrets.toml")
                st.stop() # Freno 3: Error de correo

        except Exception as ex:
            st.error(f"❌ Error Técnico Grave: {ex}")
            st.stop() # Freno 4: Error de sistema

    # Botón Cancelar
    if st.button("Cancelar / Volver"):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN ---
def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.markdown('<p class="swarco-title">ACCESO SAT</p>', unsafe_allow_html=True)
    
    with st.container(border=True):
        u = st.text_input("Usuario (Email)")
        p = st.text_input("Contraseña", type="password")
        
        if st.button("ENTRAR", use_container_width=True):
            try:
                # Leer Usuarios
                df = conn.read(worksheet="Usuarios", ttl=0)
                if df.empty:
                    st.error("Base de datos vacía")
                else:
                    df.columns = [str(c).lower().strip() for c in df.columns]
                    col_email = next((c for c in ['email', 'correo'] if c in df.columns), None)
                    
                    if col_email and u.lower().strip() in df[col_email].astype(str).str.lower().str.strip().values:
                        row = df[df[col_email].astype(str).str.lower().str.strip() == u.lower().strip()].iloc[0]
                        col_pass = next((c for c in ['password', 'contraseña'] if c in df.columns), None)
                        
                        if col_pass and encriptar_password(p) == str(row[col_pass]):
                            st.session_state.autenticado = True
                            st.session_state.user_email = u
                            st.session_state.pagina_actual = 'menu'
                            st.rerun()
                        else:
                            st.error("Contraseña incorrecta")
                    else:
                        st.error("Usuario no encontrado")
            except Exception as e:
                st.error(f"Error conexión: {e}")

    st.write("")
    if st.button("Crear cuenta nueva"):
        st.session_state.mostrar_registro = True
        st.rerun()
