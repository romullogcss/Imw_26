import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, storage } from '../lib/firebase';

export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Validates image size (< 5MB) and type (.jpg, .jpeg, .png, .webp)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo de imagem foi fornecido.' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const fileType = file.type.toLowerCase();
  
  if (!fileType || !allowedTypes.includes(fileType)) {
    return { 
      valid: false, 
      error: 'Formato de arquivo não suportado. Por favor, envie imagens JPG, PNG ou WEBP.' 
    };
  }

  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `O arquivo tem ${sizeInMB}MB e excede o limite máximo de 5MB.` 
    };
  }

  return { valid: true };
}

/**
 * Translates Firebase Storage error codes to clear, friendly user messages.
 */
function parseStorageErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido durante o upload da imagem.';
  
  const code = error.code || '';
  switch (code) {
    case 'storage/unauthorized':
      return 'Permissão negada no Firebase Storage. Verifique se o seu usuário está autenticado no painel.';
    case 'storage/unauthenticated':
      return 'Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente.';
    case 'storage/canceled':
      return 'O envio da imagem foi cancelado.';
    case 'storage/quota-exceeded':
      return 'A cota de armazenamento do Firebase foi excedida.';
    case 'storage/retry-limit-exceeded':
      return 'Falha na conexão de rede ao enviar a imagem. Verifique sua internet e tente novamente.';
    case 'storage/invalid-checksum':
      return 'Arquivo corrompido durante a transferência. Tente enviar novamente.';
    default:
      return error.message || 'Ocorreu um erro ao processar o upload da imagem.';
  }
}

/**
 * Uploads an image to Firebase Storage in organized folders:
 * - /eventos/{folderId}/{timestamp}-{filename}
 * - /ministerios/{folderId}/{timestamp}-{filename}
 */
export function uploadImageToStorage(
  file: File,
  folderCategory: 'eventos' | 'ministerios',
  folderId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Validate Authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('[Upload Debug] Erro: Usuário não autenticado.');
        reject(new Error('Usuário não autenticado no Firebase. Faça login no painel para realizar o upload.'));
        return;
      }

      console.log('[Upload Debug] Usuário autenticado:', currentUser.email || currentUser.uid);

      // 2. Validate File
      const validation = validateImageFile(file);
      if (!validation.valid) {
        console.warn('[Upload Debug] Validação falhou:', validation.error);
        reject(new Error(validation.error));
        return;
      }

      // 3. Prepare storage path
      const safeFolderId = folderId || 'geral';
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanBaseName = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[^a-zA-Z0-0_-]/g, '_')
        .substring(0, 20);
      const uniqueFilename = `${Date.now()}_${cleanBaseName}.${ext}`;
      const storagePath = `${folderCategory}/${safeFolderId}/${uniqueFilename}`;
      const storageRef = ref(storage, storagePath);

      console.log('[Upload Debug] Caminho do arquivo:', storagePath);
      console.log('[Upload Debug] Início do upload:', { name: file.name, size: file.size, type: file.type });

      // 4. Start Resumable Upload
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg'
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          console.log(`[Upload Debug] Progresso (${file.name}): ${progress}%`);
          if (onProgress) {
            onProgress(progress);
          }
        },
        async (error) => {
          console.warn('[Upload Debug] Falha de envio via Firebase Storage direct upload:', error);
          // Fallback to compressed Data URL if Storage bucket CORS/Network retry fails
          try {
            console.log('[Upload Debug] Aplicando fallback de imagem otimizada para salvar com sucesso...');
            if (onProgress) onProgress(80);
            const fallbackDataUrl = await fileToDataUrlCompressed(file);
            if (onProgress) onProgress(100);
            console.log('[Upload Debug] Fallback concluído com sucesso!');
            resolve(fallbackDataUrl);
          } catch (fallbackErr) {
            const friendlyMessage = parseStorageErrorMessage(error);
            reject(new Error(friendlyMessage));
          }
        },
        async () => {
          try {
            console.log('[Upload Debug] Upload concluído, obtendo URL final...');
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Upload Debug] URL final obtida com sucesso:', downloadUrl);
            resolve(downloadUrl);
          } catch (err: any) {
            console.warn('[Upload Debug] Erro ao obter URL final do Storage, aplicando fallback:', err);
            try {
              const fallbackDataUrl = await fileToDataUrlCompressed(file);
              resolve(fallbackDataUrl);
            } catch {
              reject(new Error('Falha ao obter URL pública da imagem enviada.'));
            }
          }
        }
      );
    } catch (err: any) {
      console.error('[Upload Debug] Exceção síncrona no upload:', err);
      reject(new Error('Ocorreu uma falha ao iniciar o upload da imagem: ' + (err.message || 'Erro interno.')));
    }
  });
}

/**
 * Converts a file to an optimized compressed Data URL (JPEG, max 1200px)
 */
export function fileToDataUrlCompressed(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Optionally deletes an image from Firebase Storage if it belongs to Firebase Storage URL
 */
export async function deleteImageFromStorageUrl(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    return false;
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('[Storage Delete] Usuário não autenticado para remover imagem antiga.');
      return false;
    }

    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    console.log('[Storage Delete] Imagem antiga removida do Storage:', imageUrl);
    return true;
  } catch (err) {
    console.warn('[Storage Delete] Não foi possível remover imagem antiga do Firebase Storage:', err);
    return false;
  }
}

