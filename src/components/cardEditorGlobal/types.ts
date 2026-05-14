export interface ICardOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestionCard {
  id: string;
  questionText: string;
  options: ICardOption[];
}
