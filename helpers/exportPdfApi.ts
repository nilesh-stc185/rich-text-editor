import RNFS from 'react-native-fs';

const EXPORT_BASE_URL = 'https://23c3-121-240-3-162.ngrok-free.app';

export async function exportHtmlToPdf(html: string, fileName = 'document'): Promise<string> {
  const response = await fetch(`${EXPORT_BASE_URL}/export-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, fileName }),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => '');
    throw new Error(`Export failed: ${response.status} ${txt}`);
  }

  const { base64 } = await response.json();

  if (!base64) {
    throw new Error('No PDF data returned from server');
  }

  // Write base64 PDF to a local file
  const pdfPath = `${RNFS.CachesDirectoryPath}/${fileName}.pdf`;
  await RNFS.writeFile(pdfPath, base64, 'base64');

  return `file://${pdfPath}`;
}
