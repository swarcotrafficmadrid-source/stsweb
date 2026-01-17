# =============================================================================
# ARCHIVO: usuarios.py
# PROYECTO: TicketV1
# VERSIÓN: 2.0 (FINAL STABLE)
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Registro robusto con detección de columnas y bloqueo de duplicados.
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

def usuario_existe_robusto(conn, email_input):
    """
    Verifica si el usuario existe normalizando las columnas del Excel.
    Retorna: True (Existe), False (No existe), o Lanza Error (Si falla conexión).
    """
    try:
        # 1. Leer datos frescos
        ws = conn.worksheet("Usuarios")
        records = ws.get_all_records()
        df = pd.DataFrame(records)
        
        if df.empty:
            return False
            
        # 2. Normalizar columnas (Minusculas y sin espacios)
        # Esto arregla si en el excel dice "Email " o "CORREO"
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # 3. Buscar columna candidata para el email
        col_email = None
        if 'email' in df.columns: col_email = 'email'
        elif 'correo' in df.columns: col_email = 'correo'
        
        if not col_email:
            st.error(f"⚠️ ERROR CRÍTICO: No encuentro una columna de email en el Excel. Columnas vistas: {list(df.columns)}")
            st.stop()
            
        # 4. Buscar el duplicado
        lista_emails = df[col_email].astype(str).str.lower().str.strip().values
        return email_input.lower().strip() in lista_emails

    except Exception as e:
        st.error(f"Error leyendo base de datos: {e}")
        st.stop() # Freno de seguridad

# --- PANTALLA DE REGISTRO ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">ALTA DE USUARIO</p>', unsafe_allow_html=True)

    # Contenedor del formulario
    with st.container(border=True):
        c1, c2 = st.columns(2)
        n = c1.text_input("Nombre *")
        a = c2.text_input("Apellido *")
        
        c3, c4 = st.columns(2)
        cargo = c3.text_input("Cargo *")
        e = c4.text_input("Empresa *")
        
        m = st.text_input("Email Corporativo *").lower().strip()
        
        # Telefonos
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

        # Pass
        p1 = st.text_input("Contraseña *", type="password")
        if p1:
            prog, etiq, col = validar_fuerza_clave(p1)
            st.caption(f"Fortaleza: {etiq}")
        p2 = st.text_input("Repetir Contraseña *", type="password")
        
        chk = st.checkbox("Acepto la Política de Privacidad")

    st.divider()

    # --- BOTÓN DE ACCIÓN ---
    if st.button("REGISTRAR USUARIO", type="primary", use_container_width=True):
        
        # 1. Validaciones Locales
        errores = []
        if not n or not a or not cargo or not e: errores.append("Datos personales incompletos")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not tl_num: errores.append("Falta teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas vacías o no coinciden")
        if not chk: errores.append("Debe aceptar los términos")

        if errores:
            st.error(f"❌ FALTAN DATOS: {', '.join(errores)}")
            # NO usamos stop() aquí para dejar que el usuario corrija sin recargar
        
        else:
            # 2. Validación de Duplicados (CONECTADA)
            if usuario_existe_robusto(conn, m):
                st.error("⛔ EL USUARIO YA EXISTE. No se puede crear de nuevo.")
                st.stop() # Freno total

            # 3. Guardado
            try:
                conn.worksheet("Usuarios").append_row([
                    n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
                ])
                st.success("💾 Usuario guardado en base de datos.")
                
                # 4. Envío de Correo
                with st.spinner("Enviando correo de bienvenida..."):
                    ok = correo.enviar_correo_bienvenida(m, n, m, p1)
                
                if ok:
                    st.balloons()
                    st.success("✅ ¡CORREO ENVIADO! Registro Completado.")
                    # Botón manual para salir (evita bucles)
                    if st.button("Ir al Login"):
                        st.session_state.mostrar_registro = False
                        st.rerun()
                else:
                    st.error("❌ ERROR SMTP: El correo no salió.")
                    st.warning("El usuario se creó pero no recibió el email. Avise a soporte.")
                    # Freno para que lea el error
                    st.stop()

            except Exception as ex:
                st.error(f"❌ Error Técnico: {ex}")
                st.stop()

    # Botón Cancelar (Fuera del form)
    if st.button("Volver al Login"):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN (Simplificado para compatibilidad) ---
def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">ACCESO SAT</p>', unsafe_allow_html=True)
    
    with st.container(border=True):
        u = st.text_input("Usuario (Email)")
        p = st.text_input("Contraseña", type="password")
        
        if st.button("ENTRAR", use_container_width=True):
            try:
                # Login Robusto con normalización de columnas
                ws = conn.worksheet("Usuarios")
                df = pd.DataFrame(ws.get_all_records())
                df.columns = [str(c).lower().strip() for c in df.columns] # Normalizar
                
                # Buscar columna email
                col_email = 'email' if 'email' in df.columns else 'correo' if 'correo' in df.columns else None
                
                if not col_email:
                    st.error("Error estructura Excel (falta columna email)")
                elif not df.empty and u.lower().strip() in df[col_email].astype(str).str.lower().str.strip().values:
                    # Password check
                    row = df[df[col_email].astype(str).str.lower().str.strip() == u.lower().strip()].iloc[0]
                    # Asumimos columna password o contraseña
                    col_pass = 'password' if 'password' in df.columns else 'contraseña'
                    
                    if col_pass in df.columns and encriptar_password(p) == str(row[col_pass]):
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
