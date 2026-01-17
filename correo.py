# =============================================================================
# ARCHIVO: correo.py
# VERSIÓN: ticketV1 (Soporte para Alias ticket@swarcotrafficspain.com)
# =============================================================================
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import streamlit as st

def enviar_correo_bienvenida(destinatario, nombre, usuario, password_real):
    try:
        # 1. Recuperar secretos (Tu cuenta REAL de Aitor/SAT)
        # El sistema se autentica con la cuenta principal que paga la licencia
        email_real_user = st.secrets["smtp"]["email"]
        email_pass = st.secrets["smtp"]["password"]
        
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # 2. DEFINIR EL ALIAS (Aquí está el cambio V1)
        # Aunque nos logueamos con tu cuenta principal, el correo saldrá firmado por este alias.
        email_alias = "ticket@swarcotrafficspain.com"

        # 3. Construir Mensaje
        msg = MIMEMultipart()
        msg['From'] = email_alias  # <--- CAMBIO CLAVE: Sale como ticket@
        msg['To'] = destinatario
        msg['Subject'] = "Bienvenida - Gestión de Tickets SWARCO Traffic Madrid"

        cuerpo = f"""
        Estimado/a {nombre},

        Le damos la bienvenida a la plataforma de gestión SAT de Swarco Traffic Madrid.
        
        Sus credenciales de acceso son:
        ------------------------------------------------
        Usuario:    {usuario}
        Contraseña: {password_real}
        ------------------------------------------------
        
        Por favor, conserve estas credenciales en un lugar seguro.

        Atentamente,
        Soporte Técnico SWARCO
        """
        msg.attach(MIMEText(cuerpo, 'plain'))

        # 4. Conexión SMTP Segura
        server = smtplib.SMTP(smtp_server, smtp_port)
        # server.set_debuglevel(1) # Descomentar solo si hay errores para ver el log
        server.ehlo()
        server.starttls()
        server.ehlo()
        
        # IMPORTANTE: Nos logueamos con el usuario REAL (Aitor/SAT), pero enviamos el mensaje creado arriba
        server.login(email_real_user, email_pass)
        server.send_message(msg)
        server.quit()
        
        return True

    except Exception as e:
        print(f"❌ ERROR SMTP DETALLADO: {e}")
        st.error(f"Error técnico enviando correo: {e}")
        return False
