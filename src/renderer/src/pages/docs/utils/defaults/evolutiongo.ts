import { DocEntry } from '../../types'
import evolutionGoContent from './evolutiongo.md?raw'

export const evolutionGoDoc: DocEntry = {
  slug: 'evolution-go',
  name: 'Evolution GO (Whatsmeow)',
  description: 'High performance WhatsApp API written in Go based on Whatsmeow.',
  isDefault: true,
  content: evolutionGoContent
}
