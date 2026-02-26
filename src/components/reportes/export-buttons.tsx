"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF } from "@/lib/export/pdf";
import { exportToExcel } from "@/lib/export/excel";

interface ExportButtonsProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function ExportButtons({ title, headers, rows, filename }: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportToPDF(title, headers, rows, filename)}
        className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
      >
        <FileDown className="w-4 h-4" />
        PDF
      </button>
      <button
        onClick={() => exportToExcel(title, headers, rows, filename)}
        className="flex items-center gap-2 bg-green-600/20 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </button>
    </div>
  );
}
