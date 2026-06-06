import { DocEntry } from '../types'
import { brevoDoc } from './defaults/brevo'
import { assemblyaiDoc } from './defaults/assemblyai'
import { langchainDoc } from './defaults/langchain'
import { evolutionApiDoc } from './defaults/evolutionapi'
import { evolutionGoDoc } from './defaults/evolutiongo'

export const DEFAULT_DOCS: DocEntry[] = [
  brevoDoc,
  assemblyaiDoc,
  langchainDoc,
  evolutionApiDoc,
  evolutionGoDoc
]

