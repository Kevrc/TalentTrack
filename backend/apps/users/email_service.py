"""
Servicio de envío de correos electrónicos para TalentTrack
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags


def enviar_credenciales_rrhh(usuario_email: str, contraseña_temporal: str, nombre_empresa: str):
    """
    Envía las credenciales de acceso inicial al nuevo Admin RRHH
    
    Args:
        usuario_email: Email del usuario RRHH
        contraseña_temporal: Contraseña temporal generada
        nombre_empresa: Nombre de la empresa
    """
    
    contexto = {
        'email': usuario_email,
        'contraseña': contraseña_temporal,
        'nombre_empresa': nombre_empresa,
        'url_login': f"{settings.FRONTEND_URL}/auth/login",
        'aplicacion': 'TalentTrack',
    }
    
    asunto = f"Bienvenido a TalentTrack - Administrador RRHH de {nombre_empresa}"
    
    # Renderizar template HTML
    html_message = render_to_string('emails/credenciales_rrhh.html', contexto)
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=asunto,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario_email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de credenciales enviado a {usuario_email}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar email a {usuario_email}: {str(e)}")
        return False


def enviar_invitacion_empleado(usuario_email: str, nombre_empresa: str, rol: str):
    """
    Envía invitación a un nuevo empleado para completar su perfil
    
    Args:
        usuario_email: Email del nuevo usuario
        nombre_empresa: Nombre de la empresa
        rol: Rol del usuario (MANAGER, EMPLEADO, etc)
    """
    
    contexto = {
        'email': usuario_email,
        'nombre_empresa': nombre_empresa,
        'rol': rol,
        'url_login': f"{settings.FRONTEND_URL}/auth/login",
        'aplicacion': 'TalentTrack',
    }
    
    asunto = f"Invitación a TalentTrack - {nombre_empresa}"
    
    html_message = render_to_string('emails/invitacion_empleado.html', contexto)
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=asunto,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario_email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de invitación enviado a {usuario_email}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar email a {usuario_email}: {str(e)}")
        return False


def enviar_reset_password(usuario_email: str, token_reset: str):
    """
    Envía email para reset de contraseña
    
    Args:
        usuario_email: Email del usuario
        token_reset: Token para reset de contraseña
    """
    
    contexto = {
        'email': usuario_email,
        'reset_link': f"{settings.FRONTEND_URL}/auth/reset-password?token={token_reset}",
        'aplicacion': 'TalentTrack',
    }
    
    asunto = "Restablecer contraseña en TalentTrack"
    
    html_message = render_to_string('emails/reset_password.html', contexto)
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject=asunto,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[usuario_email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de reset enviado a {usuario_email}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar email a {usuario_email}: {str(e)}")
        return False
