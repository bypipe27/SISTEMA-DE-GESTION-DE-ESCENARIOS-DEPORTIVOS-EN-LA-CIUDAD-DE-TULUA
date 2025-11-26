const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generar factura PDF y retornar el buffer
 */
async function generarFacturaPDF(facturaData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      // Capturar el PDF en memoria
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header minimalista con marca de agua
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#10b981')
        .text('FACTURA', 50, 50)
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Electrónica', 50, 80)
        .moveDown(2);

      // Información de la empresa - minimalista
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Sistema de Gestión de Escenarios Deportivos', 350, 50, { align: 'right', width: 195 })
        .text('Tuluá, Valle del Cauca', 350, 63, { align: 'right', width: 195 })
        .text('Universidad del Valle', 350, 76, { align: 'right', width: 195 })
        .moveDown(3);

      // Línea divisoria minimalista
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, 120)
        .lineTo(545, 120)
        .stroke()
        .moveDown(1.5);

      // Información de la factura - diseño minimalista
      const startY = 140;
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('NÚMERO', 50, startY)
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(facturaData.numero_factura, 50, startY + 12)
        
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('FECHA', 200, startY)
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(formatearFecha(facturaData.fecha_emision || new Date()), 200, startY + 12)
        .moveDown(3);

      // Información del cliente - minimalista
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('FACTURADO A', 50, doc.y)
        .moveDown(0.7);

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text(facturaData.cliente_nombre, 50, doc.y)
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(facturaData.cliente_email, 50, doc.y)
        .moveDown(0.2);

      doc
        .text(facturaData.cliente_telefono || 'N/A', 50, doc.y)
        .moveDown(2.5);

      // Tabla de items - minimalista
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text('DETALLE', 50, doc.y)
        .moveDown(1);

      // Encabezado de tabla minimalista
      const tableTop = doc.y;
      const itemColumn = 50;
      const descriptionColumn = 170;
      const priceColumn = 430;
      const totalColumn = 495;

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#64748b');

      doc
        .text('#', itemColumn, tableTop)
        .text('DESCRIPCIÓN', descriptionColumn, tableTop)
        .text('PRECIO', priceColumn, tableTop)
        .text('TOTAL', totalColumn, tableTop, { align: 'right' });

      // Línea sutil debajo del encabezado
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, tableTop + 13)
        .lineTo(545, tableTop + 13)
        .stroke();

      // Items - minimalista
      let y = tableTop + 22;
      doc.fontSize(9).font('Helvetica').fillColor('#0f172a');

      const items = typeof facturaData.items === 'string' 
        ? JSON.parse(facturaData.items) 
        : facturaData.items;

      items.forEach((item, index) => {
        // Fondo alternado sutil
        if (index % 2 === 0) {
          doc
            .fillColor('#f8fafc')
            .rect(45, y - 3, 505, 22)
            .fill();
        }
        
        doc
          .fillColor('#64748b')
          .fontSize(9)
          .text((index + 1).toString(), itemColumn, y)
          .fillColor('#0f172a')
          .text(item.descripcion, descriptionColumn, y, { width: 240 })
          .fillColor('#64748b')
          .text(formatearPrecio(item.precio), priceColumn, y)
          .fillColor('#0f172a')
          .font('Helvetica-Bold')
          .text(formatearPrecio(item.total || item.precio), totalColumn, y, { align: 'right' })
          .font('Helvetica');
        
        y += 25;
      });

      // Espacio antes de totales
      y += 15;

      // Línea sutil antes de totales
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(380, y)
        .lineTo(545, y)
        .stroke();

      y += 15;

      // Totales - minimalista
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Subtotal', 430, y)
        .fillColor('#0f172a')
        .text(formatearPrecio(facturaData.subtotal), 495, y, { align: 'right' });

      y += 18;
      doc
        .fillColor('#64748b')
        .text('IVA (19%)', 430, y)
        .fillColor('#0f172a')
        .text(formatearPrecio(facturaData.impuestos), 495, y, { align: 'right' });

      y += 10;
      // Línea antes del total - minimalista
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(380, y)
        .lineTo(545, y)
        .stroke();

      y += 15;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#10b981')
        .text('TOTAL', 430, y)
        .fontSize(16)
        .text(formatearPrecio(facturaData.total), 495, y, { align: 'right' });

      // Nota al pie - minimalista
      const footerY = doc.page.height - 80;
      
      // Línea superior del footer
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, footerY - 20)
        .lineTo(545, footerY - 20)
        .stroke();

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text(
          'Factura electrónica generada automáticamente',
          50,
          footerY,
          { align: 'center', width: 495 }
        )
        .fontSize(7)
        .fillColor('#cbd5e0')
        .text(
          '© 2025 Universidad del Valle · Sistema de Gestión de Escenarios Deportivos',
          50,
          footerY + 15,
          { align: 'center', width: 495 }
        );

      // Finalizar el documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Formatear precio a COP
 */
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

module.exports = {
  generarFacturaPDF,
  formatearPrecio,
  formatearFecha
};
