export function exportToCSV<T>(
  data: T[],
  filename: string,
  headers: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    return;
  }

  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  
  const dataRows = data.map(row => 
    headers.map(h => {
      const value = row[h.key];
      if (value === null || value === undefined) return '""';
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
