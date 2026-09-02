import QRCode from 'qrcode';

export interface PixConfig {
  keyDisplay: string;
  keyNormalized: string;
  keyType: string;
  favoredName: string;
  bankName: string;
  city: string;
  agency?: string;
  account?: string;
  status?: string;
  txid?: string;
}

export const DEFAULT_PIX_CONFIG: PixConfig = {
  keyDisplay: '13.823.676/0028-47',
  keyNormalized: '13823676002847',
  keyType: 'CNPJ',
  favoredName: 'IMW 3 R Cosmopolis',
  bankName: 'Santander',
  city: 'Cosmopolis',
  agency: '',
  account: '',
  status: 'ativo',
  txid: '***',
};

/**
 * Strips accents from a string to comply with EMV / BR Code specifications.
 */
export function stripAccents(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculates CRC16-CCITT (0xFFFF polynomial 0x1021) over string.
 */
export function calculateCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates the official EMV BR Code (Pix Copia e Cola) payload string.
 */
export function generatePixPayload(config: Partial<PixConfig> = {}): string {
  const keyNorm = (config.keyNormalized || DEFAULT_PIX_CONFIG.keyNormalized).replace(/\D/g, '');
  const rawName = config.favoredName || DEFAULT_PIX_CONFIG.favoredName;
  const rawCity = config.city || DEFAULT_PIX_CONFIG.city;
  const rawTxId = config.txid || DEFAULT_PIX_CONFIG.txid || '***';

  const cleanName = stripAccents(rawName).substring(0, 25);
  const cleanCity = stripAccents(rawCity).substring(0, 15);
  const cleanTxId = rawTxId.substring(0, 25) || '***';

  // Tag 26: Merchant Account Information
  const tag26Content = '0014br.gov.bcb.pix' + '01' + keyNorm.length.toString().padStart(2, '0') + keyNorm;
  const tag26 = '26' + tag26Content.length.toString().padStart(2, '0') + tag26Content;

  const tag52 = '52040000'; // Merchant Category Code
  const tag53 = '5303986'; // Transaction Currency (BRL = 986)
  const tag58 = '5802BR';  // Country Code

  // Tag 59: Merchant Name
  const tag59 = '59' + cleanName.length.toString().padStart(2, '0') + cleanName;

  // Tag 60: Merchant City
  const tag60 = '60' + cleanCity.length.toString().padStart(2, '0') + cleanCity;

  // Tag 62: Additional Data Field (TxID)
  const tag62Content = '05' + cleanTxId.length.toString().padStart(2, '0') + cleanTxId;
  const tag62 = '62' + tag62Content.length.toString().padStart(2, '0') + tag62Content;

  const rawString = '000201' + tag26 + tag52 + tag53 + tag58 + tag59 + tag60 + tag62 + '6304';
  const checksum = calculateCRC16(rawString);

  return rawString + checksum;
}

/**
 * Renders a QR Code as a DataURL PNG image from a Pix Payload string.
 */
export async function generateQrCodeDataUrl(payload: string, width = 320): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('[pixUtils] Error generating QR Code DataURL:', err);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&data=${encodeURIComponent(payload)}`;
  }
}
