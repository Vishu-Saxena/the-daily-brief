/** Remove Markdown markers from article text because the reader renders plain text. */
export function cleanMarkdownText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, match => match.replace(/```[\w-]*\n?|```/g, ''))
    .replace(/\[([^\]]+)\]\(https?:\/\/[^\s)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '$1')
    .replace(/(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
