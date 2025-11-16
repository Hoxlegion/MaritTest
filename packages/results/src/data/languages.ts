export interface Language {
  code: string
  name: string
}

export type LanguageCode = 'en' | 'nl'

const languages: Language[] = [
  {
    code: 'en',
    name: 'English'
  },
  {
    code: 'nl',
    name: 'Dutch'
  },
]

export default languages
