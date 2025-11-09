export function getMediaUrl(l: any): string | undefined {
  return l?.content?.audioUrl || l?.content?.videoUrl || l?.mediaUrl || undefined;
}
export function hasHtml(l: any): boolean {
  return !!l?.content?.html;
}