export interface Option {
    letter: string;
    text: string;
}

export interface Question {
    identifier: string;
    questionText: string;
    options: Option[];
    correctAnswer: string;
    feedback?: string;
}

export function normalizeExtractedText(inputText: string): string {
    if (!inputText) return '';

    const rawLines = inputText
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, ' ').trim());

    const lines = rawLines.filter((line) => line.length > 0);
    const normalized: string[] = [];

    const headerRegex = /^(?:quest[Ã£a]o\s*)?\d+\s*[.-]?\s*/i;
    const optionRegex = /^([a-hA-H])[.)]\s+/;
    const romanMarkerRegex = /([IVXLCDM]{1,4}\.)\s+/g;
    const romanLineRegex = /^[IVXLCDM]{1,4}\.\s+/;

    const splitByRomanMarkers = (text: string): { lead: string; items: string[] } => {
        romanMarkerRegex.lastIndex = 0;
        const matches = [...text.matchAll(romanMarkerRegex)];
        if (matches.length === 0) {
            return { lead: text.trim(), items: [] };
        }

        const firstIndex = matches[0].index ?? 0;
        const lead = text.slice(0, firstIndex).trim();
        const items: string[] = [];

        for (let i = 0; i < matches.length; i++) {
            const marker = matches[i][1];
            const start = (matches[i].index ?? 0) + matches[i][0].length;
            const end = i + 1 < matches.length ? (matches[i + 1].index ?? text.length) : text.length;
            const body = text.slice(start, end).trim();
            items.push(`${marker} ${body}`.trim());
        }

        return { lead, items };
    };

    for (const line of lines) {
        const isHeader = headerRegex.test(line);
        const isOption = optionRegex.test(line);
        romanMarkerRegex.lastIndex = 0;
        const hasRomanMarkers = romanMarkerRegex.test(line);

        if (normalized.length === 0) {
            if (!isOption && hasRomanMarkers) {
                const { lead, items } = splitByRomanMarkers(line);
                if (lead) normalized.push(lead);
                normalized.push(...items);
            } else {
                normalized.push(line);
            }
            continue;
        }

        const prev = normalized[normalized.length - 1];
        const prevIsHeader = headerRegex.test(prev);
        const prevIsOption = optionRegex.test(prev);

        if (isHeader && hasRomanMarkers) {
            const last = normalized[normalized.length - 1];
            if (last !== '') {
                normalized.push('');
            }
            const { lead, items } = splitByRomanMarkers(line);
            if (lead) normalized.push(lead);
            normalized.push(...items);
            continue;
        }

        if (isHeader) {
            const last = normalized[normalized.length - 1];
            if (last !== '') {
                normalized.push('');
            }
            normalized.push(line);
            continue;
        }

        if (isOption) {
            normalized.push(line);
            continue;
        }

        if (hasRomanMarkers) {
            const { lead, items } = splitByRomanMarkers(line);
            if (lead) {
                if (prevIsHeader || (!prevIsOption && prev !== '')) {
                    normalized[normalized.length - 1] = `${prev} ${lead}`.trim();
                } else {
                    normalized.push(lead);
                }
            }
            if (items.length > 0) {
                normalized.push(...items);
            }
            continue;
        }

        if (prevIsOption || romanLineRegex.test(prev)) {
            normalized[normalized.length - 1] = `${prev} ${line}`;
            continue;
        }

        if (prevIsHeader || (!prevIsHeader && !prevIsOption && prev !== '')) {
            normalized[normalized.length - 1] = `${prev} ${line}`;
            continue;
        }

        normalized.push(line);
    }

    return normalized.join('\n');
}

const escapeXML = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const formatInlineLine = (raw: string): string => {
    const escaped = escapeXML(raw);
    return escaped
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
};

const ALIGN_TAG_RE = /^\{([cj])\}\s*/i;

const ALIGN_STYLE: Record<string, string> = {
    c: 'text-align:center;',
    j: 'text-align:justify;',
};

const formatInlineText = (text: string): string => {
    return text.split('\n').map((line) => {
        if (!line.trim()) return '';
        const m = ALIGN_TAG_RE.exec(line);
        const tag = m ? m[1].toLowerCase() : null;
        const clean = m ? line.slice(m[0].length) : line;
        const html = formatInlineLine(clean);
        const style = tag ? ` style="${ALIGN_STYLE[tag]}"` : '';
        return `<p${style}>${html}</p>`;
    }).filter(Boolean).join('');
};

export function parseTextToQuestions(inputText: string): Question[] {
    const questions: Question[] = [];
    if (!inputText) return questions;

    const feedbackRegex = /^(?:feedback|coment[aá]rio):\s*/i;
    // Matches "Questão 01 - Alternativa Correta: E" (gabarito format)
    const gabaritoRegex = /^quest[ãa]o\s*0*(\d+)\s*[-–]\s*alternativa\s+correta\s*:\s*([a-eA-E])/i;

    const allLines = inputText.trim().split('\n');

    // Split document: questions section vs gabarito answer-key section
    const gabaritoStartIdx = allLines.findIndex(l => gabaritoRegex.test(l.trim()));
    const questionLines = gabaritoStartIdx >= 0 ? allLines.slice(0, gabaritoStartIdx) : allLines;
    const gabaritoLines = gabaritoStartIdx >= 0 ? allLines.slice(gabaritoStartIdx) : [];

    // Parse gabarito answer key into a map<questionNumber, {correctLetter, feedback}>
    const gabaritoMap = new Map<number, { correctLetter: string; feedback?: string }>();
    let currentGabaritoNum: number | null = null;
    for (const line of gabaritoLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const gMatch = gabaritoRegex.exec(trimmed);
        if (gMatch) {
            currentGabaritoNum = parseInt(gMatch[1], 10);
            gabaritoMap.set(currentGabaritoNum, { correctLetter: gMatch[2].toLowerCase() });
        } else if (feedbackRegex.test(trimmed) && currentGabaritoNum !== null) {
            const entry = gabaritoMap.get(currentGabaritoNum);
            if (entry) {
                entry.feedback = trimmed
                    .replace(feedbackRegex, '')
                    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
                    .trim();
            }
        }
    }

    const lines = questionLines;

    let currentQuestion: Partial<Question> & { textBuffer?: string[] } = {};
    let questionCounter = 0;

    const headerRegex = /^(?:quest[ãa]o\s*)?\d+\s*[.-]?\s*/i;
    const optionRegex = /^([a-hA-H])[.)]\s+/;

    const finalizeQuestion = () => {
        if (currentQuestion.textBuffer && currentQuestion.options && currentQuestion.options.length > 0) {
            const rawText = currentQuestion.textBuffer.join('\n').trim();
            const formattedText = formatInlineText(rawText);

            questions.push({
                identifier: currentQuestion.identifier!,
                questionText: formattedText,
                options: currentQuestion.options.map(opt => ({
                    ...opt,
                    text: formatInlineLine(opt.text)
                })),
                correctAnswer: currentQuestion.correctAnswer || '',
                feedback: currentQuestion.feedback,
            });
            currentQuestion = {};
        }
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Strip {c}/{j} prefix before structural matching — keep it for body text
        const centerMatch = /^\{[cj]\}\s*/i.exec(trimmedLine);
        const structLine = centerMatch ? trimmedLine.slice(centerMatch[0].length) : trimmedLine;

        const isHeader = headerRegex.test(structLine);
        const optionMatch = structLine.match(optionRegex);

        if (isHeader) {
            finalizeQuestion();

            questionCounter++;
            const bodyText = structLine.replace(headerRegex, '').trim();
            // Preserve {c} on the question body text if the whole line was centered
            const questionBody = centerMatch ? `${centerMatch[0]}${bodyText}` : bodyText;

            currentQuestion = {
                identifier: `Q${questionCounter}`,
                textBuffer: [questionBody],
                options: [],
                correctAnswer: '',
            };
        } else if (optionMatch) {
            if (!currentQuestion.textBuffer) continue;

            const letter = optionMatch[1].toLowerCase();
            let text = structLine.replace(optionRegex, '').trim();

            if (/\{\s*(correto|correta)\s*\}/i.test(text)) {
                currentQuestion.correctAnswer = letter;
                text = text.replace(/\{\s*(correto|correta)\s*\}/i, '').trim();
            }

            currentQuestion.options?.push({ letter, text });

        } else if (feedbackRegex.test(structLine) && currentQuestion.textBuffer) {
            currentQuestion.feedback = structLine.replace(feedbackRegex, '').trim();
        } else if (currentQuestion.textBuffer) {
            // Body text: keep original (with {c} if present) so formatInlineText handles centering
            currentQuestion.textBuffer.push(trimmedLine);
        }
    }

    finalizeQuestion();

    // Apply gabarito: override correct answer and add feedback for each matched question
    if (gabaritoMap.size > 0) {
        questions.forEach((q, idx) => {
            const correction = gabaritoMap.get(idx + 1);
            if (!correction) return;
            q.correctAnswer = correction.correctLetter;
            if (correction.feedback) q.feedback = correction.feedback;
        });
    }

    return questions;
}

export function generateMoodleXML(questions: Question[], shuffle: boolean): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    questions.forEach((question, index) => {
        xml += `  <question type="multichoice">\n`;
        xml += `    <name><text>${question.identifier || `Q${index + 1}`}</text></name>\n`;
        xml += `    <questiontext format="html">\n`;
        xml += `      <text><![CDATA[${question.questionText}]]></text>\n`;
        xml += `    </questiontext>\n`;
        if (question.feedback) {
            xml += `    <generalfeedback format="html">\n`;
            xml += `      <text><![CDATA[<p>${question.feedback}</p>]]></text>\n`;
            xml += `    </generalfeedback>\n`;
        }
        xml += `    <shuffleanswers>${shuffle ? '1' : '0'}</shuffleanswers>\n`;
        question.options.forEach(option => {
            const fraction = option.letter === question.correctAnswer ? '100' : '0';
            xml += `    <answer fraction="${fraction}" format="html"><text><![CDATA[<p>${option.text}</p>]]></text></answer>\n`;
        });
        xml += `  </question>\n`;
    });
    xml += '</quiz>';
    return xml;
}
