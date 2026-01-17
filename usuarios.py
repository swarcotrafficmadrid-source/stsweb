# =============================================================================
# ARCHIVO: usuarios.py
# PROYECTO: TicketV1
# VERSIÓN: DEBUG_TERMINATOR (Diagnóstico en Vivo)
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Muestra datos crudos en pantalla para cazar el error.
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import correo
import paises
import estilos
import time

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

# --- ZONA DE DIAGNÓSTICO ---
def mostrar_diagnostico(conn):
    st.error("🛠️ MODO DEBUG ACTIVO")
    st.write("Leyendo base de datos fresca...")
    
    try:
        # Forzamos lectura fresca usando read() con ttl=0 si es posible, 
        # o invocando worksheet directamente.
        df = conn.read(worksheet="Usuarios", ttl=0)
        
        # 1. Mostrar Columnas
        cols_raw = list(df.columns)
        
        # 2. Normalizar
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # 3. Extraer Emails
        col_email = 'email' if 'email' in df.columns else 'correo' if 'correo' in df.columns else None
        
        if col_email:
            lista = df[col_email].astype(str).str.lower().str.strip().tolist()
            with st.expander("📂 VER LISTA DE EMAILS EN BASE DE DATOS (Click aquí)", expanded=False):
                st.write(f"Total encontrados: {len(lista)}")
                st.write(lista)
                st.dataframe(df) # Muestra la tabla completa
            return lista
        else:
            st.error(f"🚨 NO VEO COLUMNA EMAIL. Columnas: {cols_raw}")
            return []
            
    except Exception as e:
        st.error(f"❌ Error leyendo Excel: {e}")
        return []

# --- INTERFAZ REGISTRO ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.title("REGISTRO DEBUG")
    
    # 1. EJECUTAR DIAGNÓSTICO AL INICIO
    lista_emails_registrados = mostrar_diagnostico(conn)

    # 2. FORMULARIO
    with st.container(border=True):
        st.markdown("#### Datos Usuario")
        n = st.text_input("Nombre", value="Test")
        a = st.text_input("Apellido", value="User")
        cargo = st.text_input("Cargo", value="Tester")
        e = st.text_input("Empresa", value="Swarco")
        
        # EMAIL CRÍTICO
        st.markdown("---")
        m = st.text_input("EMAIL (El de los cojones)", value="").lower().strip()
        
        # VERIFICACIÓN EN TIEMPO REAL (VISUAL)
        if m:
            if m in lista_emails_registrados:
                st.error(f"⛔ ¡DETECTADO! El sistema VE que '{m}' ya existe.")
                st.markdown("**SI PULSAS REGISTRAR AHORA, DEBERÍA FRENARSE.**")
            else:
                st.success(f"✅ El sistema NO ve '{m}' en la lista. (Ojo: Si ya existe en Excel y sale verde aquí, es problema de caché).")
        
        st.markdown("---")
        
        # Telefonos
        col_pais, col_pref, col_tel = st.columns([3, 1.2, 3])
        with col_pais:
            lista = paises.obtener_lista_nombres()
            idx = lista.index("España") if "España" in lista else 0
            pais_sel = st.selectbox("País", lista, index=idx)
        with col_pref:
            pref = paises.obtener_prefijo(pais_sel)
            st.text_input("Prefijo", value=pref, disabled=True)
        with col_tel:
            tl_num = st.text_input("Móvil", value="600000000")

        p1 = st.text_input("Contraseña", type="password", value="Swarco123$")
        p2 = st.text_input("Repetir Contraseña", type="password", value="Swarco123$")
        chk = st.checkbox("Acepto términos", value=True)

    st.divider()

    # --- BOTÓN DE PRUEBA SMTP (SOLO CORREO) ---
    with st.expander("📧 PROBAR SOLO EL ENVÍO DE CORREO (Sin Guardar)"):
        dest = st.text_input("Correo destino para prueba", value=m)
        if st.button("📨 ENVIAR CORREO DE PRUEBA"):
            st.write("Intentando enviar...")
            try:
                ok = correo.enviar_correo_bienvenida(dest, "Usuario Test", dest, "1234")
                if ok: st.success("✅ CORREO ENVIADO CON ÉXITO.")
                else: st.error("❌ EL ENVÍO FALLÓ. Revisa logs.")
            except Exception as e:
                st.error(f"❌ EXCEPCIÓN: {e}")

    st.divider()

    # --- BOTÓN DE REGISTRO REAL ---
    if st.button("🔴 INTENTAR REGISTRO REAL (CON FRENO)", type="primary"):
        st.write("🚦 INICIANDO PROCESO...")
        
        # 1. CHEQUEO DUPLICADOS FINAL
        st.write(f"🔍 Buscando '{m}' en la lista...")
        if m in lista_emails_registrados:
            st.error("🛑 FRENO DE EMERGENCIA ACTIVADO: USUARIO DUPLICADO.")
            st.error("EL CÓDIGO SE DETIENE AQUÍ.")
            st.stop()
        
        st.success("🟢 NO ES DUPLICADO. PROCEDIENDO A GUARDAR.")
        
        # 2. GUARDADO
        try:
            st.write("💾 Escribiendo en Excel...")
            conn.worksheet("Usuarios").append_row([
                n, a, cargo, e, pais_sel, pref, tl_num, m, encriptar_password(p1)
            ])
            st.write("✅ ESCRITURA OK.")
            
            # 3. CORREO
            st.write("📧 Enviando correo...")
            ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            if ok:
                st.balloons()
                st.success("🏆 TODO COMPLETADO.")
                if st.button("IR AL LOGIN"):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("⚠️ USUARIO GUARDADO PERO EL CORREO FALLÓ.")
                st.stop()
                
        except Exception as ex:
            st.error(f"💣 ERROR TÉCNICO: {ex}")
            st.stop()

    if st.button("Volver al Login"):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN ---
def gestionar_acceso(conn, t):
    estilos.mostrar_logo()
    st.title("LOGIN DEBUG")
    if st.button("Ir al Registro"):
        st.session_state.mostrar_registro = True
        st.rerun()
