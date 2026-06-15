import { StreamLanguage } from '@codemirror/language';

export const quizLanguage = StreamLanguage.define({
  name: 'quiz',
  token(stream) {
    // Question header: "1.", "Questão 1.", "1 -" etc.
    if (stream.sol()) {
      if (stream.match(/^(?:quest[aã]o\s*)?\d+\s*[.\-]?\s*/i)) {
        return 'keyword';
      }
      // Correct answer option: starts with *a) or a) ... {correto}
      if (stream.match(/^\*[a-hA-H][.)]\s*/)) {
        return 'string';
      }
      // Option line: a) b) c) etc.
      if (stream.match(/^[a-hA-H][.)]\s*/)) {
        return 'variableName';
      }
      // Image placeholder
      if (stream.match(/^\[imagem\d+\]/i)) {
        return 'meta';
      }
    }

    // Inline: {correto} or {correta}
    if (stream.match(/\{\s*corret[ao]\s*\}/i)) {
      return 'string';
    }

    // Inline: `code`
    if (stream.match(/`[^`\n]+`/)) return 'meta';

    // Inline: *bold* or _italic_
    if (stream.match(/\*[^*]+\*/)) return 'emphasis';
    if (stream.match(/_[^_]+_/)) return 'emphasis';

    // Inline image placeholder anywhere
    if (stream.match(/\[imagem\d+\]/i)) return 'meta';

    stream.next();
    return null;
  },
});
