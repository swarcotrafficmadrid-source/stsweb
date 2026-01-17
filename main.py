import streamlit as st
from PIL import Image
import menu_principal
import usuarios
import tickets_sat
import equipos_nuevos
import tickets
import repuestos
import correo  # Si tienes módulo de correo

# Configuración de página
st.set_page_config(
    page_title="Swarco Traffic Madrid",
    page_icon="🚦",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Estilos CSS
st.markdown("""
    <style>
    .stApp { background-color: #ffffff; }
    [data-testid="stSidebar"] { background-color: #f0f2f6; }
    .swarco-title {
        color: #000000;
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
    }
    .main-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
    </style>
""", unsafe_allow_html=True)

def main():
    # Inicializar estado de sesión
    if 'usuario' not in st.session_state:
        st.session_state.usuario = None
    if 'rol' not in st.session_state:
        st.session_state.rol = None
        
    # LOGO
    try:
        col1, col2, col3 = st.columns([1,2,1])
        with col2:
            st.image("logo.png", width=300)
    except:
        st.warning("⚠️ Falta el archivo logo.png")

    # SISTEMA DE NAVEGACIÓN
    if st.session_state.usuario is None:
        usuarios.app()  # Muestra Login/Registro
    else:
        # Si está logueado, mostrar menú
        menu_principal.app()

if __name__ == "__main__":
    main()