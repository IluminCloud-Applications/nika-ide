import { DocEntry } from '../../types'
import assemblyaiContent from './assemblyai.md?raw'

export const assemblyaiDoc: DocEntry = {
  slug: 'assemblyai',
  name: 'AssemblyAI (Speech-to-Text)',
  description: 'Pre-recorded speech-to-text API for audio transcription and analysis.',
  isDefault: true,
  content: assemblyaiContent
}
