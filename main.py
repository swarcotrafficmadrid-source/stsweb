# =============================================================================
# 🛡️ CERTIFICADO DE NO-REGRESIÓN
# 1. COMPATIBILIDAD: Revisado con usuarios.py (V-FINAL).
# 2. INTEGRIDAD: Mantiene menú, tickets, repuestos, equipos.
# 3. VERSIÓN: MAIN_V1 (17-Ene-2026 - 19:30)
# =============================================================================
import streamlit as st
from streamlit_gsheets import GSheetsConnection
import usuarios
import menu_principal
import tickets_sat
import repuestos
import equipos_nuevos
import estilos

# CONFIGURACIÓN INICIAL (Siempre primera línea)
st.set_page_config(page_title="SWARCO SAT", page_icon="🚦", layout="centered")

# CARGAR ESTILOS
estilos.cargar_css()

# CONEXIÓN BDD
conn = st.connection("gsheets", type=GSheetsConnection)

# GESTIÓN DE ESTADO (SESSION STATE)
# Esto evita que la página se reinicie y pierda datos al hacer click
if 'autenticado' not in st.session_state:
    st.session_state.autenticado = False
if 'user_email' not in st.session_state:
    st.session_state.user_email = ""
if 'pagina_actual' not in st.session_state:
    st.session_state.pagina_actual = 'menu'
if 'mostrar_registro' not in st.session_state:
    st.session_state.mostrar_registro = False

def main():
    # 1. SI ESTÁ LOGUEADO
    if st.session_state.autenticado:
        if st.session_state.pagina_actual == 'menu':
            menu_principal.mostrar_menu(conn, {})
        elif st.session_state.pagina_actual == 'crear_ticket':
            tickets_sat.interfaz_tickets(conn, {})
        elif st.session_state.pagina_actual == 'repuestos':
            repuestos.mostrar_repuestos({})
        elif st.session_state.pagina_actual == 'equipos_nuevos':
            equipos_nuevos.mostrar_equipos_nuevos({})
        else:
            st.session_state.pagina_actual = 'menu'
            st.rerun()

    # 2. SI NO ESTÁ LOGUEADO
    else:
        if st.session_state.mostrar_registro:
            # Pasa el control total a usuarios.py
            usuarios.interfaz_registro_legal(conn, {})
        else:
            usuarios.gestionar_acceso(conn, {})

if __name__ == "__main__":
    main()
