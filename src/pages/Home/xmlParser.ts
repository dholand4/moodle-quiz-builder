export interface Option {
    letter: string;
    text: string;
}

export interface Question {
    identifier: string;
    questionText: string;
    options: Option[];
    correctAnswer: string;
}

const escapeXML = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const formatInlineText = (text: string): string => {
    const escaped = escapeXML(text);
    return escaped
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
};

export function parseTextToQuestions(inputText: string): Question[] {
    const questions: Question[] = [];
    if (!inputText) return questions;

    const lines = inputText.trim().split('\n');

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
                    text: formatInlineText(opt.text)
                })),
                correctAnswer: currentQuestion.correctAnswer || '',
            });
            currentQuestion = {};
        }
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const isHeader = headerRegex.test(trimmedLine);
        const optionMatch = trimmedLine.match(optionRegex);

        if (isHeader) {
            finalizeQuestion();

            questionCounter++;
            const questionBody = trimmedLine.replace(headerRegex, '').trim();

            currentQuestion = {
                identifier: `Q${questionCounter}`,
                textBuffer: [questionBody],
                options: [],
                correctAnswer: '',
            };
        } else if (optionMatch) {
            if (!currentQuestion.textBuffer) continue;

            const letter = optionMatch[1].toLowerCase();
            let text = trimmedLine.replace(optionRegex, '').trim();

            if (/\{\s*(correto|correta)\s*\}/i.test(text)) {
                currentQuestion.correctAnswer = letter;
                text = text.replace(/\{\s*(correto|correta)\s*\}/i, '').trim();
            }

            currentQuestion.options?.push({ letter, text });

        } else if (currentQuestion.textBuffer) {
            currentQuestion.textBuffer.push(trimmedLine);
        }
    }

    finalizeQuestion();

    return questions;
}

export function generateMoodleXML(questions: Question[], shuffle: boolean): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
    questions.forEach((question, index) => {
        const questionTextWithBreaks = question.questionText.replace(/\n/g, '<br>');
        xml += `  <question type="multichoice">\n`;
        xml += `    <name><text>${question.identifier || `Q${index + 1}`}</text></name>\n`;
        xml += `    <questiontext format="html">\n`;
        xml += `      <text><![CDATA[<p>${questionTextWithBreaks}</p>]]></text>\n`;
        xml += `    </questiontext>\n`;
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
