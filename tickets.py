# ==========================================
# ARCHIVO: tickets.py
# PROYECTO: TicketV0
# VERSIÓN: v1.0 (Original Hoy 16-Ene)
# FECHA: 16-Ene-2026
# DESCRIPCIÓN: Interfaz para la creación y envío de tickets técnicos.
# ==========================================

import streamlit as st
import pandas as pd
from datetime import datetime

from gsheets_utils import append_row

TICKETS_COLUMNS = [
    "id", "fecha", "tipo", "email", "pais", "equipo", "serial",
    "fecha_averia", "prioridad", "descripcion", "estado",
    "proyecto", "empresa", "email_contacto", "tel_contacto",
    "ns", "ref", "urgencia", "falla"
]

def interfaz_tickets(conn, t):
    """Muestra el formulario para reportar un nuevo ticket."""
    st.markdown(f"### 📝 {t.get('ticket_main_title', 'Gestión de Tickets')}")
    st.info(f"Sesión iniciada como: {st.session_state.get('user_email')}")

    with st.form("ticket_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            pais = st.selectbox(t.get('label_country', 'País'), ["España", "Portugal", "Otros"])
            equipo = st.selectbox(t.get('label_device', 'Equipo'), ["Controlador ITC", "Óptica LED", "Pulsador", "Otros"])
            serial = st.text_input(t.get('label_serial', 'Número de Serial'))

        with col2:
            fecha_averia = st.date_input(t.get('label_date', 'Fecha de la Avería'))
            prioridad = st.select_slider(t.get('label_priority', 'Prioridad'), options=["Baja", "Media", "Alta"])
            
        descripcion = st.text_area(t.get('label_desc', 'Descripción del Problema'))
        
        submit = st.form_submit_button(t.get('btn_send_ticket', 'ENVIAR TICKET'))

        if submit:
            if not descripcion or not serial:
                st.warning("⚠️ Por favor, rellena los campos obligatorios.")
                return

            try:
                columnas = TICKETS_COLUMNS
                row = {
                    "id": datetime.now().strftime("%Y%m%d%H%M%S"),
                    "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "tipo": "rapido",
                    "email": st.session_state.get("user_email"),
                    "pais": pais,
                    "equipo": equipo,
                    "serial": serial,
                    "fecha_averia": str(fecha_averia),
                    "prioridad": prioridad,
                    "descripcion": descripcion,
                    "estado": "Abierto",
                    "proyecto": "",
                    "empresa": "",
                    "email_contacto": "",
                    "tel_contacto": "",
                    "ns": "",
                    "ref": "",
                    "urgencia": "",
                    "falla": ""
                }
                append_row(conn, "Tickets", row, columnas)
                st.success("✅ Ticket enviado correctamente al departamento SAT.")
            except Exception as e:
                st.error(f"Error al guardar ticket: {e}")

    if st.sidebar.button(t.get('btn_logout', 'Cerrar Sesión')):
        st.session_state.usuario = None
        st.session_state.rol = None
        st.session_state.user_email = None
        st.rerun()
