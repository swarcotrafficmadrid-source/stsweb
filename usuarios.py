# =============================================================================
# ARCHIVO: usuarios.py
# PROYECTO: TicketV1
# VERSIÓN: 5.0 (GOLD MASTER - INTEGRA TODO)
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Registro completo con Multi-idioma, Debug de Secrets y Anti-Duplicados.
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import time
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

# --- DIAGNÓSTICO SILENCIOSO (Verifica secretos sin romper la UI) ---
def verificar_salud_sistema():
    problemas = []
    # 1. Chequeo de Secrets
    if "emails" not in st.secrets:
        problemas.append("❌ Falta sección [emails] en secrets.toml")
    
    return problemas

def obtener_emails_actuales(conn):
    """Obtiene la lista de correos frescos para validar duplicados."""
    try:
        # Forzamos lectura fresca (ttl=0)
        df = conn.read(worksheet="Usuarios", ttl=0)
        if df.empty: return []
        
        # Normalizar y buscar columna
        df.columns = [str(c).lower().strip() for c in df.columns]
        col = next((c for c in ['email', 'correo', 'usuario'] if c in df.columns), None)
        
        if col:
            return df[col].astype(str).str.lower().str.strip().tolist()
        return []
    except Exception:
        return []

# --- INTERFAZ DE REGISTRO (CON MULTI-IDIOMA) ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    
    # Título usando el diccionario de idiomas 't'
    titulo = t.get("reg_tit", "ALTA DE USUARIO")
    # Agregamos un indicador visual pequeño para saber que es la versión nueva
    st.markdown(f'<p class="swarco-title">{titulo} <small style="font-size:10px; color:grey;">(v5.0)</small></p>', unsafe_allow_html=True)

    # ALERTA DE SISTEMA (Si faltan secrets)
    errores_sys = verificar_salud_sistema()
    if errores_sys:
        for err in errores_sys:
            st.error(err)
        st.stop() # Freno de mano si no hay configuración

    # --- FORMULARIO ---
    with st.container(border=True):
        st.markdown(f"#### 👤 {t.get('p1_tit', 'Identificación')}")
        c1, c2 = st.columns(2)
        n = c1.text_input(t.get("nombre", "Nombre *"))
        a = c2.text_input(t.get("apellido", "Apellido *"))

    with st.container(border=True):
        st.markdown(f"#### 🌍 {t.get('p2_tit', 'Datos Profesionales')}")
        c3, c4 = st.columns(2)
        cargo = c3.text_input(t.get("cargo", "Cargo / Puesto *"))
        e = c4.text_input(t.get("empresa", "Empresa / Entidad *"))
        
        # Email (Campo crítico)
        lbl_email = t.get("email", "Email Corporativo *")
        m = st.text_input(lbl_email).lower().strip()
        
        # Validación visual inmediata
        if m:
            lista_check = obtener_emails_actuales(conn)
            if m in lista_check:
                st.error(f"⛔ {t.get('err_dup', 'Este usuario YA existe.')}")
            elif not es_email_valido(m):
                st.warning("⚠️ Formato inválido")
            else:
                st.caption("✅ Email disponible")

        # Telefonos
        col_pais, col_pref, col_tel = st.columns([3, 1.2, 3])
        with col_pais:
            lista = paises.obtener_lista_nombres()
            idx = lista.index("España") if "España" in lista else 0
            pais_sel = st.selectbox(t.get("pais", "País *"), lista, index=idx)
        with col_pref:
            pref = paises.obtener_prefijo(pais_sel)
            st.text_input("Prefijo", value=pref, disabled=True)
        with col_tel:
            tl_num = st.text_input(t.get("movil", "Nº Móvil *"))

    with st.container(border=True):
        st.markdown(f"#### 🔒 {t.get('p3_tit', 'Seguridad')}")
        p1 = st.text_input(t.get("pass", "Contraseña *"), type="password")
        if p1:
            prog, etiq, col = validar_fuerza_clave(p1)
            st.caption(f"Fortaleza: {etiq}")
        p2 = st.text_input(t.get("pass_rep", "Repetir Contraseña *"), type="password")

    with st.container(border=True):
        st.markdown(f"#### ⚖️ {t.get('p4_tit', 'Legales')}")
        chk = st.checkbox(t.get("aceptar_pol", "He leído y acepto la Política de Privacidad"))

    st.divider()

    # --- BOTÓN DE ACCIÓN ---
    btn_texto = t.get("btn_reg", "REGISTRAR USUARIO")
    if st.button(btn_texto, type="primary", use_container_width=True):
        
        # 1. Validaciones
        errores = []
        if not n or not a: errores.append("Nombre/Apellido")
        if not cargo or not e: errores.append("Cargo/Empresa")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not tl_num: errores.append("Teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas")
        if not chk: errores.append("Términos")

        if errores:
            st.error(f"⚠️ {t.get('err_datos', 'Faltan datos')}: {', '.join(errores)}")
            st.stop()

        # 2. FRENO DE DUPLICADOS (Doble Check Real)
        lista_final = obtener_emails_actuales(conn)
        if m in lista_final:
            st.error(f"⛔ {t.get('err_dup_block', 'ERROR: El usuario ya existe. No se puede duplicar.')}")
            st.stop()

        # 3. GUARDAR Y ENVIAR
        try:
            with st.spinner(t.get("msg_guardando", "Guardando y enviando correo...")):
                
                # A. Guardar en Sheets
                conn.worksheet("Usuarios").append_row([
                    n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
                ])
                
                # B. Enviar Correo (Usando tu correo.py corregido)
                ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success(f"✅ {t.get('msg_exito', 'Usuario creado y notificado por email.')}")
                
                # Botón manual para salir
                if st.button(t.get("btn_ir_login", "Ir al Inicio de Sesión")):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("❌ " + t.get("err_mail", "Usuario guardado, pero falló el envío del correo."))
                st.warning("Verifique la configuración de 'secrets.toml'.")
                st.stop()

        except Exception as ex:
            st.error(f"❌ Error Técnico: {ex}")
            st.stop()

    if st.button(t.get("btn_cancelar", "Cancelar")):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN (Mantenemos simple pero funcional) ---
def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("login_tit", "ACCESO SAT")}</p>', unsafe_allow_html=True)
    
    with st.container(border=True):
        u = st.text_input(t.get("user_ph", "Usuario (Email)"))
        p = st.text_input(t.get("pass_ph", "Contraseña"), type="password")
        
        if st.button(t.get("btn_entrar", "ENTRAR"), use_container_width=True):
            try:
                # Login Robusto
                df = conn.read(worksheet="Usuarios", ttl=0)
                if not df.empty:
                    df.columns = [str(c).lower().strip() for c in df.columns]
                    col_email = next((c for c in ['email', 'correo'] if c in df.columns), None)
                    
                    if col_email and u.lower().strip() in df[col_email].astype(str).str.lower().str.strip().values:
                        # Check pass
                        row = df[df[col_email].astype(str).str.lower().str.strip() == u.lower().strip()].iloc[0]
                        col_pass = next((c for c in ['password', 'contraseña'] if c in df.columns), None)
                        
                        if col_pass and encriptar_password(p) == str(row[col_pass]):
                            st.session_state.autenticado = True
                            st.session_state.user_email = u
                            st.session_state.pagina_actual = 'menu'
                            st.rerun()
                        else:
                            st.error(t.get("err_pass", "Contraseña incorrecta"))
                    else:
                        st.error(t.get("err_user", "Usuario no encontrado"))
                else:
                    st.error("Base de datos vacía")
            except Exception as e:
                st.error(f"Error conexión: {e}")

    st.write("")
    if st.button(t.get("btn_crear", "Crear cuenta nueva")):
        st.session_state.mostrar_registro = True
        st.rerun()
