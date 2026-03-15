import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// TEXT NORMALIZATION - Convert accents to ASCII for PDF compatibility
// ============================================================================
function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[áàâãäå]/gi, (m) => m === m.toUpperCase() ? 'A' : 'a')
    .replace(/[éèêë]/gi, (m) => m === m.toUpperCase() ? 'E' : 'e')
    .replace(/[íìîï]/gi, (m) => m === m.toUpperCase() ? 'I' : 'i')
    .replace(/[óòôõö]/gi, (m) => m === m.toUpperCase() ? 'O' : 'o')
    .replace(/[úùûü]/gi, (m) => m === m.toUpperCase() ? 'U' : 'u')
    .replace(/[ç]/gi, (m) => m === m.toUpperCase() ? 'C' : 'c')
    .replace(/[ñ]/gi, (m) => m === m.toUpperCase() ? 'N' : 'n')
    .replace(/[—–]/g, '-')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[•]/g, '-')
    .replace(/[→↑↓]/g, '->');
}

function escapeForPDF(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E\n]/g, '');
}

// ============================================================================
// PDF GENERATION - Simple text pagination from pre-formatted content
// ============================================================================
function generatePDFContent(title: string, content: string): Uint8Array {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let yPos = 750;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 50;
  const LINE_HEIGHT = 14;
  const TITLE_HEIGHT = 24;
  const MAX_CHARS_PER_LINE = 85;

  const newPage = () => {
    if (currentPage.length > 0) {
      pages.push([...currentPage]);
    }
    currentPage = [];
    yPos = MARGIN_TOP;
  };

  const addLine = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    const lineHeight = fontSize === 16 ? TITLE_HEIGHT : LINE_HEIGHT;
    
    if (yPos - lineHeight < MARGIN_BOTTOM) {
      newPage();
    }
    
    const normalizedText = normalizeText(text);
    const escapedText = escapeForPDF(normalizedText);
    
    // Word wrap for long lines
    if (escapedText.length > MAX_CHARS_PER_LINE) {
      const words = escapedText.split(' ');
      let line = '';
      
      for (const word of words) {
        if ((line + ' ' + word).trim().length > MAX_CHARS_PER_LINE) {
          if (line) {
            currentPage.push(`BT /F1 ${fontSize} Tf 50 ${yPos} Td (${line.trim()}) Tj ET`);
            yPos -= lineHeight;
            if (yPos < MARGIN_BOTTOM) newPage();
          }
          line = word;
        } else {
          line = line ? line + ' ' + word : word;
        }
      }
      
      if (line) {
        currentPage.push(`BT /F1 ${fontSize} Tf 50 ${yPos} Td (${line.trim()}) Tj ET`);
        yPos -= lineHeight;
      }
    } else {
      currentPage.push(`BT /F1 ${fontSize} Tf 50 ${yPos} Td (${escapedText}) Tj ET`);
      yPos -= lineHeight;
    }
  };

  // Title
  addLine(normalizeText(title), 16);
  yPos -= 10;
  
  // Generated date
  addLine(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 9);
  yPos -= 15;
  
  // Content - already formatted by Gemini
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') {
      yPos -= 8;
      if (yPos < MARGIN_BOTTOM) newPage();
    } else {
      const isTitle = line.trim() === line.trim().toUpperCase() && 
                      line.trim().length > 3 && 
                      !line.trim().startsWith('-') &&
                      !line.trim().match(/^\d/);
      
      if (isTitle) {
        yPos -= 5;
        addLine(line, 12);
        yPos -= 3;
      } else {
        addLine(line, 10);
      }
    }
  }
  
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }
  
  if (pages.length === 0) {
    pages.push([`BT /F1 10 Tf 50 750 Td (Documento vazio) Tj ET`]);
  }

  const pageCount = pages.length;
  const pageRefs: number[] = [];
  let objNum = 6;
  
  for (let i = 0; i < pageCount; i++) {
    pageRefs.push(objNum);
    objNum++;
  }
  
  const pageObjects: string[] = [];
  const contentObjects: string[] = [];
  
  for (let i = 0; i < pageCount; i++) {
    const contentObjNum = objNum + i;
    const stream = pages[i].join('\n');
    
    pageObjects.push(
      `${pageRefs[i]} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`
    );
    
    contentObjects.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
    );
  }

  const pagesKids = pageRefs.map(r => `${r} 0 R`).join(' ');

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [${pagesKids}] /Count ${pageCount} >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

${pageObjects.join('\n\n')}

${contentObjects.join('\n\n')}

xref
0 ${objNum + pageCount}
0000000000 65535 f 

trailer
<< /Size ${objNum + pageCount} /Root 1 0 R >>
startxref
0
%%EOF`;

  return new TextEncoder().encode(pdfContent);
}

// ============================================================================
// EXCEL GENERATION - Real XLSX with SheetJS
// ============================================================================
function generateExcelContent(title: string, content: string, structuredData: any): Uint8Array {
  const workbook = XLSX.utils.book_new();
  
  // Parse content to extract structured data
  let data: any[][] = [];
  
  if (structuredData && structuredData.headers && structuredData.rows) {
    // Use provided structured data
    data.push(structuredData.headers);
    data.push(...structuredData.rows);
  } else {
    // Smart parsing of text content
    const lines = content.split('\n').filter(l => l.trim());
    
    // Add title and metadata
    data.push([title]);
    data.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
    data.push([]); // Empty row
    
    let currentSection = '';
    let tableData: string[][] = [];
    let inTable = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect section titles (ALL CAPS or ends with colon)
      const isTitle = (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-')) ||
                      (trimmed.endsWith(':') && !trimmed.includes('->'));
      
      if (isTitle) {
        // Flush any pending table
        if (tableData.length > 0) {
          data.push(...tableData);
          tableData = [];
        }
        data.push([]); // Empty row before section
        data.push([trimmed.replace(/:$/, '')]);
        currentSection = trimmed;
        continue;
      }
      
      // Detect list items with metrics (e.g., "- Vendas: R$ 100.000 -> R$ 120.000 (+20%)")
      if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const itemText = trimmed.replace(/^[-•]\s*/, '');
        
        // Try to parse as metric line: "Label: Value1 -> Value2 (change)"
        const metricMatch = itemText.match(/^(.+?):\s*(.+?)\s*(?:->|→)\s*(.+?)(?:\s*\((.+?)\))?$/);
        if (metricMatch) {
          const [, label, before, after, change] = metricMatch;
          data.push([label.trim(), before.trim(), after.trim(), change?.trim() || '']);
          continue;
        }
        
        // Simple "Label: Value" pattern
        const simpleMatch = itemText.match(/^(.+?):\s*(.+)$/);
        if (simpleMatch) {
          const [, label, value] = simpleMatch;
          data.push([label.trim(), value.trim()]);
          continue;
        }
        
        // Just a list item
        data.push([itemText]);
        continue;
      }
      
      // Detect "Item: Product" pattern (product details)
      if (trimmed.startsWith('Item:')) {
        const productName = trimmed.replace(/^Item:\s*/, '');
        data.push([]); // Empty row
        data.push(['Produto', productName]);
        continue;
      }
      
      // Regular text line
      data.push([trimmed]);
    }
    
    // Flush remaining table data
    if (tableData.length > 0) {
      data.push(...tableData);
    }
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [];
  for (let i = 0; i < 10; i++) {
    colWidths.push({ wch: i === 0 ? 40 : 20 });
  }
  worksheet['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');
  
  // Generate XLSX buffer
  const xlsxBuffer = XLSX.write(workbook, { 
    type: 'array', 
    bookType: 'xlsx',
    compression: true
  });
  
  return new Uint8Array(xlsxBuffer);
}

// ============================================================================
// SMART EXCEL FROM AI CONTENT - Better parsing
// ============================================================================
function generateSmartExcel(title: string, content: string, structuredData: any): Uint8Array {
  const workbook = XLSX.utils.book_new();
  
  // Create summary sheet
  const summaryData: any[][] = [
    [title],
    [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [],
  ];
  
  // Create detailed data sheet
  const detailData: any[][] = [
    ['Indicador', 'Período Anterior', 'Período Atual', 'Variação']
  ];
  
  // Parse content intelligently
  const lines = content.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Section titles
    const isTitle = trimmed === trimmed.toUpperCase() && 
                    trimmed.length > 3 && 
                    !trimmed.startsWith('-');
    
    if (isTitle) {
      currentSection = trimmed;
      summaryData.push([]);
      summaryData.push([trimmed]);
      continue;
    }
    
    // Metric with comparison: "- Label: Value1 -> Value2 (change)"
    const comparisonMatch = trimmed.match(/^[-•]?\s*(.+?):\s*(.+?)\s*(?:->|→)\s*(.+?)(?:\s*\((.+?)\))?$/);
    if (comparisonMatch) {
      const [, label, before, after, change] = comparisonMatch;
      detailData.push([
        label.trim(),
        before.trim(),
        after.trim(),
        change?.trim() || ''
      ]);
      summaryData.push([`${label.trim()}: ${before.trim()} → ${after.trim()}`, change?.trim() || '']);
      continue;
    }
    
    // Simple metric: "- Label: Value"
    const simpleMatch = trimmed.match(/^[-•]?\s*(.+?):\s*(.+)$/);
    if (simpleMatch) {
      const [, label, value] = simpleMatch;
      summaryData.push([label.trim(), value.trim()]);
      continue;
    }
    
    // Product item
    if (trimmed.startsWith('Item:')) {
      const productName = trimmed.replace(/^Item:\s*/, '');
      summaryData.push([]);
      summaryData.push(['PRODUTO', productName]);
      continue;
    }
    
    // Regular line
    summaryData.push([trimmed]);
  }
  
  // Create worksheets
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  
  // Set column widths
  summarySheet['!cols'] = [{ wch: 50 }, { wch: 25 }, { wch: 25 }, { wch: 15 }];
  detailSheet['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  
  // Add sheets
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  
  // Only add detail sheet if it has data
  if (detailData.length > 1) {
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Comparativo');
  }
  
  // Generate XLSX
  const xlsxBuffer = XLSX.write(workbook, { 
    type: 'array', 
    bookType: 'xlsx',
    compression: true
  });
  
  return new Uint8Array(xlsxBuffer);
}

// ============================================================================
// DOCX GENERATION (as plain text for now)
// ============================================================================
function generateDocxContent(title: string, content: string): Uint8Array {
  let doc = `${title}\n`;
  doc += `${'='.repeat(Math.min(title.length, 60))}\n\n`;
  doc += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  doc += content;
  return new TextEncoder().encode(doc);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { format, title, content, structured_data } = await req.json();

    if (!format || !title) {
      return new Response(
        JSON.stringify({ error: "Formato e título são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let fileContent: Uint8Array;
    let mimeType: string;
    let extension: string;

    const documentContent = content || "";

    console.log(`Generating document: format=${format}, title=${title}, contentLength=${documentContent.length}`);

    switch (format.toLowerCase()) {
      case 'pdf':
        fileContent = generatePDFContent(title, documentContent);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'xlsx':
      case 'xls':
      case 'excel':
        fileContent = generateSmartExcel(title, documentContent, structured_data);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
      case 'csv':
        // CSV as fallback
        let csv = `"${normalizeText(title)}"\n`;
        csv += `"Gerado em: ${new Date().toLocaleString('pt-BR')}"\n\n`;
        const lines = documentContent.split('\n');
        for (const line of lines) {
          csv += `"${normalizeText(line).replace(/"/g, '""')}"\n`;
        }
        fileContent = new TextEncoder().encode(csv);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'docx':
      case 'doc':
      case 'txt':
        fileContent = generateDocxContent(title, documentContent);
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Formato não suportado: ${format}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeTitle = normalizeText(title).replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
    const filename = `ia-${safeTitle}-${timestamp}.${extension}`;

    console.log(`Uploading file: ${filename}, size=${fileContent.length}, mime=${mimeType}`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ia-documents')
      .upload(filename, fileContent, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      // Try to create bucket if it doesn't exist
      if (uploadError.message.includes('Bucket not found')) {
        await supabase.storage.createBucket('ia-documents', { public: false });
        
        // Retry upload
        const { error: retryError } = await supabase.storage
          .from('ia-documents')
          .upload(filename, fileContent, {
            contentType: mimeType,
            upsert: true
          });
        
        if (retryError) {
          console.error("Upload retry error:", retryError);
          throw new Error("Erro ao salvar documento");
        }
      } else {
        console.error("Upload error:", uploadError);
        throw new Error("Erro ao salvar documento");
      }
    }

    // Get signed URL (private bucket)
    const { data: signedData, error: signError } = await supabase.storage
      .from('ia-documents')
      .createSignedUrl(filename, 3600); // 1-hour expiry

    const downloadUrl = signedData?.signedUrl || '';
    if (signError) {
      console.error("Signed URL error:", signError);
    }

    console.log(`Document generated successfully: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: downloadUrl,
        filename: filename,
        format: extension,
        size: fileContent.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao gerar documento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
