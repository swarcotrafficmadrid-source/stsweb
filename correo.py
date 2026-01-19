# =============================================================================
# ARCHIVO: correo.py
# VERSIÓN: ticketV2 (Optimizado para Relay SMTP Swarco)
# FECHA: 18-Ene-2026
# =============================================================================
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import streamlit as st


def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        # 1. Traer datos
        user = st.secrets["emails"]["user"]
        password = st.secrets["emails"]["password"]

        # 2. Crear mensaje
        msg = MIMEMultipart()
        msg["From"] = user
        msg["To"] = destinatario
        msg["Subject"] = "Bienvenida - Gestión de Tickets SWARCO"

        cuerpo = f"Hola {nombre},\n\nTu usuario es: {usuario}\nTu clave es: {password_real}"
        msg.attach(MIMEText(cuerpo, "plain"))

        # 3. Conexión Directa (Como al principio)
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
        server.starttls()  # Seguridad obligatoria
        server.login(user, password)
        server.send_message(msg)
        server.quit()

        return True
    except Exception as e:
        st.error(f"Error crítico: {e}")
        return False
