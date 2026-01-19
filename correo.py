# =============================================================================
# ARCHIVO: correo.py
# VERSIÓN: ticketV2 (Optimizado para Relay SMTP Swarco)
# FECHA: 18-Ene-2026
# =============================================================================
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import streamlit as st


def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        # 1. Credenciales directas de los secrets o variables de entorno
        email_user = os.environ.get("EMAIL_USER") or st.secrets["emails"]["user"]
        email_pass = os.environ.get("EMAIL_PASSWORD") or st.secrets["emails"]["password"]

        # 2. Construir el mensaje
        msg = MIMEMultipart()
        msg["From"] = email_user
        msg["To"] = destinatario
        msg["Subject"] = "Bienvenida - Gestión de Tickets SWARCO"

        cuerpo = f"Hola {nombre},\n\nBienvenido. Tu usuario es {usuario} y tu clave {password_real}."
        msg.attach(MIMEText(cuerpo, "plain"))

        # 3. Conexión SMTP estándar
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=20)
        server.starttls()
        server.login(email_user, email_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        st.error(f"Error enviando correo: {e}")
        return False
