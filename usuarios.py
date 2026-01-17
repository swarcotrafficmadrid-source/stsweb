# =============================================================================
# 🛡️ CERTIFICADO DE NO-REGRESIÓN
# 1. COMPATIBILIDAD: Revisado con main.py y correo.py.
# 2. INTEGRIDAD: Freno de duplicados fuera de try/except.
# 3. VERSIÓN: USERS_V_FINAL (17-Ene-2026 - 19:30)
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos

# --- UTILIDADES ---
def encriptar_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def es_email_valido(email):
    return re.match(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$', email) is not None

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

def obtener_emails_frescos(conn):
    """Lee la BDD forzando actualización para ver duplicados reales."""
    try:
        df = conn.read(worksheet="Usuarios", ttl=0)
        if df.empty: return []
        df.columns = [str(c).lower().strip() for c in df.columns]
        col = next((c for c in ['email', 'correo'] if c in df.columns), None)
        if col:
            return df[col].astype(str).str.lower().str.strip().tolist()
        return []
    except Exception:
        return []

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown('<p class="swarco-title">ALTA DE USUARIO <small>(Final)</small></p>', unsafe_allow_html=True)

    with st.container(border=True):
        c1, c2 = st.columns(2)
        n = c1.text_input("Nombre *")
        a = c2.text_input("Apellido *")
        c3, c4 = st.columns(2)
        cargo = c3.text_input("Cargo *")
        e = c4.text_input("Empresa *")
        
        # INPUT EMAIL
        m = st.text_input("Email Corporativo *").lower().strip()
        
        # ZONA TELEFONOS
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
            st.caption(f"Fortaleza: {etiq}")
        p2 = st.text_input("Repetir Contraseña *", type="password")
        chk = st.checkbox("Acepto la Política de Privacidad")

    st.divider()

    if st.button("REGISTRAR USUARIO", type="primary", use_container_width=True):
        
        # 1. VALIDACIÓN DATOS VACÍOS
        errores = []
        if not n or not a or not cargo or not e: errores.append("Datos personales")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not tl_num: errores.append("Teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas")
        if not chk: errores.append("Términos")

        if errores:
            st.error(f"⚠️ Faltan datos: {', '.join(errores)}")
            st.stop()

        # 2. FRENO DE DUPLICADOS (BLOQUEANTE)
        existing_emails = obtener_emails_frescos(conn)
        if m in existing_emails:
            st.error(f"⛔ ERROR CRÍTICO: El usuario '{m}' YA EXISTE.")
            st.warning("No se puede registrar el mismo correo dos veces.")
            st.stop() # <--- AQUÍ MUERE EL PROCESO SI EXISTE

        # 3. GUARDADO Y CORREO (Solo llega aquí si no existe)
        try:
            with st.spinner("Procesando..."):
                # A. Guardar
                conn.worksheet("Usuarios").append_row([
                    n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
                ])
                # B. Correo
                ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success("✅ Registro completado y correo enviado.")
                if st.button("Ir al Login"):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("⚠️ Usuario guardado pero falló el envío de correo.")
                st.stop()

        except Exception as ex:
            st.error(f"❌ Error Técnico: {ex}")
            st.stop()

    if st.button("Volver"):
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
                df = conn.read(worksheet="Usuarios", ttl=0)
                if not df.empty:
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
                else:
                    st.error("Base de datos vacía")
            except Exception as e:
                st.error(f"Error conexión: {e}")

    st.write("")
    if st.button("Crear cuenta nueva"):
        st.session_state.mostrar_registro = True
        st.rerun()
