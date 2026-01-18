# =============================================================================
# ARCHIVO: tickets_sat.py
# PROYECTO: Sistema de Gestión SAT - SWARCO Traffic Spain
# VERSIÓN: 2.1.0 (Restauración de Funciones Originales)
# FECHA ÚLTIMA MODIF: 16-Ene-2026
# DESCRIPCIÓN: Formulario completo de reporte de averías. Incluye la gestión 
#              de múltiples equipos, carga de archivos y lógica de urgencia.
# =============================================================================

import streamlit as st
import pandas as pd
import uuid
from datetime import datetime
import estilos

from gsheets_utils import append_row

TICKETS_COLUMNS = [
    "id", "fecha", "tipo", "email", "pais", "equipo", "serial",
    "fecha_averia", "prioridad", "descripcion", "estado",
    "proyecto", "empresa", "email_contacto", "tel_contacto",
    "ns", "ref", "urgencia", "falla"
]

def gestionar_equipos(t, urg_val_default):
    """Módulo para la entrada de datos técnicos del equipo."""
    # Inicializar lista si no existe en el estado de la sesión
    if 'lista_equipos' not in st.session_state:
        st.session_state.lista_equipos = []

    st.markdown(f'<div class="section-header">{t.get("cat2", "Detalle de Equipos")}</div>', unsafe_allow_html=True)
    st.info(t.get('pegatina', 'Consulte la etiqueta en el lateral del equipo.'))
    
    try:
        st.image("etiqueta.jpeg", use_container_width=True)
    except:
        st.caption("Imagen de etiqueta no disponible.")

    ce1, ce2 = st.columns(2)
    with ce1:
        ns_in = st.text_input(t.get('ns_titulo', 'N.S. (Número de Serie)'), key="ns_input")
    with ce2:
        ref_in = st.text_input("REF.", key="ref_input")

    st.markdown(f'<div class="section-header">{t.get("cat3", "Prioridad y Fallo")}</div>', unsafe_allow_html=True)
    
    # Lista de urgencias según tu código original
    opciones_urg = [t.get('u1', 'Baja'), t.get('u2', 'Normal'), t.get('u3', 'Alta'), 
                    t.get('u4', 'Urgente'), t.get('u5', 'Muy Urgente'), t.get('u6', 'Crítica')]
    
    urg_val = st.select_slider(t.get('urg_instruccion', 'Nivel de Urgencia'), options=opciones_urg, value=urg_val_default)

    falla_in = st.text_area(t.get('desc_instruccion', 'Descripción del fallo'), 
                            placeholder=t.get('desc_placeholder', 'Escriba aquí...'), key="desc_input")

    return ns_in, ref_in, urg_val, falla_in

def interfaz_tickets(conn, t):
    """Página principal del SAT."""
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">{t.get("titulo_portal", "Reporte SAT")}</p>', unsafe_allow_html=True)
    
    if st.button(f"⬅️ {t.get('btn_volver', 'VOLVER')}"):
        st.session_state.pagina_actual = 'menu'
        st.rerun()

    with st.form("form_sat_completo"):
        # SECCIÓN 1: DATOS DEL CLIENTE
        st.subheader(t.get("cat1", "Datos del Servicio"))
        col1, col2 = st.columns(2)
        with col1:
            proyecto = st.text_input(t.get("proyecto", "Proyecto"), value=st.session_state.get('user_email', ''))
            empresa = st.text_input(t.get("cliente", "Empresa"))
        with col2:
            email_cont = st.text_input(t.get("email", "Email"))
            tel_cont = st.text_input(t.get("tel", "Teléfono"))

        st.markdown("---")

        # SECCIÓN 2: DATOS DEL EQUIPO (Llamando a la función restaurada)
        ns, ref, urgencia, falla = gestionar_equipos(t, "Baja")

        # SECCIÓN 3: ARCHIVOS ADJUNTOS
        st.markdown(f"### {t.get('fotos', 'Adjuntar Archivos')}")
        archivos = st.file_uploader(t.get('fotos', 'Subir fotos o videos'), accept_multiple_files=True)

        enviar = st.form_submit_button(t.get("btn_generar", "GENERAR TICKET"))

        if enviar:
            if proyecto and ns and falla:
                try:
                    id_ticket = str(uuid.uuid4())[:8].upper()
                    fecha_hoy = datetime.now().strftime("%Y-%m-%d %H:%M")

                    columnas = TICKETS_COLUMNS
                    row = {
                        "id": id_ticket,
                        "fecha": fecha_hoy,
                        "tipo": "sat",
                        "email": st.session_state.get("user_email"),
                        "pais": "",
                        "equipo": "",
                        "serial": "",
                        "fecha_averia": "",
                        "prioridad": "",
                        "descripcion": "",
                        "estado": "Abierto",
                        "proyecto": proyecto,
                        "empresa": empresa,
                        "email_contacto": email_cont,
                        "tel_contacto": tel_cont,
                        "ns": ns,
                        "ref": ref,
                        "urgencia": urgencia,
                        "falla": falla
                    }
                    append_row(conn, "Tickets", row, columnas)
                    
                    st.success(f"{t.get('exito', '✅ Enviado')} - ID: {id_ticket}")
                except Exception as e:
                    st.error(f"Error: {e}")
            else:
                st.warning(t.get("error_campos", "Faltan campos obligatorios"))
