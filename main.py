# =============================================================================
# ARCHIVO: main.py
# DESCRIPCIÓN: Cerebro de la aplicación. Mantiene la sesión viva.
# =============================================================================
import streamlit as st
from streamlit_gsheets import GSheetsConnection
import usuarios
import menu_principal
import tickets_sat
import repuestos
import equipos_nuevos
import estilos

# 1. Configuración de Página (OBLIGATORIO AL INICIO)
st.set_page_config(
    page_title="SWARCO SAT",
    page_icon="🚦",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# 2. Cargar Estilos Globales
estilos.cargar_css()

# 3. Inicializar Conexión a Base de Datos
conn = st.connection("gsheets", type=GSheetsConnection)

# 4. Inicializar Variables de Memoria (Session State)
# Esto evita que la app se resetee sola.
if 'autenticado' not in st.session_state:
    st.session_state.autenticado = False
if 'user_email' not in st.session_state:
    st.session_state.user_email = ""
if 'pagina_actual' not in st.session_state:
    st.session_state.pagina_actual = 'menu'
if 'mostrar_registro' not in st.session_state:
    st.session_state.mostrar_registro = False

# 5. Lógica Principal de Navegación
def main():
    # ESCENARIO A: Usuario ya entró (Login exitoso)
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

    # ESCENARIO B: Usuario NO ha entrado (Login o Registro)
    else:
        if st.session_state.mostrar_registro:
            # Llama a la pantalla de registro
            usuarios.interfaz_registro_legal(conn, {})
        else:
            # Llama a la pantalla de login
            usuarios.gestionar_acceso(conn, {})

if __name__ == "__main__":
    main()
