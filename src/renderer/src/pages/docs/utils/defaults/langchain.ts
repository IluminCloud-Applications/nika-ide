import { DocEntry } from '../../types'
import langchainContent from './langchain.md?raw'

export const langchainDoc: DocEntry = {
  slug: 'langchain',
  name: 'Langchain',
  description: 'AI integration and prompt engineering guide using LangChain and Gemini.',
  isDefault: true,
  content: langchainContent
}
