# =============================================================================
# ARCHIVO: usuarios.py
# MODO: SUPER DEBUG (Radiografía de Datos)
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos

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

def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">MODO DEBUG 🕵️‍♂️</p>', unsafe_allow_html=True)
    
    st.warning("⚠️ ESTÁS EN MODO DEBUG. Verás datos técnicos en pantalla.")

    # --- PASO 1: VERIFICAR CONEXIÓN Y DATOS ---
    st.markdown("### 1. Estado de la Base de Datos (Google Sheets)")
    try:
        ws = conn.worksheet("Usuarios")
        records = ws.get_all_records()
        df = pd.DataFrame(records)
        
        if df.empty:
            st.error("❌ El Excel devuelve VACÍO. Revisa que tenga datos.")
        else:
            st.success(f"✅ Conexión OK. Se leyeron {len(df)} filas.")
            
            # NORMALIZACIÓN DE COLUMNAS
            cols_originales = list(df.columns)
            df.columns = [str(c).lower().strip() for c in df.columns]
            
            st.write("**Columnas detectadas (Originales):**", cols_originales)
            st.write("**Columnas normalizadas (Lo que veo yo):**", list(df.columns))
            
            # MOSTRAR TABLA
            st.dataframe(df)

            if 'email' in df.columns:
                lista_emails = df['email'].astype(str).str.lower().str.strip().tolist()
                st.write("**Lista de Emails en Memoria:**", lista_emails)
            else:
                st.error("🚨 NO VEO LA COLUMNA 'email'. Revisa la cabecera en el Excel.")

    except Exception as e:
        st.error(f"❌ ERROR GRAVE DE CONEXIÓN: {e}")
        st.stop()

    st.divider()

    # --- PASO 2: FORMULARIO ---
    st.markdown("### 2. Formulario de Prueba")
    
    c1, c2 = st.columns(2)
    n = c1.text_input("Nombre", value="Test")
    a = c2.text_input("Apellido", value="User")
    
    # Campo Email
    m = st.text_input("Email a probar", value="").lower().strip()
    
    p1 = st.text_input("Password", type="password", value="Swarco123$")
    chk = st.checkbox("Acepto todo")

    # VALIDACIÓN EN TIEMPO REAL
    if m:
        st.write(f"🔎 Buscando: `{m}` en la lista de arriba...")
        if 'email' in df.columns and m in df['email'].astype(str).str.lower().str.strip().values:
            st.error("⛔ RESULTADO: ¡ENCONTRADO! (El sistema sabe que existe)")
        else:
            st.success("✅ RESULTADO: NO ENCONTRADO (Disponible)")

    st.divider()

    # --- PASO 3: BOTÓN DE ACCIÓN ---
    if st.button("🔴 INTENTAR REGISTRO (CLICK AQUÍ)", type="primary"):
        st.write("🔵 **Paso 3.1:** Click recibido. Entrando a lógica...")
        
        errores = []
        if not m: errores.append("Falta Email")
        
        # CHEQUEO DUPLICADOS FINAL
        st.write("🔵 **Paso 3.2:** Verificando duplicados antes de guardar...")
        if 'email' in df.columns and m in df['email'].astype(str).str.lower().str.strip().values:
             st.error("❌ ERROR BLOQUEANTE: El usuario YA EXISTE. Se detiene el proceso.")
             st.stop()
        
        st.write("🔵 **Paso 3.3:** No es duplicado. Intentando guardar...")
        
        try:
            # INTENTO DE GUARDADO
            nueva_fila = [n, a, "Tester", "Empresa Test", "España", "+34", "600000000", m, encriptar_password(p1)]
            conn.worksheet("Usuarios").append_row(nueva_fila)
            st.success("💾 ¡GUARDADO EN EXCEL EXITOSO!")
            
            st.write("🔵 **Paso 3.4:** Intentando enviar correo...")
            ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success("📧 CORREO ENVIADO CORRECTAMENTE.")
            else:
                st.error("🔥 FALLÓ EL ENVÍO DE CORREO.")
                
        except Exception as e:
            st.error(f"💣 EXPLOSIÓN AL GUARDAR: {e}")

    if st.button("Volver"):
        st.session_state.mostrar_registro = False
        st.rerun()

def gestionar_acceso(conn, t):
    # Versión simplificada para el login
    estilos.mostrar_logo()
    st.title("LOGIN DEBUG")
    if st.button("Ir a Registro"):
        st.session_state.mostrar_registro = True
        st.rerun()
