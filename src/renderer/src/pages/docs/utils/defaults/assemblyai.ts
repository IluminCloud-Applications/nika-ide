import { DocEntry } from '../../types'

export const assemblyaiDoc: DocEntry = {
  slug: 'assemblyai',
  name: 'AssemblyAI (Speech-to-Text)',
  description: 'Pre-recorded speech-to-text API for audio transcription and analysis.',
  isDefault: true,
  content: `# AssemblyAI Pre-Recorded Audio Guide

## 1. Authentication & Base URL
- **Base URL (US)**: \`https://api.assemblyai.com\`
- **Base URL (EU)**: \`https://api.eu.assemblyai.com\`
- **Headers**:
  - \`Authorization\`: \`YOUR_API_KEY\` (Do **NOT** use the \`Bearer\` prefix)
  - \`Content-Type\`: \`application/json\`

## 2. Model Selection (\`speech_models\`)
The \`speech_models\` parameter is an ordered fallback list. The API tries the first model and falls back to the next if needed (e.g. if the detected language isn't supported by the primary model).
- **universal-3-pro**: Highest accuracy and speed. Supports English, Spanish, Portuguese, French, German, Italian.
- **universal-2**: Stable model covering 99 languages.
- **Recommended Default**: \`["universal-3-pro", "universal-2"]\`

## 3. Workflow for Local Files (Upload & Transcribe)

### Step A: Upload Local Audio File
Upload raw audio bytes directly (**not** multipart/form-data).
- **Endpoint**: \`POST /v2/upload\`
- **Headers**: \`Content-Type: application/octet-stream\`
- **Response**: \`{ "upload_url": "https://cdn.assemblyai.com/upload/..." }\`

### Step B: Submit Transcription Request
- **Endpoint**: \`POST /v2/transcript\`
- **Payload**:
\`\`\`json
{
  "audio_url": "https://cdn.assemblyai.com/upload/your-file-id",
  "speech_models": ["universal-3-pro", "universal-2"],
  "language_detection": true
}
\`\`\`
- **Response**: \`{ "id": "transcript_id", "status": "queued" }\`

### Step C: Polling Status
Poll the status of the transcription until it finishes.
- **Endpoint**: \`GET /v2/transcript/{id}\`
- **Response Statuses**: \`queued\`, \`processing\`, \`completed\`, \`error\`.

## 4. Python Example (requests)
\`\`\`python
import requests
import time

headers = {"authorization": "YOUR_API_KEY"}

# 1. Upload local file (optional)
with open("./audio.mp3", "rb") as f:
    upload = requests.post("https://api.assemblyai.com/v2/upload", headers=headers, data=f).json()
audio_url = upload["upload_url"]

# 2. Submit transcription job
data = {
    "audio_url": audio_url,
    "speech_models": ["universal-3-pro", "universal-2"],
    "language_detection": True
}
job = requests.post("https://api.assemblyai.com/v2/transcript", headers=headers, json=data).json()
transcript_id = job["id"]

# 3. Poll for results
while True:
    res = requests.get(f"https://api.assemblyai.com/v2/transcript/{transcript_id}", headers=headers).json()
    if res["status"] == "completed":
        print("Transcript:", res["text"])
        break
    elif res["status"] == "error":
        raise RuntimeError("Transcription failed:", res["error"])
    time.sleep(3)
\`\`\`
`
}
