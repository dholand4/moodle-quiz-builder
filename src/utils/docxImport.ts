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

// Convert a DOM node to plain text, preserving bold as **...** and italic as _..._.
// Used for body paragraphs so formatting survives into the Moodle XML output.
function nodeToMarkdown(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const inner = Array.from(el.childNodes).map(nodeToMarkdown).join('');
    if (tag === 'strong' || tag === 'b') return `**${inner}**`;
    if (tag === 'em' || tag === 'i') return `_${inner}_`;
    return inner;
}

export async function extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    const doc = new DOMParser().parseFromString(result.value, 'text/html');
    const nodes = Array.from(doc.querySelectorAll('p, li'));

    const lines: string[] = [];
    for (const node of nodes) {
        const plainText = node.textContent?.trim() ?? '';
        if (!plainText) continue;

        if (OPTION_REGEX.test(plainText)) {
            // Options: use plain text (bold = correct-answer marker, not formatting).
            // If the whole option is bold, tag it as the correct answer.
            if (isBoldParagraph(node)) {
                lines.push(plainText + ' {correta}');
            } else {
                lines.push(plainText);
            }
        } else {
            // Body text: preserve bold/italic formatting as Markdown markers.
            const markdown = nodeToMarkdown(node).trim();
            lines.push(markdown || plainText);
        }
    }

    return normalizeExtractedText(lines.join('\n\n'));
}
