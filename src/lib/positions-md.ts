/**
 * Parse positions from a markdown file.
 * Expected format:
 *   ## Title at Company (or "Title - Company")
 *   https://example.com/job-link
 *   (optional blank line between entries)
 */
export function parsePositionsMd(content: string): { title: string; company?: string; url: string }[] {
  const lines = content.split(/\r?\n/);
  const positions: { title: string; company?: string; url: string }[] = [];
  let currentTitle: string | null = null;
  let currentCompany: string | null = null;

  const urlRegex = /^https?:\/\/\S+$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // ## Title at Company or ## Title - Company
    const headingMatch = trimmed.match(/^#+\s+(.+)$/);
    if (headingMatch) {
      const rest = headingMatch[1].trim();
      const atMatch = rest.match(/^(.+?)\s+at\s+(.+)$/i);
      const dashMatch = rest.match(/^(.+?)\s+[-–—]\s+(.+)$/);
      if (atMatch) {
        currentTitle = atMatch[1].trim();
        currentCompany = atMatch[2].trim();
      } else if (dashMatch) {
        currentTitle = dashMatch[1].trim();
        currentCompany = dashMatch[2].trim();
      } else {
        currentTitle = rest;
        currentCompany = null;
      }
      continue;
    }

    if (urlRegex.test(trimmed) && currentTitle) {
      positions.push({
        title: currentTitle,
        company: currentCompany ?? undefined,
        url: trimmed,
      });
      currentTitle = null;
      currentCompany = null;
    }
  }

  return positions;
}

/**
 * Build markdown content for required info for a position (to write to .md file).
 */
export function formatRequiredInfoMd(params: {
  positionTitle: string;
  company?: string | null;
  url: string;
  requiredInfo: string;
}): string {
  const { positionTitle, company, url, requiredInfo } = params;
  const heading = company ? `${positionTitle} at ${company}` : positionTitle;
  return `# ${heading}

**Link:** ${url}

## Required information

${requiredInfo}
`;
}
