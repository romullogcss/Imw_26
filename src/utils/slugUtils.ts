export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics / accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-'); // Replace multiple dashes with single dash
}

export function getEventSlug(event: { slug?: string; title: string; id?: string }): string {
  if (event.slug && event.slug.trim()) {
    return event.slug.trim();
  }
  const generated = slugify(event.title);
  if (generated) return generated;
  return event.id || 'evento';
}
