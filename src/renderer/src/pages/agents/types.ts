export interface Agent {
  id: string
  name: string
  description: string
  systemInstructions: string
  isDefault?: boolean
  gradient?: string
  iconBg?: string
  tags?: string[]
}
