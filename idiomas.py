# =============================================================================
# ARCHIVO: idiomas.py
# VERSIÓN: 5.0.0 (Universal Real)
# =============================================================================
import pandas as pd

try:
    from deep_translator import GoogleTranslator
    TIENE_TRADUCTOR = True
except:
    TIENE_TRADUCTOR = False

IDIOMAS_DISPONIBLES = pd.DataFrame({
    'nombre': [
        'Español', 'English', 'Deutsch', 'Français', 'Italiano', 'Português',
        'Euskara', 'Русский', '中文 (Chino)', '日本語 (Japonés)', 'العربية (Árabe)', 'עברית (Hebreo)'
    ],
    'codigo': ['es', 'en', 'de', 'fr', 'it', 'pt', 'eu', 'ru', 'zh-CN', 'ja', 'ar', 'he']
})


def obtener_lista_idiomas():
    # Lista base amplia
    return IDIOMAS_DISPONIBLES.copy()


def normalizar_codigo_idioma(lang_code):
    """Normaliza códigos como es-ES, en-US, pt-BR, zh, etc."""
    if not lang_code:
        return 'es'
    code = str(lang_code).lower()
    if code.startswith('es'):
        return 'es'
    if code.startswith('en'):
        return 'en'
    if code.startswith('de'):
        return 'de'
    if code.startswith('fr'):
        return 'fr'
    if code.startswith('it'):
        return 'it'
    if code.startswith('pt'):
        return 'pt'
    if code.startswith('eu'):
        return 'eu'
    if code.startswith('ru'):
        return 'ru'
    if code.startswith('zh'):
        return 'zh-CN'
    if code.startswith('ja'):
        return 'ja'
    if code.startswith('ar'):
        return 'ar'
    if code.startswith('he') or code.startswith('iw'):
        return 'he'
    return 'es'

def traducir_interfaz(target_lang='es'):
    base = {
        'login_tit': 'Portal SAT',
        'reg_tit': 'Alta de Usuario',
        'login_user_or_email': 'Usuario o Email',
        'login_pass': 'Contraseña',
        'login_btn': 'Entrar',
        'p1_tit': 'Datos Personales',
        'p2_tit': 'Datos de Contacto',
        'p3_tit': 'Seguridad',
        'p4_tit': 'Términos Legales',
        'nombre': 'Nombre',
        'apellido': 'Apellido',
        'cliente': 'Organización / Empresa',
        'pais': 'País de Residencia',
        'tel': 'Teléfono Móvil',
        'email': 'Correo Electrónico',
        'pass': 'Contraseña',
        'pass_rep': 'Confirmar Contraseña',
        'acepto': 'He leído y acepto los términos',
        'btn_entrar': 'Acceder',
        'btn_ir_registro': 'Crear Cuenta',
        'btn_registro_final': 'Finalizar Registro',
        'btn_volver': 'Regresar',
        'error_campos': 'Por favor corrija los campos marcados en rojo',
        'exito_reg': 'Registro completado exitosamente',

        'reg_usuario': 'Usuario*',
        'reg_nombre': 'Nombre Completo*',
        'reg_email': 'Email*',
        'reg_pass': 'Contraseña*',
        'reg_pass_conf': 'Confirmar Contraseña*',
        'reg_rol': 'Rol',
        'reg_btn': 'Crear Cuenta',
        'reg_campos_req': 'Todos los campos marcados con * son obligatorios',
        'reg_pass_mismatch': 'Las contraseñas no coinciden',
        'reg_duplicado': '❌ ERROR: {msg}',
        'reg_exito': '✅ Usuario creado exitosamente',
        'reg_info': 'Por favor inicie sesión',
        'reg_email_warn': '⚠️ Usuario creado, pero no se pudo enviar el correo.',

        'menu_tit': 'Menú',
        'menu_sub': 'Seleccione una opción',
        'btn_perfil': 'Mis Datos',
        'btn_tickets': 'Tickets Rápidos',
        'btn_tickets_sat': 'Reporte SAT',
        'btn_repuestos': 'Repuestos',
        'btn_equipos_nuevos': 'Equipos Nuevos',
        'btn_logout': 'Cerrar Sesión',

        'perfil_tit': 'Mis Datos',
        'perfil_nombre': 'Nombre Completo',
        'perfil_email': 'Email',
        'perfil_usuario': 'Usuario',
        'perfil_rol': 'Rol',
        'perfil_pass_new': 'Nueva Contraseña',
        'perfil_pass_confirm': 'Confirmar Nueva Contraseña',
        'perfil_guardar': 'Guardar Cambios',
        'perfil_update_ok': '✅ Datos actualizados',
        'perfil_update_err': 'No se pudo actualizar: {msg}',
        'perfil_pass_mismatch': 'Las contraseñas no coinciden',

        'ticket_main_title': 'Gestión de Tickets',
        'label_country': 'País',
        'label_device': 'Equipo',
        'label_serial': 'Número de Serial',
        'label_date': 'Fecha de la Avería',
        'label_priority': 'Prioridad',
        'label_desc': 'Descripción del Problema',
        'btn_send_ticket': 'ENVIAR TICKET',

        'titulo_portal': 'Reporte SAT',
        'cat1': 'Datos del Servicio',
        'proyecto': 'Proyecto',
        'cat2': 'Detalle de Equipos',
        'pegatina': 'Consulte la etiqueta en el lateral del equipo.',
        'ns_titulo': 'N.S. (Número de Serie)',
        'cat3': 'Prioridad y Fallo',
        'u1': 'Baja',
        'u2': 'Normal',
        'u3': 'Alta',
        'u4': 'Urgente',
        'u5': 'Muy Urgente',
        'u6': 'Crítica',
        'urg_instruccion': 'Nivel de Urgencia',
        'desc_instruccion': 'Descripción del fallo',
        'desc_placeholder': 'Escriba aquí...',
        'fotos': 'Adjuntar Archivos',
        'btn_generar': 'GENERAR TICKET',
        'exito': '✅ Enviado',

        'repuestos_tit': 'Repuestos',
        'repuestos_item': 'Repuesto / Pieza',
        'repuestos_qty': 'Cantidad',
        'repuestos_desc': 'Detalles / Observaciones',
        'repuestos_enviar': 'Solicitar Repuesto',
        'repuestos_ok': '✅ Solicitud enviada',
        'repuestos_err': 'Error al guardar: {msg}'
    }

    if target_lang == 'es': return base

    if TIENE_TRADUCTOR:
        try:
            tr = GoogleTranslator(source='es', target=target_lang)
            keys = list(base.keys())
            values = list(base.values())
            tr_values = tr.translate_batch(values)
            return dict(zip(keys, tr_values))
        except: return base
    return base

