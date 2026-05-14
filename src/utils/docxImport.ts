import mammoth from 'mammoth';
import { normalizeExtractedText } from '../pages/Home/xmlParser';

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeExtractedText(result.value);
}
