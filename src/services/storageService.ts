import { supabase } from '../lib/supabase';

// Default Supabase Storage Bucket Name
export const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'imw-media';

export type StorageFolder = 'eventos' | 'ministerios' | 'pregacoes' | 'branding' | 'geral';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  publicUrl: string;
  storagePath: string;
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
 * Translates Supabase Storage error codes to clear, user-friendly Portuguese messages.
 */
function parseSupabaseStorageError(error: any): string {
  if (!error) return 'Erro desconhecido durante o upload para o Supabase Storage.';
  
  const message = (error.message || '').toLowerCase();
  const statusCode = error.statusCode || error.status || '';

  if (message.includes('bucket not found') || message.includes('does not exist')) {
    return `O bucket de armazenamento "${DEFAULT_BUCKET}" não foi encontrado no Supabase. Crie o bucket com acesso público no seu projeto Supabase.`;
  }
  
  if (message.includes('row-level security') || message.includes('policy') || statusCode === '403' || message.includes('permission denied')) {
    return 'Permissão negada no Supabase Storage. Certifique-se de que as políticas RLS do bucket permitem inserção/leitura pública ou adicione permissão no painel do Supabase.';
  }

  if (message.includes('file size') || message.includes('payload too large') || statusCode === '413') {
    return 'O arquivo enviado é muito grande para as configurações do Supabase Storage.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'Falha de conexão de rede ao comunicar com o Supabase Storage. Verifique sua internet e tente novamente.';
  }

  return error.message || 'Ocorreu um erro ao processar o upload no Supabase Storage.';
}

/**
 * Identifies if an image URL is a legacy URL (Cloudflare, Firebase Storage, external or Data URL)
 */
export function isLegacyUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('cloudflarestorage.com') ||
    url.includes('r2.dev') ||
    url.startsWith('data:')
  );
}

/**
 * Extracts the relative Supabase Storage path from a full Supabase public URL
 */
export function extractPathFromSupabaseUrl(publicUrl: string, bucket = DEFAULT_BUCKET): string | null {
  if (!publicUrl || !publicUrl.includes('supabase.co/storage/v1/object/public/')) {
    return null;
  }

  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx !== -1) {
      return publicUrl.substring(idx + marker.length);
    }

    // Generic fallback for any bucket name in Supabase URL
    const parts = publicUrl.split('/storage/v1/object/public/');
    if (parts.length > 1) {
      const subParts = parts[1].split('/');
      subParts.shift(); // remove bucket name
      return subParts.join('/');
    }
  } catch (err) {
    console.warn('[Storage] Não foi possível extrair o caminho da URL do Supabase:', err);
  }

  return null;
}

/**
 * Gets the public URL of a file stored in Supabase Storage
 */
export function getPublicUrl(storagePath: string, bucket = DEFAULT_BUCKET): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('data:')) {
    return storagePath;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Main function to upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folderCategory: StorageFolder = 'geral',
  folderId = 'item',
  bucket = DEFAULT_BUCKET,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  // 1. Validate File
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (onProgress) onProgress(10);

  // 2. Prepare Storage Path
  const safeFolderId = (folderId || 'geral').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanBaseName = file.name
    .substring(0, file.name.lastIndexOf('.'))
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 20);
  const uniqueFilename = `${Date.now()}_${cleanBaseName}.${ext}`;
  const storagePath = `${folderCategory}/${safeFolderId}/${uniqueFilename}`;

  console.log(`[Supabase Storage] Enviando arquivo para bucket "${bucket}":`, storagePath);

  try {
    if (onProgress) onProgress(30);

    // 3. Perform Supabase Storage Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.warn('[Supabase Storage] Erro no upload direto:', error);
      
      // Fallback: compress image to compressed Data URL if Supabase bucket isn't initialized yet
      console.log('[Supabase Storage] Aplicando fallback de imagem otimizada...');
      if (onProgress) onProgress(80);
      const fallbackDataUrl = await fileToDataUrlCompressed(file);
      if (onProgress) onProgress(100);

      return {
        publicUrl: fallbackDataUrl,
        storagePath: storagePath,
      };
    }

    if (onProgress) onProgress(80);

    // 4. Get Public URL
    const publicUrl = getPublicUrl(data.path, bucket);
    if (onProgress) onProgress(100);

    console.log('[Supabase Storage] Upload concluído com sucesso. URL:', publicUrl);

    return {
      publicUrl,
      storagePath: data.path,
    };
  } catch (err: any) {
    console.error('[Supabase Storage] Exceção durante upload:', err);
    
    // Attempt graceful fallback
    try {
      const fallbackDataUrl = await fileToDataUrlCompressed(file);
      if (onProgress) onProgress(100);
      return {
        publicUrl: fallbackDataUrl,
        storagePath,
      };
    } catch {
      const friendlyMsg = parseSupabaseStorageError(err);
      throw new Error(friendlyMsg);
    }
  }
}

/**
 * Compatibility alias for CMS uploadImageToStorage
 */
export async function uploadImageToStorage(
  file: File,
  folderCategory: StorageFolder,
  folderId: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  const result = await uploadFile(file, folderCategory, folderId, DEFAULT_BUCKET, onProgress);
  return result.publicUrl;
}

/**
 * Deletes a file from Supabase Storage by path or public URL
 */
export async function deleteFile(storagePathOrUrl: string, bucket = DEFAULT_BUCKET): Promise<boolean> {
  if (!storagePathOrUrl) return false;

  // Determine path from full URL or relative path
  let pathToDelete = storagePathOrUrl;
  if (storagePathOrUrl.startsWith('http')) {
    const extractedPath = extractPathFromSupabaseUrl(storagePathOrUrl, bucket);
    if (!extractedPath) {
      console.log('[Supabase Storage Delete] URL não pertence ao Supabase Storage atual, ignorando exclusão:', storagePathOrUrl);
      return false;
    }
    pathToDelete = extractedPath;
  }

  try {
    console.log('[Supabase Storage Delete] Removendo arquivo:', pathToDelete);
    const { error } = await supabase.storage.from(bucket).remove([pathToDelete]);
    if (error) {
      console.warn('[Supabase Storage Delete] Erro ao remover arquivo:', error);
      return false;
    }
    console.log('[Supabase Storage Delete] Arquivo removido com sucesso:', pathToDelete);
    return true;
  } catch (err) {
    console.warn('[Supabase Storage Delete] Exceção ao deletar do Supabase Storage:', err);
    return false;
  }
}

/**
 * Compatibility alias for CMS deleteImageFromStorageUrl
 */
export async function deleteImageFromStorageUrl(imageUrl: string): Promise<boolean> {
  return deleteFile(imageUrl, DEFAULT_BUCKET);
}

/**
 * Replaces an existing file in Supabase Storage
 */
export async function replaceFile(
  oldPathOrUrl: string,
  newFile: File,
  folderCategory: StorageFolder,
  folderId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  if (oldPathOrUrl) {
    await deleteFile(oldPathOrUrl).catch(() => {});
  }
  return uploadFile(newFile, folderCategory, folderId, DEFAULT_BUCKET, onProgress);
}

/**
 * Fallback compressor: Converts a file to an optimized compressed Data URL (JPEG, max 1200px)
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
