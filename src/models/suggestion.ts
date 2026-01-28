export enum SuggestionType {
  BOTH = 'both',
  DAY = 'day',
  TIME = 'time',
}

export interface Suggestion {
  day?: string;
  time?: string;
}