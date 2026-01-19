import streamlit as st
from PIL import Image
from streamlit_gsheets import GSheetsConnection
from streamlit_javascript import st_javascript
import json
import os

import idiomas
import estilos

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
    st.stop()

# Configuración de página
st.set_page_config(
    page_title="Swarco Traffic Madrid",
    page_icon="🚦",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Estilos globales
estilos.cargar_estilos()


def _detectar_idioma_navegador():
    try:
        browser_lang = st_javascript("navigator.language || navigator.userLanguage")
        return idiomas.normalizar_codigo_idioma(browser_lang)
    except Exception:
        return "es"


def _write_secrets_file(secrets_dir, content):
    try:
        os.makedirs(secrets_dir, exist_ok=True)
        secrets_path = os.path.join(secrets_dir, "secrets.toml")
        with open(secrets_path, "w", encoding="utf-8") as f:
            f.write("\n".join(content))
        print(f"[gsheets] secrets.toml escrito en {secrets_path}")
        return True
    except Exception as e:
        print(f"[gsheets] No se pudo escribir secrets.toml en {secrets_dir}: {e}")
        return False


def _ensure_secrets_from_env():
    service_account_json = os.environ.get("GSHEETS_SECRET")
    spreadsheet_url = os.environ.get("SPREADSHEET_URL")
    if not service_account_json or not spreadsheet_url:
        print("[gsheets] GSHEETS_SECRET o SPREADSHEET_URL no definidos")
        return

    try:
        creds = json.loads(service_account_json)
    except Exception as e:
        st.error(f"Error leyendo GSHEETS_SECRET: {e}")
        return

    print(
        "[gsheets] cargando secrets:",
        f"client_email={creds.get('client_email')}",
        f"private_key_id={creds.get('private_key_id')}",
        f"auth_provider_x509_cert_url={creds.get('auth_provider_x509_cert_url')}",
        f"private_key_has_begin={'BEGIN PRIVATE KEY' in private_key}",
        f"private_key_len={len(private_key)}",
        f"spreadsheet_url={spreadsheet_url}",
    )

    private_key = creds.get("private_key", "")
    if "\\n" in private_key:
        private_key = private_key.replace("\\n", "\n")

    content = [
        "[connections.gsheets]",
        f'spreadsheet = "{spreadsheet_url}"',
        "",
        "[connections.gsheets.service_account]",
        f'type = "{creds.get("type", "")}"',
        f'project_id = "{creds.get("project_id", "")}"',
        f'private_key_id = "{creds.get("private_key_id", "")}"',
        'private_key = """' + private_key + '"""',
        f'client_email = "{creds.get("client_email", "")}"',
        f'client_id = "{creds.get("client_id", "")}"',
        f'auth_uri = "{creds.get("auth_uri", "")}"',
        f'token_uri = "{creds.get("token_uri", "")}"',
        f'auth_provider_x509_cert_url = "{creds.get("auth_provider_x509_cert_url", "")}"',
        f'client_x509_cert_url = "{creds.get("client_x509_cert_url", "")}"',
        f'universe_domain = "{creds.get("universe_domain", "googleapis.com")}"',
        "",
    ]

    # En Cloud Run, preferimos /tmp. También escribimos en ~/.streamlit como fallback.
    os.environ.setdefault("STREAMLIT_CONFIG_DIR", "/tmp/streamlit")
    wrote_tmp = _write_secrets_file(os.environ["STREAMLIT_CONFIG_DIR"], content)
    wrote_home = _write_secrets_file(os.path.expanduser("~/.streamlit"), content)
    if not wrote_tmp and not wrote_home:
        st.error("No se pudo escribir secrets.toml en ninguna ruta.")
        return


def main():
    # Inicializar estado de sesión
    if "usuario" not in st.session_state:
        st.session_state.usuario = None
    if "rol" not in st.session_state:
        st.session_state.rol = None
    if "user_email" not in st.session_state:
        st.session_state.user_email = None
    if "nombre" not in st.session_state:
        st.session_state.nombre = None
    if "pagina_actual" not in st.session_state:
        st.session_state.pagina_actual = "menu"
    if "lang" not in st.session_state:
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
        index=default_index,
    )
    if seleccionado != st.session_state.lang:
        st.session_state.lang = seleccionado
        st.rerun()

    t = idiomas.traducir_interfaz(st.session_state.lang)

    # Conexión a Sheets (Cloud Run o Secrets de Streamlit)
    _ensure_secrets_from_env()
    conn = st.connection("gsheets", type=GSheetsConnection)

    # LOGO
    estilos.mostrar_logo()

    # SISTEMA DE NAVEGACIÓN
    if st.session_state.usuario is None:
        usuarios.app(conn, t)
    else:
        menu_principal.app(conn, t)


if __name__ == "__main__":
    main()
