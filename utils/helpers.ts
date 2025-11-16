export function formatElapsedTime(milliseconds: number): string {
  if (milliseconds < 0) return '00:00:00.0';

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((milliseconds % 1000) / 100);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function exportToCsv(filename: string, rows: object[]) {
  if (!rows || rows.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const separator = ',';
  // FIX: Explicitly set the generic type for `reduce` to ensure `allKeys` is correctly inferred as `Set<string>`. This resolves downstream errors with `Array.from` and indexing with keys from the resulting array.
  const allKeys = rows.reduce<Set<string>>((keys, row) => {
    Object.keys(row).forEach(key => keys.add(key));
    return keys;
  }, new Set<string>());

  const headers = Array.from(allKeys);
  
  const csvContent =
    headers.join(separator) +
    '\n' +
    rows.map(row => {
      return headers.map(k => {
        const value = (row as any)[k];
        let cell = value === null || value === undefined ? '' : value;
        cell = cell instanceof Array ? cell.join(';') : cell; // Lida com dados de array
        let cellString = String(cell);
        // Escapa aspas e outros caracteres especiais
        if (cellString.includes(separator) || cellString.includes('"') || cellString.includes('\n') || cellString.includes('\r')) {
          cellString = '"' + cellString.replace(/"/g, '""') + '"';
        }
        return cellString;
      }).join(separator);
    }).join('\n');

  // Adiciona BOM para garantir a compatibilidade de codificação com o Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function printReport(title: string, content: string) {
  const printWindow = window.open('', '_blank', 'height=600,width=800');

  if (printWindow) {
    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 12pt; 
              line-height: 1.4;
              margin: 2rem;
            }
            h1, h2, h3 {
              color: #1e3c72;
              border-bottom: 2px solid #2a5298;
              padding-bottom: 5px;
              margin-bottom: 1rem;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 2rem;
            }
            th, td { 
              border: 1px solid #ccc; 
              padding: 8px; 
              text-align: left; 
            }
            thead { 
              background-color: #f2f2f2;
              color: #333;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            @media print {
              body {
                margin: 0;
              }
              .no-print, .no-print * {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${content}
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } else {
    alert('Seu navegador bloqueou a abertura da janela de impressão. Por favor, habilite pop-ups para este site.');
  }
}