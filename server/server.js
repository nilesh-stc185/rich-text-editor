const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/export-pdf', async (req, res) => {
  const { html, fileName = 'document' } = req.body || {};
  if (!html) {
    return res.status(400).json({ error: 'Missing html' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });
    await page.setViewport({ width: 1024, height: 768 });

    const pdfRaw = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });

    await browser.close();

    // Puppeteer may return Uint8Array; normalise to Buffer
    const pdfBuffer = Buffer.isBuffer(pdfRaw) ? pdfRaw : Buffer.from(pdfRaw);

    // Return PDF as base64 so the client can write it locally and share
    return res.json({ base64: pdfBuffer.toString('base64'), fileName });
  } catch (err) {
    if (browser) {
      await browser.close();
    }
    console.error('export-pdf error', err);
    return res.status(500).json({ error: 'Failed to export PDF' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`HTML→PDF server listening on http://localhost:${PORT}`);
});
