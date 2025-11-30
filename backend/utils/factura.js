const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generar factura PDF y retornar el buffer
 */
async function generarFacturaPDF(facturaData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const chunks = [];

      // Capturar el PDF en memoria
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 40;

      // ========== HEADER CON BANNER TEAL ==========
      doc.rect(0, 0, pageWidth, 150).fill('#14b8a6');

      // Decoración circular
      doc.circle(520, 40, 50).fillOpacity(0.12).fill('#ffffff');
      doc.circle(550, 95, 40).fillOpacity(0.08).fill('#ffffff');
      doc.circle(35, 105, 45).fillOpacity(0.1).fill('#ffffff');
      doc.fillOpacity(1);

      // Logo y título principal - Círculo como logo
      doc.circle(70, 62, 28).lineWidth(4).strokeColor('#ffffff').stroke();
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#ffffff').text('PR', 58, 53);
      
      doc.fontSize(34).font('Helvetica-Bold').fillColor('#ffffff').text('Panel Reservas', 110, 42);
      doc.fontSize(10).font('Helvetica').fillColor('#ecfeff').text('Sistema de Gestion de Escenarios Deportivos', 110, 80);

      // Badge FACTURA
      doc.roundedRect(410, 48, 145, 55, 10).fill('#ffffff');
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#14b8a6').text('FACTURA', 420, 58, { width: 125, align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('Electrónica', 420, 83, { width: 125, align: 'center' });

      // ========== INFORMACIÓN SUPERIOR ==========
      let yPos = 180;

      // Información de factura centrada
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f766e').text('INFORMACION DE FACTURA', margin, yPos);

      // Badge número de factura con fecha en línea horizontal
      doc.roundedRect(margin, yPos + 28, pageWidth - (margin * 2), 58, 10).fill('#f0fdfa');
      
      // Número de factura (izquierda)
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Numero de Factura:', margin + 20, yPos + 42);
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0f766e').text(facturaData.numero_factura, margin + 20, yPos + 60);

      // Fecha (derecha)
      const fechaFormateada = formatearFecha(facturaData.fecha_emision || new Date());
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('Fecha:', pageWidth - 220, yPos + 42);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(fechaFormateada, pageWidth - 220, yPos + 60);

      // ========== DATOS DEL CLIENTE ==========
      yPos = 280;

      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 110, 12).lineWidth(2.5).fillAndStroke('#ecfdf5', '#5eead4');
      
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f766e').text('FACTURADO A', margin + 20, yPos + 18);
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(facturaData.cliente_nombre, margin + 20, yPos + 42);
      
      doc.fontSize(10).font('Helvetica').fillColor('#475569')
         .text(`Email:  ${facturaData.cliente_email}`, margin + 20, yPos + 68)
         .text(`Tel:    ${facturaData.cliente_telefono || 'No proporcionado'}`, margin + 20, yPos + 86);

      // ========== TABLA DE DETALLES ==========
      yPos = 425;

      doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f766e').text('DETALLE DE LA RESERVA', margin, yPos);

      // Header tabla con fondo completo
      yPos += 32;
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 36, 8).fill('#14b8a6');
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
         .text('#', margin + 15, yPos + 12)
         .text('DESCRIPCIÓN', margin + 60, yPos + 12)
         .text('PRECIO', pageWidth - 180, yPos + 12)
         .text('TOTAL', pageWidth - 95, yPos + 12, { width: 55, align: 'right' });

      // Items
      yPos += 46;
      const items = typeof facturaData.items === 'string' ? JSON.parse(facturaData.items) : facturaData.items;

      items.forEach((item, index) => {
        const itemHeight = item.detalle ? 50 : 40;
        
        // Fondo alternado
        if (index % 2 === 0) {
          doc.rect(margin, yPos - 5, pageWidth - (margin * 2), itemHeight).fillOpacity(0.5).fill('#f0fdfa');
          doc.fillOpacity(1);
        }

        // Círculo con número
        doc.circle(margin + 22, yPos + 8, 13).fill('#14b8a6');
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff').text((index + 1).toString(), margin + 17, yPos + 3, { width: 10, align: 'center' });

        // Descripción sin emojis
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(item.descripcion, margin + 60, yPos + 3, { width: 280 });

        // Detalle si existe
        if (item.detalle) {
          doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(item.detalle, margin + 80, yPos + 20, { width: 260 });
        }

        // Precio
        doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(formatearPrecio(item.precio), pageWidth - 180, yPos + 6);

        // Total
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f766e').text(formatearPrecio(item.total || item.precio), pageWidth - 95, yPos + 5, { width: 55, align: 'right' });

        yPos += itemHeight;
      });

      // ========== RESUMEN DE TOTALES ==========
      yPos += 25;

      // Línea separadora
      doc.moveTo(pageWidth - 230, yPos).lineTo(pageWidth - margin, yPos).lineWidth(2).strokeColor('#5eead4').stroke();

      yPos += 20;

      // Subtotal
      doc.fontSize(11).font('Helvetica').fillColor('#64748b').text('Subtotal', pageWidth - 220, yPos);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(formatearPrecio(facturaData.subtotal), pageWidth - 120, yPos, { width: 80, align: 'right' });

      yPos += 26;

      // IVA
      doc.font('Helvetica').fillColor('#64748b').text('IVA (19%)', pageWidth - 220, yPos);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(formatearPrecio(facturaData.impuestos), pageWidth - 120, yPos, { width: 80, align: 'right' });

      yPos += 30;

      // TOTAL - Caja destacada
      doc.roundedRect(pageWidth - 230, yPos - 8, 190, 55, 12).fill('#14b8a6');
      
      doc.fontSize(15).font('Helvetica-Bold').fillColor('#ffffff').text('TOTAL A PAGAR', pageWidth - 218, yPos + 5);
      doc.fontSize(26).font('Helvetica-Bold').fillColor('#ffffff').text(formatearPrecio(facturaData.total), pageWidth - 218, yPos + 25, { width: 170, align: 'right' });

      // ========== FOOTER ==========
      const footerY = pageHeight - 115;

      // Banda superior
      doc.rect(0, footerY - 12, pageWidth, 4).fill('#14b8a6');

      // Textos del footer
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
         .text('Factura electronica generada automaticamente', 0, footerY + 8, { align: 'center', width: pageWidth });

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f766e')
         .text('Gracias por tu reserva!', 0, footerY + 32, { align: 'center', width: pageWidth });

      doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
         .text('2025 Universidad del Valle - Sistema de Gestion de Escenarios Deportivos', 0, footerY + 58, { align: 'center', width: pageWidth })
         .text('Tulua, Valle del Cauca, Colombia', 0, footerY + 72, { align: 'center', width: pageWidth });

      // Círculos decorativos
      doc.circle(35, footerY + 55, 20).fillOpacity(0.08).fill('#14b8a6');
      doc.circle(pageWidth - 35, footerY + 55, 20).fillOpacity(0.08).fill('#14b8a6');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Formatear precio a COP sin símbolo
 */
function formatearPrecio(precio) {
  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(precio);
  return `$ ${formatted}`;
}

/**
 * Formatear fecha sin hora
 */
function formatearFecha(fecha) {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const dia = date.getDate();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const mes = meses[date.getMonth()];
  const anio = date.getFullYear();
  
  return `${dia} de ${mes} de ${anio}`;
}

module.exports = {
  generarFacturaPDF,
  formatearPrecio,
  formatearFecha
};
