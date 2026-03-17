const EXPORT_BASE_URL = 'https://23c3-121-240-3-162.ngrok-free.app';

interface ExportDocxResponse {
  url: string;
  publicId: string;
}

export async function requestDocxExport(html: string, fileName = 'document'): Promise<ExportDocxResponse> {
  const res = await fetch(`${EXPORT_BASE_URL}/export-docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, fileName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${text}`);
  }

  return res.json();
}

