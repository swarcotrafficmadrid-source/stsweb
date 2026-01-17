# =============================================================================
# ARCHIVO: main.py
# PROYECTO: TicketV1
# FECHA: 17-Ene-2026
# DESCRIPCIÓN: Punto de entrada principal. Controla la navegación.
# =============================================================================
import streamlit as st
import pandas as pd
from streamlit_gsheets import GSheetsConnection
import usuarios
import menu_principal
import tickets_sat
import repuestos
import equipos_nuevos
import estilos

# Configuración de página (SIEMPRE PRIMERO)
st.set_page_config(page_title="SWARCO SAT", page_icon="🚦", layout="centered")

# Cargar Estilos CSS
estilos.cargar_css()

# Conexión a Google Sheets
conn = st.connection("gsheets", type=GSheetsConnection)

# Inicialización de Estado (Session State)
if 'autenticado' not in st.session_state:
    st.session_state.autenticado = False
if 'user_email' not in st.session_state:
    st.session_state.user_email = ""
if 'pagina_actual' not in st.session_state:
    st.session_state.pagina_actual = 'menu'
if 'mostrar_registro' not in st.session_state:
    st.session_state.mostrar_registro = False

def main():
    # 1. Si el usuario YA entró
    if st.session_state.autenticado:
        # Lógica de navegación del menú
        if st.session_state.pagina_actual == 'menu':
            menu_principal.mostrar_menu(conn, {}) # Pasamos dict vacío por ahora si no hay traducciones
        elif st.session_state.pagina_actual == 'crear_ticket':
            tickets_sat.interfaz_tickets(conn, {})
        elif st.session_state.pagina_actual == 'repuestos':
            repuestos.mostrar_repuestos({})
        elif st.session_state.pagina_actual == 'equipos_nuevos':
            equipos_nuevos.mostrar_equipos_nuevos({})
        else:
            st.session_state.pagina_actual = 'menu'
            st.rerun()

    # 2. Si el usuario NO ha entrado (Login o Registro)
    else:
        if st.session_state.mostrar_registro:
            # Aquí llamamos al registro
            usuarios.interfaz_registro_legal(conn, {})
        else:
            # Aquí llamamos al login
            usuarios.gestionar_acceso(conn, {})

if __name__ == "__main__":
    main()


