"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`ERP360 - INNOVAQ Solutions | ${new Date().toLocaleDateString("es-MX")}`, 14, 30);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 36,
    theme: "grid",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
  });

  doc.save(`${filename}.pdf`);
}
