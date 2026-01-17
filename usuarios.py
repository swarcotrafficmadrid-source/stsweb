# =============================================================================
# ARCHIVO: usuarios.py
# PROYECTO: TicketV1
# VERSIÓN: 3.0 (FIX CRÍTICO: ST.STOP FUERA DE TRY/EXCEPT)
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Ahora la validación de duplicados es BLOQUEANTE de verdad.
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos

# --- FUNCIONES AUXILIARES ---
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

def obtener_emails_actuales(conn):
    """
    Obtiene la lista cruda de emails para validar fuera del try/except.
    """
    try:
        ws = conn.worksheet("Usuarios")
        records = ws.get_all_records()
        df = pd.DataFrame(records)
        if df.empty: return []
        
        # Normalizar columnas
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Buscar columna email
        col_email = None
        if 'email' in df.columns: col_email = 'email'
        elif 'correo' in df.columns: col_email = 'correo'
        
        if col_email:
            return df[col_email].astype(str).str.lower().str.strip().tolist()
        return []
    except Exception as e:
        st.error(f"Error conectando con BDD para verificar duplicados: {e}")
        return []

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">ALTA DE USUARIO</p>', unsafe_allow_html=True)

    # --- FORMULARIO ---
    with st.container(border=True):
        c1, c2 = st.columns(2)
        n = c1.text_input("Nombre *")
        a = c2.text_input("Apellido *")
        
        c3, c4 = st.columns(2)
        cargo = c3.text_input("Cargo *")
        e = c4.text_input("Empresa *")
        
        m = st.text_input("Email Corporativo *").lower().strip()
        
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

    # --- BOTÓN DE ACCIÓN ---
    if st.button("REGISTRAR USUARIO", type="primary", use_container_width=True):
        
        # 1. VALIDACIONES BÁSICAS
        errores = []
        if not n or not a or not cargo or not e: errores.append("Datos personales")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not tl_num: errores.append("Teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas")
        if not chk: errores.append("Términos")

        if errores:
            st.error(f"❌ FALTAN DATOS: {', '.join(errores)}")
            st.stop() # Freno 1

        # 2. VALIDACIÓN DUPLICADOS (FUERA DE TRY/EXCEPT GENÉRICO)
        # Esto asegura que st.stop() funcione y mate la ejecución
        st.info("🔍 Verificando disponibilidad...")
        lista_emails = obtener_emails_actuales(conn)
        
        if m in lista_emails:
            st.error(f"⛔ EL USUARIO '{m}' YA EXISTE.")
            st.warning("No se ha creado nada nuevo. Revise la lista de usuarios o contacte admin.")
            st.stop() # <--- Freno 2: AHORA SÍ FUNCIONA PORQUE NO HAY TRY QUE LO COMA

        # 3. GUARDADO Y CORREO (Solo llegamos aquí si NO es duplicado)
        try:
            st.info("💾 Guardando datos...")
            conn.worksheet("Usuarios").append_row([
                n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
            ])
            
            st.info("📧 Enviando correo...")
            ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success("✅ ¡REGISTRO EXITOSO!")
                if st.button("Ir al Login"):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("❌ ERROR CORREO: El usuario se guardó, pero el email falló.")
                st.error("Por favor tome captura de este error.")
                # NO usamos st.rerun() para que se vea el error
                st.stop()

        except Exception as ex:
            st.error(f"❌ ERROR TÉCNICO AL GUARDAR: {ex}")
            st.stop()

    if st.button("Volver al Login"):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN ---
def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">ACCESO SAT</p>', unsafe_allow_html=True)
    
    with st.container(border=True):
        u = st.text_input("Usuario (Email)")
        p = st.text_input("Contraseña", type="password")
        
        if st.button("ENTRAR", use_container_width=True):
            try:
                # Reutilizamos la lógica de lectura segura
                ws = conn.worksheet("Usuarios")
                df = pd.DataFrame(ws.get_all_records())
                df.columns = [str(c).lower().strip() for c in df.columns]
                
                col_email = 'email' if 'email' in df.columns else 'correo' if 'correo' in df.columns else None
                
                if not col_email:
                    st.error("Error estructura Excel (falta columna email)")
                elif not df.empty and u.lower().strip() in df[col_email].astype(str).str.lower().str.strip().values:
                    # Password check
                    row = df[df[col_email].astype(str).str.lower().str.strip() == u.lower().strip()].iloc[0]
                    # Asumimos columna password o contraseña
                    col_pass = 'password' if 'password' in df.columns else 'contraseña'
                    
                    val_pass = str(row[col_pass]) if col_pass in df.columns else ""
                    
                    if encriptar_password(p) == val_pass:
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
