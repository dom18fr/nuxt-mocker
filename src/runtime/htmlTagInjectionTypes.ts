type HtmlTagInjectionMapItem = { 
  tagName: string;
  wordCountMin: number;
  wordCountMax: number; 
  probability: number;
}

type HtmlTagInjection = { 
  tagName: string;
  wordCount: number;
  startIndex: number;
}