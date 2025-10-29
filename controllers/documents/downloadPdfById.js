import Documents from '../../models/Documents.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Genera un PDF sencillo con datos clave de la licencia.
// GET /api/documents/:idLicense/pdf
export default async function downloadPdfById(req, res) {
  try {
    const { idLicense } = req.params;
    const doc = await Documents.findOne({ idLicense }).lean({ defaults: true });
    if (!doc) return res.status(404).json({ message: 'No se encontró la licencia.' });

    // Crear PDF básico
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const draw = (text, x, y, size = 12, bold = false) => {
      page.drawText(String(text || ''), {
        x, y, size,
        font: bold ? helvBold : helv,
        color: rgb(0, 0, 0),
      });
    };

    let y = 800;
    draw('LICENCIA FEDERAL DIGITAL DE CONDUCTOR', 40, y, 16, true); y -= 30;
    draw('ID de Licencia: ' + (doc.idLicense || ''), 40, y); y -= 18;
    draw('Nombre: ' + (doc.name || ''), 40, y); y -= 18;
    draw('CURP: ' + (doc.curp || ''), 40, y); y -= 18;
    draw('Categorías: ' + (Array.isArray(doc.categoriasFederales) ? doc.categoriasFederales.join('/') : (doc.categoriasTexto || '')), 40, y); y -= 18;
    if (doc.folioMedico) { draw('Folio médico: ' + doc.folioMedico, 40, y); y -= 18; }
    if (doc.numeroAptitudPsicofisica) { draw('No. aptitud psicofísica: ' + doc.numeroAptitudPsicofisica, 40, y); y -= 18; }
    if (doc.validityText) { draw('Validez:', 40, y, 12, true); y -= 16; draw(doc.validityText, 40, y); y -= 18; }

    draw('Expedición: ' + (doc.expeditionDate || ''), 40, y); y -= 18;
    draw('Vigencia: ' + (doc.expirationDate || ''), 40, y); y -= 18;

    draw('Generado por el sistema', 40, 40, 10);

    const bytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="licencia-${doc.idLicense}.pdf"`);
    res.send(Buffer.from(bytes));
  } catch (error) {
    res.status(500).json({ message: 'Error al generar el PDF', error: error.message });
  }
}
