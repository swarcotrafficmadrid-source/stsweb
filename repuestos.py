# =============================================================================
# ARCHIVO: repuestos.py
# PROYECTO: Sistema de Gestión SAT - SWARCO Traffic Spain
# VERSIÓN: 0.1.0 (Coming Soon)
# DESCRIPCIÓN: Módulo para la gestión de piezas y repuestos (En desarrollo).
# =============================================================================
import streamlit as st
import estilos
from datetime import datetime

from gsheets_utils import append_row

def mostrar_repuestos(conn, t):
    estilos.mostrar_logo()
    st.markdown(f'<p class="swarco-title">📦 {t.get("repuestos_tit", "Repuestos")}</p>', unsafe_allow_html=True)

    with st.form("repuestos_form"):
        col1, col2 = st.columns(2)
        with col1:
            item = st.text_input(t.get("repuestos_item", "Repuesto / Pieza"))
            qty = st.number_input(t.get("repuestos_qty", "Cantidad"), min_value=1, step=1, value=1)
        with col2:
            descripcion = st.text_area(t.get("repuestos_desc", "Detalles / Observaciones"))

        submit = st.form_submit_button(t.get("repuestos_enviar", "Solicitar Repuesto"))

    if submit:
        if not item:
            st.warning(t.get("error_campos", "Por favor corrija los campos marcados en rojo"))
            return
        try:
            columnas = [
                "id", "fecha", "usuario", "email",
                "repuesto", "cantidad", "descripcion", "estado"
            ]
            row = {
                "id": datetime.now().strftime("%Y%m%d%H%M%S"),
                "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "usuario": st.session_state.get("usuario"),
                "email": st.session_state.get("user_email"),
                "repuesto": item,
                "cantidad": int(qty),
                "descripcion": descripcion,
                "estado": "Pendiente"
            }
            append_row(conn, "Repuestos", row, columnas)
            st.success(t.get("repuestos_ok", "✅ Solicitud enviada"))
        except Exception as e:
            st.error(t.get("repuestos_err", "Error al guardar: {msg}").format(msg=str(e)))

    if st.button(f"⬅️ {t.get('btn_volver', 'VOLVER')}"):
        st.session_state.pagina_actual = 'menu'
        st.rerun()
