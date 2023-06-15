import memo from "fast-memoize";

export default memo((plainText: string) => plainText.split('\n').reduce((acc, paragraph) => `${acc}<p>${injectInParagraph(paragraph).text}</p>`,''))

const injectInParagraph = (paragraph: string) => paragraph.split(' ').reduce(
  (htmlAcc, word: string, currentIndex: number) => {
    
    const { text, tagInjection } = htmlAcc as { text: string, tagInjection: HtmlTagInjection|undefined }
    
    if (tagInjection) {
      if (tagInjection.wordCount + tagInjection.startIndex === currentIndex) {

        return {
          text: text + ' ' + `${word}</${tagInjection.tagName}>`
        }
      }

      return {
        text: text + ' ' + word,
        tagInjection
      }

    }
    // @todo: move it in a separate fuction
    // @todo: add <a/>
    const tagInjectionsMap: HtmlTagInjectionMapItem[] = [
      {
        tagName: 'strong',
        wordCountMin: 1,
        wordCountMax: 4,
        probability: 20
      },
      {
        tagName: 'em',
        wordCountMin: 1,
        wordCountMax: 2,
        probability: 10
      },
      {
        tagName: 'h2',
        wordCountMin: 1,
        wordCountMax: 4,
        probability: 5
      },
      {
        tagName: 'a',
        wordCountMin: 1,
        wordCountMax: 3,
        probability: 10
      }
    ]
    const universe = tagInjectionsMap.reduce((acc,{ probability }: HtmlTagInjectionMapItem) => acc + probability, 0)
    const shouldInject = Math.random() * 100 < 10
    if (shouldInject) {
      const ran = Math.random()
      const nextInjectionMapItem = tagInjectionsMap.sort((a: HtmlTagInjectionMapItem, b: HtmlTagInjectionMapItem) => a.probability > b.probability ? 1 : -1 ).reduce(
        (acc: {offset: number, injection: HtmlTagInjectionMapItem}, tagInjectionMapItem: HtmlTagInjectionMapItem) => {
          if (acc.injection.probability > 0) {
            return acc
          }
          if (ran <  (acc.offset + tagInjectionMapItem.probability) / universe) {
          
            return {
              offset: acc.offset + tagInjectionMapItem.probability,
              injection: tagInjectionMapItem
            }
          }

          return {
            ...acc,
            offset: acc.offset + tagInjectionMapItem.probability,
          }
        },
        {
          offset: 0,
          injection: {
            tagName: '',
            wordCountMin: 0,
            wordCountMax: 0,
            probability: 0,
          }
        }
      )
      const nextInjection: HtmlTagInjection = {
        tagName: nextInjectionMapItem.injection.tagName,
        startIndex: currentIndex,
        wordCount: Math.round(Math.random() * (nextInjectionMapItem.injection.wordCountMax - nextInjectionMapItem.injection.wordCountMin) + nextInjectionMapItem.injection.wordCountMin)
      }

      return {
        text: text + ' ' + `<${nextInjectionMapItem.injection.tagName}>` + word,
        tagInjection: nextInjection 
      }

    }

    return {
      text: text + ' ' + word,
      tagInjection
    }
  },
  {
    text: '',
  }
)