import { DocEntry } from '../../types'
import brevoContent from './brevo.md?raw'

export const brevoDoc: DocEntry = {
  slug: 'brevo',
  name: 'Brevo (SMTP & SMS)',
  description: 'Transactional email, batch email, SMS, tracking and scheduling API configuration.',
  isDefault: true,
  content: brevoContent
}
