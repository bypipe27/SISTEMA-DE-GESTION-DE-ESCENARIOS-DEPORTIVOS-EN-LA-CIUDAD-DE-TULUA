/**
 * Plantillas de correo HTML profesionales con identidad de marca
 */

/**
 * Plantilla de código de verificación para usuarios
 */
function plantillaCodigoVerificacionUsuario({ nombre, codigo, minutosExpira = 10 }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #ecfdf5 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header con gradiente y decoración -->
    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%); border-radius: 24px 24px 0 0; padding: 45px 35px; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(20, 184, 166, 0.35);">
      <!-- Círculos decorativos -->
      <div style="position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(20px);"></div>
      <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
      <div style="position: absolute; top: 50%; right: 15%; width: 60px; height: 60px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 1; text-align: center;">
        <!-- Logo badge -->
        <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); padding: 14px 28px; border-radius: 60px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ffffff, #f0fdfa); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <span style="font-size: 28px;">⚽</span>
          </div>
          <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Panel Reservas</span>
        </div>
        
        <!-- Icono principal -->
        <div style="margin: 25px auto; width: 90px; height: 90px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
          <span style="font-size: 48px;">🔐</span>
        </div>
        
        <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 900; text-shadow: 0 3px 15px rgba(0,0,0,0.15); letter-spacing: -0.5px;">
          Verifica tu cuenta
        </h1>
        <p style="margin: 12px 0 0 0; color: #ecfeff; font-size: 17px; font-weight: 500;">
          Estás a un paso de comenzar
        </p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div style="background: #ffffff; border-radius: 0 0 24px 24px; padding: 45px 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1);">
      
      <!-- Saludo personalizado -->
      <div style="text-align: center; margin-bottom: 35px;">
        <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 24px; font-weight: 700;">
          ¡Hola <span style="color: #14b8a6;">${nombre}</span>! 👋
        </h2>
        <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">
          Bienvenido al Sistema de Gestión de Escenarios Deportivos.<br>
          Usa el siguiente código para confirmar tu cuenta:
        </p>
      </div>

      <!-- Código de verificación destacado -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 3px solid #5eead4; border-radius: 20px; padding: 35px 25px; margin: 30px 0; text-align: center; box-shadow: 0 10px 30px rgba(20, 184, 166, 0.15); position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(94, 234, 212, 0.2); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(94, 234, 212, 0.15); border-radius: 50%;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(20, 184, 166, 0.1); padding: 10px 20px; border-radius: 30px; margin-bottom: 18px;">
            <span style="font-size: 20px;">🎫</span>
            <span style="color: #0f766e; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
              Tu Código
            </span>
          </div>
          
          <div style="background: #ffffff; border: 2px dashed #14b8a6; border-radius: 16px; padding: 20px; margin: 0 auto; max-width: 320px; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.1);">
            <div style="color: #0f172a; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 0 rgba(20, 184, 166, 0.1);">
              ${codigo}
            </div>
          </div>
          
          <div style="margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.1); padding: 12px 24px; border-radius: 30px;">
            <span style="font-size: 18px;">⏰</span>
            <span style="color: #dc2626; font-size: 15px; font-weight: 700;">
              Caduca en ${minutosExpira} minutos
            </span>
          </div>
        </div>
      </div>

      <!-- Instrucciones paso a paso -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 18px; padding: 28px; margin: 30px 0; border-left: 5px solid #f59e0b;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
            <span style="font-size: 20px;">📋</span>
          </div>
          <h3 style="margin: 0; color: #92400e; font-size: 18px; font-weight: 800;">
            Cómo verificar tu cuenta
          </h3>
        </div>
        
        <div style="margin-left: 52px;">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: 13px; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);">1</div>
            <p style="margin: 4px 0 0 0; color: #78350f; font-size: 15px; line-height: 1.6; font-weight: 500;">
              Regresa a la página de verificación
            </p>
          </div>
          
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: 13px; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);">2</div>
            <p style="margin: 4px 0 0 0; color: #78350f; font-size: 15px; line-height: 1.6; font-weight: 500;">
              Ingresa los <strong>6 dígitos</strong> del código
            </p>
          </div>
          
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: 13px; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);">3</div>
            <p style="margin: 4px 0 0 0; color: #78350f; font-size: 15px; line-height: 1.6; font-weight: 500;">
              ¡Listo! Tu cuenta estará <strong>activada</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Alerta de seguridad -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 24px; margin: 25px 0; border-left: 5px solid #3b82f6;">
        <div style="display: flex; gap: 15px;">
          <div style="flex-shrink: 0;">
            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              <span style="font-size: 22px;">🛡️</span>
            </div>
          </div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 800;">
              Protege tu cuenta
            </h4>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.7;">
              <strong>Nunca compartas este código</strong> con nadie. Nuestro equipo <strong>jamás te lo pedirá</strong> por teléfono, WhatsApp o redes sociales.
            </p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 35px 0;"></div>

      <!-- Información adicional -->
      <div style="text-align: center;">
        <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.7;">
          ¿No solicitaste este código? Puedes ignorar este mensaje.<br>
          Si tienes alguna duda, <a href="mailto:soporte@panelreservas.com" style="color: #14b8a6; text-decoration: none; font-weight: 700;">contáctanos</a>.
        </p>
      </div>
    </div>

    <!-- Footer mejorado -->
    <div style="text-align: center; margin-top: 35px; padding: 30px 20px;">
      <div style="margin-bottom: 25px;">
        <div style="display: inline-flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
          <a href="mailto:soporte@panelreservas.com" style="display: inline-flex; align-items: center; gap: 8px; color: #14b8a6; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 18px; background: rgba(20, 184, 166, 0.1); border-radius: 10px; transition: all 0.3s;">
            <span style="font-size: 16px;">📧</span>
            <span>Email</span>
          </a>
          <a href="tel:+573001234567" style="display: inline-flex; align-items: center; gap: 8px; color: #14b8a6; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 18px; background: rgba(20, 184, 166, 0.1); border-radius: 10px; transition: all 0.3s;">
            <span style="font-size: 16px;">📱</span>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
      
      <div style="padding: 25px; background: rgba(248, 250, 252, 0.8); border-radius: 16px; backdrop-filter: blur(10px);">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 32px;">⚽</span>
        </div>
        <div style="color: #475569; font-size: 13px; line-height: 1.8; font-weight: 500;">
          <strong style="color: #0f172a; font-size: 14px;">Universidad del Valle</strong><br>
          Sistema de Gestión de Escenarios Deportivos<br>
          Tuluá, Valle del Cauca, Colombia
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © 2025 Panel Reservas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Plantilla de código de verificación para proveedores
 */
function plantillaCodigoVerificacionProveedor({ nombre, codigo, minutosExpira = 10 }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Proveedor</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #e0e7ff 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header con gradiente morado para proveedores -->
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); border-radius: 24px 24px 0 0; padding: 45px 35px; position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(139, 92, 246, 0.35);">
      <!-- Círculos decorativos -->
      <div style="position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; background: rgba(255,255,255,0.1); border-radius: 50%; backdrop-filter: blur(20px);"></div>
      <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
      <div style="position: absolute; top: 50%; right: 15%; width: 60px; height: 60px; background: rgba(255,255,255,0.06); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 1; text-align: center;">
        <!-- Logo badge -->
        <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); padding: 14px 28px; border-radius: 60px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ffffff, #f5f3ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <span style="font-size: 28px;">⚽</span>
          </div>
          <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">Panel Reservas</span>
        </div>
        
        <!-- Icono principal -->
        <div style="margin: 25px auto; width: 90px; height: 90px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
          <span style="font-size: 48px;">🏢</span>
        </div>
        
        <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 900; text-shadow: 0 3px 15px rgba(0,0,0,0.15); letter-spacing: -0.5px;">
          Verificación de Proveedor
        </h1>
        <p style="margin: 12px 0 0 0; color: #f5f3ff; font-size: 17px; font-weight: 500;">
          Confirma tu cuenta empresarial
        </p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div style="background: #ffffff; border-radius: 0 0 24px 24px; padding: 45px 35px; box-shadow: 0 15px 50px rgba(0,0,0,0.1);">
      
      <!-- Saludo personalizado -->
      <div style="text-align: center; margin-bottom: 35px;">
        <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 24px; font-weight: 700;">
          ¡Bienvenido <span style="color: #8b5cf6;">${nombre}</span>! 🎉
        </h2>
        <p style="margin: 0; color: #64748b; font-size: 16px; line-height: 1.6;">
          Estás a punto de unirte como <strong>proveedor oficial</strong>.<br>
          Usa el siguiente código para activar tu cuenta:
        </p>
      </div>

      <!-- Código de verificación destacado -->
      <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 3px solid #c4b5fd; border-radius: 20px; padding: 35px 25px; margin: 30px 0; text-align: center; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15); position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: rgba(196, 181, 253, 0.2); border-radius: 50%;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(196, 181, 253, 0.15); border-radius: 50%;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(139, 92, 246, 0.1); padding: 10px 20px; border-radius: 30px; margin-bottom: 18px;">
            <span style="font-size: 20px;">🎫</span>
            <span style="color: #6d28d9; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
              Código de Acceso
            </span>
          </div>
          
          <div style="background: #ffffff; border: 2px dashed #8b5cf6; border-radius: 16px; padding: 20px; margin: 0 auto; max-width: 320px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1);">
            <div style="color: #0f172a; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 0 rgba(139, 92, 246, 0.1);">
              ${codigo}
            </div>
          </div>
          
          <div style="margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.1); padding: 12px 24px; border-radius: 30px;">
            <span style="font-size: 18px;">⏰</span>
            <span style="color: #dc2626; font-size: 15px; font-weight: 700;">
              Caduca en ${minutosExpira} minutos
            </span>
          </div>
        </div>
      </div>

      <!-- Beneficios del proveedor -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 18px; padding: 28px; margin: 30px 0; border-left: 5px solid #22c55e;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
            <span style="font-size: 20px;">✨</span>
          </div>
          <h3 style="margin: 0; color: #14532d; font-size: 18px; font-weight: 800;">
            Beneficios de ser proveedor
          </h3>
        </div>
        
        <div style="margin-left: 52px; space-y: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="color: #16a34a; font-size: 18px;">✓</span>
            <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">
              Panel de administración completo
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="color: #16a34a; font-size: 18px;">✓</span>
            <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">
              Gestión de reservas en tiempo real
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #16a34a; font-size: 18px;">✓</span>
            <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">
              Reportes y estadísticas detalladas
            </p>
          </div>
        </div>
      </div>

      <!-- Alerta de seguridad -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 24px; margin: 25px 0; border-left: 5px solid #3b82f6;">
        <div style="display: flex; gap: 15px;">
          <div style="flex-shrink: 0;">
            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              <span style="font-size: 22px;">🛡️</span>
            </div>
          </div>
          <div style="flex: 1;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 800;">
              Seguridad empresarial
            </h4>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.7;">
              Este código es <strong>confidencial</strong> y solo debe ser usado por ti. Protege tu cuenta de proveedor.
            </p>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 35px 0;"></div>

      <!-- Información adicional -->
      <div style="text-align: center;">
        <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.7;">
          ¿Necesitas ayuda? Nuestro equipo de soporte está disponible para asistirte.<br>
          <a href="mailto:proveedores@panelreservas.com" style="color: #8b5cf6; text-decoration: none; font-weight: 700;">Contactar soporte</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 35px; padding: 30px 20px;">
      <div style="margin-bottom: 25px;">
        <div style="display: inline-flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
          <a href="mailto:proveedores@panelreservas.com" style="display: inline-flex; align-items: center; gap: 8px; color: #8b5cf6; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 18px; background: rgba(139, 92, 246, 0.1); border-radius: 10px;">
            <span style="font-size: 16px;">📧</span>
            <span>Email</span>
          </a>
          <a href="tel:+573001234567" style="display: inline-flex; align-items: center; gap: 8px; color: #8b5cf6; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 18px; background: rgba(139, 92, 246, 0.1); border-radius: 10px;">
            <span style="font-size: 16px;">📱</span>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
      
      <div style="padding: 25px; background: rgba(248, 250, 252, 0.8); border-radius: 16px;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 32px;">⚽</span>
        </div>
        <div style="color: #475569; font-size: 13px; line-height: 1.8; font-weight: 500;">
          <strong style="color: #0f172a; font-size: 14px;">Universidad del Valle</strong><br>
          Sistema de Gestión de Escenarios Deportivos<br>
          Tuluá, Valle del Cauca, Colombia
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © 2025 Panel Reservas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Plantilla de confirmación de reserva para el cliente
 */
function plantillaConfirmacionReserva({ cliente_nombre, numero_reserva, cancha_nombre, fecha, hora_inicio, hora_fin, total, direccion, servicios_extra = [] }) {
  const serviciosHtml = servicios_extra.length > 0 ? `
    <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; border-left: 4px solid #14b8a6;">
      <h3 style="margin: 0 0 15px 0; color: #0f766e; font-size: 16px; font-weight: 600;">
        ⭐ Servicios Adicionales
      </h3>
      ${servicios_extra.map(servicio => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #99f6e4;">
          <span style="color: #0f766e; font-weight: 500;">${servicio.nombre}</span>
          <span style="color: #0f172a; font-weight: 600;">${servicio.precio_aplicado}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #ecfdf5 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header con marca -->
    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%); border-radius: 20px 20px 0 0; padding: 40px 30px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(20, 184, 166, 0.3);">
      <!-- Decoración de círculos -->
      <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -40px; left: -40px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
      
      <div style="position: relative; z-index: 1;">
        <div style="display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 50px; margin-bottom: 20px;">
          <span style="color: #ffffff; font-size: 32px; font-weight: bold;">⚽</span>
          <span style="color: #ffffff; font-size: 20px; font-weight: bold; margin-left: 10px;">Panel Reservas</span>
        </div>
        
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ¡Reserva Confirmada!
        </h1>
        <p style="margin: 10px 0 0 0; color: #ecfeff; font-size: 16px;">
          Tu cancha está lista para jugar
        </p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div style="background: #ffffff; border-radius: 0 0 20px 20px; padding: 40px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
      
      <!-- Saludo -->
      <p style="margin: 0 0 30px 0; color: #0f172a; font-size: 18px; line-height: 1.6;">
        Hola <strong style="color: #0f766e;">${cliente_nombre}</strong>,
      </p>

      <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">
        Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:
      </p>

      <!-- Badge de número de reserva -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 2px solid #5eead4; border-radius: 16px; padding: 25px; margin-bottom: 30px; text-align: center;">
        <div style="color: #0f766e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          🎫 Número de Reserva
        </div>
        <div style="color: #0f172a; font-size: 28px; font-weight: 800; font-family: 'Courier New', monospace;">
          ${numero_reserva}
        </div>
      </div>

      <!-- Detalles de la reserva -->
      <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin-bottom: 25px;">
        
        <!-- Cancha -->
        <div style="display: flex; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="font-size: 20px;">⚽</span>
          </div>
          <div style="flex: 1;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Cancha</div>
            <div style="color: #0f172a; font-size: 18px; font-weight: 700;">${cancha_nombre}</div>
          </div>
        </div>

        <!-- Fecha -->
        <div style="display: flex; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0d9488, #0f766e); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="font-size: 20px;">📅</span>
          </div>
          <div style="flex: 1;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Fecha</div>
            <div style="color: #0f172a; font-size: 18px; font-weight: 700;">${fecha}</div>
          </div>
        </div>

        <!-- Horario -->
        <div style="display: flex; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #0f766e, #115e59); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="font-size: 20px;">⏰</span>
          </div>
          <div style="flex: 1;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Horario</div>
            <div style="color: #0f172a; font-size: 18px; font-weight: 700;">${hora_inicio} - ${hora_fin}</div>
          </div>
        </div>

        <!-- Ubicación -->
        <div style="display: flex; align-items: flex-start; padding: 15px 0;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="font-size: 20px;">📍</span>
          </div>
          <div style="flex: 1;">
            <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Ubicación</div>
            <div style="color: #0f172a; font-size: 16px; font-weight: 600;">${direccion}</div>
          </div>
        </div>
      </div>

      ${serviciosHtml}

      <!-- Total -->
      <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 16px; padding: 25px; margin-top: 25px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 8px 20px rgba(20, 184, 166, 0.3);">
        <div>
          <div style="color: #ecfeff; font-size: 14px; font-weight: 600; margin-bottom: 4px;">💰 Total Pagado</div>
          <div style="color: #ffffff; font-size: 32px; font-weight: 800;">${total}</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">✓</span>
        </div>
      </div>

      <!-- Información importante -->
      <div style="margin-top: 35px; padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; border-left: 4px solid #f59e0b;">
        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 700; display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 8px;">💡</span>
          Información Importante
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
          <li style="margin-bottom: 10px; line-height: 1.6;">
            <strong>Llega 15 minutos antes</strong> del horario reservado
          </li>
          <li style="margin-bottom: 10px; line-height: 1.6;">
            <strong>Conserva tu número de reserva</strong> para cualquier consulta
          </li>
          <li style="line-height: 1.6;">
            La factura está adjunta en formato PDF
          </li>
        </ul>
      </div>

      <!-- Botón de acción -->
      <div style="text-align: center; margin-top: 35px;">
        <a href="https://panelreservas.com/mis-reservas" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #0d9488); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4); transition: all 0.3s;">
          Ver Mis Reservas
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding: 25px;">
      <div style="color: #64748b; font-size: 14px; margin-bottom: 15px;">
        ¿Necesitas ayuda? Contáctanos
      </div>
      <div style="margin-bottom: 20px;">
        <a href="mailto:soporte@panelreservas.com" style="color: #14b8a6; text-decoration: none; font-weight: 600; margin: 0 15px;">
          📧 Email
        </a>
        <a href="tel:+573001234567" style="color: #14b8a6; text-decoration: none; font-weight: 600; margin: 0 15px;">
          📱 WhatsApp
        </a>
      </div>
      <div style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
        © 2025 Universidad del Valle<br>
        Sistema de Gestión de Escenarios Deportivos<br>
        Tuluá, Valle del Cauca, Colombia
      </div>
    </div>

  </div>
</body>
</html>
  `;
}

/**
 * Plantilla de notificación para el propietario de la cancha
 */
function plantillaNotificacionPropietario({ propietario_nombre, cancha_nombre, cliente_nombre, cliente_telefono, fecha, hora_inicio, hora_fin, metodo_pago, total, servicios_extra = [], numero_reserva }) {
  const serviciosHtml = servicios_extra.length > 0 ? `
    <div style="margin-top: 20px; padding: 20px; background: #f0fdfa; border-radius: 12px; border-left: 4px solid #14b8a6;">
      <h4 style="margin: 0 0 15px 0; color: #0f766e; font-size: 15px; font-weight: 600;">
        ⭐ Servicios Adicionales
      </h4>
      ${servicios_extra.map(servicio => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #99f6e4; color: #0f172a;">
          <span>${servicio.nombre}</span>
          <span style="font-weight: 600;">${servicio.precio_aplicado}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); border-radius: 20px 20px 0 0; padding: 35px 30px; box-shadow: 0 10px 30px rgba(20, 184, 166, 0.3);">
      <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 10px 20px; border-radius: 50px; margin-bottom: 15px;">
        <span style="color: #ffffff; font-size: 28px;">⚽</span>
        <span style="color: #ffffff; font-size: 18px; font-weight: bold; margin-left: 8px;">Panel Reservas</span>
      </div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
        🎉 Nueva Reserva Recibida
      </h1>
      <p style="margin: 10px 0 0 0; color: #ecfeff; font-size: 15px;">
        Se ha registrado una nueva reserva en tu cancha
      </p>
    </div>

    <!-- Contenido -->
    <div style="background: #ffffff; border-radius: 0 0 20px 20px; padding: 35px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
      
      <p style="margin: 0 0 25px 0; color: #0f172a; font-size: 17px;">
        Hola <strong style="color: #0f766e;">${propietario_nombre}</strong>,
      </p>

      <!-- Cancha destacada -->
      <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 16px; padding: 20px; margin-bottom: 25px; text-align: center; box-shadow: 0 6px 20px rgba(20, 184, 166, 0.25);">
        <div style="color: #ecfeff; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          Tu Cancha
        </div>
        <div style="color: #ffffff; font-size: 24px; font-weight: 800;">
          ⚽ ${cancha_nombre}
        </div>
      </div>

      <!-- Detalles -->
      <div style="background: #f8fafc; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
        
        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">👤 Cliente</div>
          <div style="color: #0f172a; font-size: 17px; font-weight: 700;">${cliente_nombre}</div>
          <div style="color: #475569; font-size: 14px; margin-top: 4px;">📱 ${cliente_telefono || 'No proporcionado'}</div>
        </div>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">📅 Fecha y Hora</div>
          <div style="color: #0f172a; font-size: 16px; font-weight: 700;">${fecha}</div>
          <div style="color: #0f766e; font-size: 16px; font-weight: 700; margin-top: 4px;">⏰ ${hora_inicio} - ${hora_fin}</div>
        </div>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">💳 Método de Pago</div>
          <div style="color: #0f172a; font-size: 16px; font-weight: 700; text-transform: capitalize;">${metodo_pago}</div>
        </div>

        <div>
          <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">🎫 ID de Reserva</div>
          <div style="color: #0f172a; font-size: 16px; font-weight: 700; font-family: 'Courier New', monospace;">${numero_reserva}</div>
        </div>
      </div>

      ${serviciosHtml}

      <!-- Total -->
      <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 14px; padding: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 6px 20px rgba(20, 184, 166, 0.3);">
        <div>
          <div style="color: #ecfeff; font-size: 13px; font-weight: 600; margin-bottom: 4px;">💰 Total de la Reserva</div>
          <div style="color: #ffffff; font-size: 28px; font-weight: 800;">${total}</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          ✓
        </div>
      </div>

      <!-- Botón -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://panelreservas.com/admin/reservas" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #0d9488); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);">
          Ver en el Panel
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 25px; padding: 20px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
      © 2025 Universidad del Valle<br>
      Sistema de Gestión de Escenarios Deportivos<br>
      Tuluá, Valle del Cauca, Colombia
    </div>

  </div>
</body>
</html>
  `;
}

module.exports = {
  plantillaCodigoVerificacionUsuario,
  plantillaCodigoVerificacionProveedor,
  plantillaConfirmacionReserva,
  plantillaNotificacionPropietario
};
