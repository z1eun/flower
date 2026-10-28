import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: '#2D3748',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

// Parses scanned QR payload to extract seed ID (1-10)
export function parseSeedQR(payload: string): number | null {
  if (!payload) return null;
  const clean = payload.trim().toUpperCase();

  // Pattern 1: DANDELION-SEED-X
  const matchDandelion = clean.match(/DANDELION-SEED-([0-9]+)/);
  if (matchDandelion && matchDandelion[1]) {
    const num = parseInt(matchDandelion[1], 10);
    if (num >= 1 && num <= 10) return num;
  }

  // Pattern 2: SEED-X or SEED:X or SEED_X or #SEED=X
  const matchSeed = clean.match(/SEED[=:\-_/]?([0-9]+)/);
  if (matchSeed && matchSeed[1]) {
    const num = parseInt(matchSeed[1], 10);
    if (num >= 1 && num <= 10) return num;
  }

  // Pattern 3: Direct number 1 to 10
  const directNum = parseInt(clean, 10);
  if (!isNaN(directNum) && directNum >= 1 && directNum <= 10) {
    return directNum;
  }

  return null;
}
