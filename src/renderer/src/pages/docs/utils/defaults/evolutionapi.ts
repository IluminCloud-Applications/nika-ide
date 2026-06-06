import { DocEntry } from '../../types'
import evolutionApiContent from './evolutionapi.md?raw'

export const evolutionApiDoc: DocEntry = {
  slug: 'evolution-api',
  name: 'Evolution API (Baileys)',
  description: 'API for WhatsApp integrations based on Baileys connection.',
  isDefault: true,
  content: evolutionApiContent
}
