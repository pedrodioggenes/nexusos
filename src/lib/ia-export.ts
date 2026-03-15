import jsPDF from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(conversation: Conversation): void {
  let md = `# ${conversation.title}\n\n`;
  md += `*Exportado em ${new Date().toLocaleString('pt-BR')}*\n\n`;
  md += `---\n\n`;

  conversation.messages.forEach((msg) => {
    const role = msg.role === 'user' ? '👤 **Você**' : '🤖 **NexusIA**';
    md += `### ${role}\n\n`;
    md += `${msg.content}\n\n`;
    md += `---\n\n`;
  });

  const filename = `ia-${conversation.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.md`;
  downloadFile(md, filename, 'text/markdown');
}

export async function exportToPDF(conversation: Conversation): Promise<void> {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to add page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(conversation.title, margin, y);
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Exportado em ${new Date().toLocaleString('pt-BR')}`, margin, y);
  y += 15;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Messages
  conversation.messages.forEach((msg) => {
    const isUser = msg.role === 'user';
    const roleText = isUser ? 'Você' : 'NexusIA';
    
    // Role header
    checkNewPage(20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isUser ? 59 : 139, isUser ? 130 : 92, isUser ? 246 : 246); // violet colors
    doc.text(roleText, margin, y);
    y += 6;

    // Message content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Split text into lines
    const lines = doc.splitTextToSize(msg.content, maxWidth);
    
    lines.forEach((line: string) => {
      checkNewPage(6);
      doc.text(line, margin, y);
      y += 5;
    });

    y += 8;

    // Separator line
    checkNewPage(5);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `NexusIA - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const filename = `ia-${conversation.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
  doc.save(filename);
}
