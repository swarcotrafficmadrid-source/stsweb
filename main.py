import streamlit as st
from PIL import Image
from streamlit_gsheets import GSheetsConnection
from streamlit_javascript import st_javascript

import idiomas

# Intentamos importar los módulos, si uno falta avisamos
try:
    import menu_principal
    import usuarios
    import tickets_sat
    import equipos_nuevos
    import tickets
    import repuestos
    import correo
except ImportError as e:
    st.error(f"❌ Error: No se encuentra el módulo {e.name}")
    st.info("Asegúrate de que todos los archivos .py estén en la carpeta raíz (Root).")

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
    </style>
""", unsafe_allow_html=True)

def _detectar_idioma_navegador():
    try:
        browser_lang = st_javascript("navigator.language || navigator.userLanguage")
        return idiomas.normalizar_codigo_idioma(browser_lang)
    except Exception:
        return "es"


def main():
    # Inicializar estado de sesión
    if 'usuario' not in st.session_state:
        st.session_state.usuario = None
    if 'rol' not in st.session_state:
        st.session_state.rol = None
    if 'user_email' not in st.session_state:
        st.session_state.user_email = None
    if 'nombre' not in st.session_state:
        st.session_state.nombre = None
    if 'pagina_actual' not in st.session_state:
        st.session_state.pagina_actual = 'menu'
    if 'lang' not in st.session_state:
        st.session_state.lang = _detectar_idioma_navegador()

    # Selector de idioma
    idiomas_df = idiomas.obtener_lista_idiomas()
    codigo_actual = st.session_state.lang
    idx = idiomas_df[idiomas_df["codigo"] == codigo_actual].index
    default_index = int(idx[0]) if len(idx) > 0 else 0
    seleccionado = st.sidebar.selectbox(
        "🌐 Idioma",
        options=idiomas_df["codigo"].tolist(),
        format_func=lambda c: idiomas_df[idiomas_df["codigo"] == c]["nombre"].iloc[0],
        index=default_index
    )
    if seleccionado != st.session_state.lang:
        st.session_state.lang = seleccionado
        st.rerun()

    t = idiomas.traducir_interfaz(st.session_state.lang)

    # Conexión a Sheets
    conn = st.connection("gsheets", type=GSheetsConnection)
        
    # LOGO
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        try:
            st.image("logo.png", width=300)
        except:
            st.warning("⚠️ Logo no encontrado (logo.png)")

    # SISTEMA DE NAVEGACIÓN
    if st.session_state.usuario is None:
        # Login / Registro
        usuarios.app(conn, t)
    else:
        menu_principal.app(conn, t)

if __name__ == "__main__":
    main()