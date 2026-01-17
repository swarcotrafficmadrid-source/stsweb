# =============================================================================
# ARCHIVO: usuarios.py
# VERSIÓN: FORENSE (Diagnóstico Paso a Paso)
# DESCRIPCIÓN: Muestra secretos cargados, datos en Excel y detiene todo antes de guardar.
# =============================================================================
import streamlit as st
import pandas as pd
import hashlib
import re 
import time
import correo
import paises
import estilos

# --- UTILIDADES ---
def encriptar_password(password):
    return hashlib.sha256(str.encode(password)).hexdigest()

def es_email_valido(email):
    patron = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return re.match(patron, email) is not None

# --- PANTALLA DE DEBUGGING ---
def interfaz_registro_legal(conn, t):
    estilos.mostrar_logo()
    st.markdown("## 🕵️‍♂️ MODO FORENSE: REVISIÓN DE DATOS")
    st.info("Esta pantalla no guarda nada automáticamente. Tú controlas cada paso.")

    # ---------------------------------------------------------
    # PASO 1: VERIFICAR QUÉ CARAJOS HAY EN LOS SECRETS
    # ---------------------------------------------------------
    with st.expander("🔑 PASO 1: VERIFICAR LLAVES (SECRETS)", expanded=True):
        st.write("El sistema está leyendo estas secciones en tu secrets.toml:")
        try:
            llaves = list(st.secrets.keys())
            st.code(llaves)
            
            # Verificamos si existe [emails] que es lo que tú pusiste
            if "emails" in st.secrets:
                st.success("✅ SECCIÓN [emails] ENCONTRADA.")
                st.write(f"Usuario configurado: `{st.secrets['emails'].get('user', 'NO DEFINIDO')}`")
            else:
                st.error("❌ NO VEO LA SECCIÓN [emails].")
                
            # Verificamos si por error sigue buscando [smtp]
            if "smtp" in st.secrets:
                st.warning("⚠️ OJO: Tienes una sección [smtp] vieja. Asegúrate que 'correo.py' no la esté usando.")
        except Exception as e:
            st.error(f"Error leyendo secrets: {e}")

    # ---------------------------------------------------------
    # PASO 2: VERIFICAR LA BASE DE DATOS (SIN CACHÉ)
    # ---------------------------------------------------------
    with st.expander("Cb PASO 2: LEER EXCEL (DATABASE)", expanded=True):
        st.write("Borrando caché y leyendo datos frescos...")
        st.cache_data.clear() # OBLIGAMOS A BORRAR MEMORIA
        
        try:
            # Leemos hoja Usuarios
            df = conn.read(worksheet="Usuarios", ttl=0) 
            
            if df.empty:
                st.warning("La hoja está vacía.")
                lista_emails_real = []
            else:
                # Normalizamos columnas
                df.columns = [str(c).lower().strip() for c in df.columns]
                st.write("Columnas detectadas:", list(df.columns))
                st.dataframe(df) # MUESTRA LA TABLA PARA QUE TU LA VEAS

                # Buscamos la columna email
                col_email = None
                if 'email' in df.columns: col_email = 'email'
                elif 'correo' in df.columns: col_email = 'correo'
                
                if col_email:
                    lista_emails_real = df[col_email].astype(str).str.lower().str.strip().tolist()
                    st.write("📧 **LISTA DE EMAILS YA REGISTRADOS:**")
                    st.code(lista_emails_real)
                else:
                    st.error("🚨 NO ENCUENTRO COLUMNA EMAIL.")
                    lista_emails_real = []

        except Exception as e:
            st.error(f"Error grave leyendo Excel: {e}")
            lista_emails_real = []

    st.divider()

    # ---------------------------------------------------------
    # PASO 3: PRUEBA DE INPUT
    # ---------------------------------------------------------
    st.markdown("### 📝 DATOS DE PRUEBA")
    
    c1, c2 = st.columns(2)
    n = c1.text_input("Nombre", "Test")
    a = c2.text_input("Apellido", "User")
    m = st.text_input("EMAIL A PROBAR", "").lower().strip()
    p1 = st.text_input("Password", "123456", type="password")

    # VALIDACIÓN EN VIVO (SIN APRETAR BOTONES)
    if m:
        if m in lista_emails_real:
            st.error(f"⛔ ESTADO: EL USUARIO '{m}' YA EXISTE. (BLOQUEADO)")
            bloquear_boton = True
        else:
            st.success(f"✅ ESTADO: El usuario '{m}' ESTÁ DISPONIBLE.")
            bloquear_boton = False
    else:
        bloquear_boton = True

    st.divider()

    # ---------------------------------------------------------
    # PASO 4: ACCIÓN CONTROLADA
    # ---------------------------------------------------------
    if st.button("🚀 INTENTAR GUARDAR Y ENVIAR CORREO", disabled=bloquear_boton, type="primary"):
        st.write("⏳ Iniciando proceso...")
        
        # 1. DOBLE CHEQUEO
        if m in lista_emails_real:
            st.error("🛑 ALTO: Es duplicado. No guardo nada.")
            st.stop()

        # 2. INTENTO DE GUARDADO
        try:
            st.info("1️⃣ Guardando en Excel...")
            # Aquí construimos la fila dummy para probar
            fila = [n, a, "CargoTest", "EmpresaTest", "España", "+34", "000", m, encriptar_password(p1)]
            conn.worksheet("Usuarios").append_row(fila)
            st.success("✅ Guardado en Excel OK.")
            
        except Exception as e:
            st.error(f"❌ Error guardando en Excel: {e}")
            st.stop()

        # 3. INTENTO DE CORREO
        try:
            st.info("2️⃣ Enviando Correo (Usando secrets['emails'])...")
            
            # --- DEBUG IMPLICITO DEL CORREO ---
            # Llamamos a correo.py. Si falla, debe explotar aquí.
            ok = correo.enviar_correo_bienvenida(m, n, m, p1)
            
            if ok:
                st.balloons()
                st.success("✅✅ CORREO ENVIADO EXITOSAMENTE.")
                st.markdown("""
                    ### 🎉 PROCESO TERMINADO
                    El usuario se guardó y el correo salió.
                    
                    **¿Qué quieres hacer ahora?**
                """)
                if st.button("Ir al Login (Finalizar)"):
                    st.session_state.mostrar_registro = False
                    st.rerun()
            else:
                st.error("❌ EL CÓDIGO EJECUTÓ PERO RETORNÓ FALSE.")
                st.warning("Esto pasa si las credenciales son inválidas o Google bloqueó el acceso.")

        except Exception as e:
            st.error(f"💣 EXPLOSIÓN EN EL CÓDIGO DE CORREO: {e}")
            st.write("Verifica que 'correo.py' esté actualizado y leyendo ['emails'].")

    if st.button("Cancelar / Volver"):
        st.session_state.mostrar_registro = False
        st.rerun()

# --- LOGIN (Simplificado) ---
def gestionar_acceso(conn, t):
    st.title("LOGIN")
    if st.button("Ir a Pantalla Forense (Registro)"):
        st.session_state.mostrar_registro = True
        st.rerun()
