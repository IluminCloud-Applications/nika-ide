export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  isDefault?: boolean
  gradient?: string
  iconBg?: string
  tags?: string[]
}
