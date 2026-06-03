import mammoth from 'mammoth';
import { normalizeExtractedText } from '../pages/Home/xmlParser';

const OPTION_REGEX = /^([a-hA-H])[.)]\s+/;

function isBoldParagraph(p: Element): boolean {
    const text = p.textContent?.trim() ?? '';
    if (!text) return false;
    const boldLen = Array.from(p.querySelectorAll('strong, b'))
        .reduce((sum, el) => sum + (el.textContent?.length ?? 0), 0);
    return boldLen >= text.length * 0.7;
}

export async function extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    const doc = new DOMParser().parseFromString(result.value, 'text/html');
    const nodes = Array.from(doc.querySelectorAll('p, li'));

    const lines: string[] = [];
    for (const node of nodes) {
        const text = node.textContent?.trim() ?? '';
        if (!text) continue;
        if (OPTION_REGEX.test(text) && isBoldParagraph(node)) {
            lines.push(text + ' {correta}');
        } else {
            lines.push(text);
        }
    }

    return normalizeExtractedText(lines.join('\n\n'));
}
