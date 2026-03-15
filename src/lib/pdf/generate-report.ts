/**
 * PDF Generation Utility
 * Uses @react-pdf/renderer to generate and download vector PDFs.
 */
import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/**
 * Generate a PDF blob from a React-PDF Document element and trigger download.
 */
export async function generateAndDownloadPDF(
  document: ReactElement,
  fileName: string
): Promise<void> {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
