# =============================================================================
# ARCHIVO: usuarios.py
# PROYECTO: TicketV1
# VERSIÓN: 1.2.0 (FRENO DE MANO - Sin Reruns Automáticos)
# FECHA: 17-Ene-2026
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos

# --- Lógica Auxiliar ---
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

def usuario_existe(conn, email_input):
    if not email_input: return False
    try:
        # Forzamos lectura fresca para evitar duplicados en el momento
        records = conn.worksheet("Usuarios").get_all_records()
        df = pd.DataFrame(records)
        if df.empty: return False
        
        lista_emails = df['email'].astype(str).str.lower().str.strip().values
        email_buscado = email_input.lower().strip()
        
        if email_buscado in lista_emails:
            return True
    except: return False
    return False

# --- Interfaz de Registro ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("reg_tit", "ALTA DE USUARIO")}</p>', unsafe_allow_html=True)
    
    if 'campos_error' not in st.session_state: st.session_state.campos_error = []

    # --- 1. Formulario ---
    with st.container(border=True):
        st.markdown(f"#### 👤 {t.get('p1_tit', 'Identificación')}")
        c1, c2 = st.columns(2)
        n = c1.text_input("Nombre *")
        a = c2.text_input("Apellido *")

    with st.container(border=True):
        st.markdown(f"#### 🌍 {t.get('p2_tit', 'Datos Profesionales')}")
        c_cargo, c_empresa = st.columns(2)
        cargo = c_cargo.text_input("Cargo / Puesto *")
        e = c_empresa.text_input("Empresa / Entidad *")
        
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
            tl_num = st.text_input("Nº Móvil *", placeholder="Solo números")

    with st.container(border=True):
        st.markdown(f"#### 🔒 {t.get('p3_tit', 'Seguridad')}")
        p1 = st.text_input("Contraseña *", type='password')
        if p1:
            prog, etiq, col = validar_fuerza_clave(p1)
            st.markdown(f"""<div style="background-color:#ddd;height:5px;"><div style="width:{prog}%;background-color:{col};height:100%;"></div></div><small style="color:{col}">{etiq}</small>""", unsafe_allow_html=True)
        
        p2 = st.text_input("Repetir Contraseña *", type='password')

    with st.container(border=True):
        st.markdown(f"#### ⚖️ {t.get('p4_tit', 'Términos Legales')}")
        chk = st.checkbox("He leído y acepto la Política de Privacidad.")

    st.divider()

    # --- 2. Lógica del Botón (SIN RERUNS AUTOMÁTICOS) ---
    if st.button("REGISTRAR USUARIO", type="primary", use_container_width=True):
        
        # Validaciones
        errores = []
        if not n: errores.append("Nombre")
        if not a: errores.append("Apellido")
        if not cargo: errores.append("Cargo")
        if not e: errores.append("Empresa")
        if not m or not es_email_valido(m): errores.append("Email inválido")
        if not chk: errores.append("Aceptar Términos")
        if not tl_num or not tl_num.isdigit(): errores.append("Teléfono")
        if not p1 or p1 != p2: errores.append("Contraseñas no coinciden o vacías")

        # Chequeo Final de Duplicado antes de guardar
        if m and usuario_existe(conn, m):
            st.error("⛔ ALTO: Este usuario YA existe en la base de datos. Intente con otro email.")
            st.stop()

        if errores:
            st.error(f"⚠️ Faltan datos: {', '.join(errores)}")
        else:
            # === ZONA DE FUEGO ===
            try:
                # 1. Guardar
                conn.worksheet("Usuarios").append_row([
                    n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
                ])
                st.info("💾 Datos guardados en Excel... Intentando enviar correo...")

                # 2. Enviar Correo
                ok = correo.enviar_correo_bienvenida(m, n, m, p1)
                
                if ok:
                    st.balloons()
                    st.success("✅ ¡TODO SALIÓ BIEN!")
                    st.success("El usuario ha sido creado y el correo enviado.")
                    # AQUI ESTA EL CAMBIO: NO SE REFRESCA SOLO
                    if st.button("➡️ IR AL INICIO DE SESIÓN"):
                        st.session_state.mostrar_registro = False
                        st.rerun()
                else:
                    st.error("❌ EL CORREO FALLÓ.")
                    st.warning("⚠️ Mira el mensaje de error técnico arriba (texto rojo). NO refresques la página.")
                    # No hay rerun, se queda aquí para que leas
            
            except Exception as ex:
                st.error(f"❌ ERROR CRÍTICO AL GUARDAR: {ex}")

    if st.button("Cancelar / Volver"):
        st.session_state.mostrar_registro = False
        st.rerun()

def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("login_tit", "Acceso")}</p>', unsafe_allow_html=True)
    with st.container(border=True):
        u = st.text_input("Usuario")
        p = st.text_input("Contraseña", type='password')
        if st.button("ENTRAR", use_container_width=True):
            try:
                df = pd.DataFrame(conn.worksheet("Usuarios").get_all_records())
                if not df.empty and u.lower().strip() in df['email'].astype(str).str.lower().values:
                    real = df.loc[df['email']==u.lower().strip(), 'password'].values[0]
                    if encriptar_password(p) == real:
                        st.session_state.autenticado = True
                        st.session_state.user_email = u
                        st.session_state.pagina_actual = 'menu'
                        st.rerun()
                    else: st.error("Contraseña incorrecta")
                else: st.error("Usuario no encontrado")
            except: st.error("Error conexión")
    st.write("")
    if st.button("Crear cuenta nueva"):
        st.session_state.mostrar_registro = True
        st.rerun()
