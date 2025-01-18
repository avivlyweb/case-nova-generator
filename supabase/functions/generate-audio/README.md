# Generate Audio Edge Function

This edge function uses the Kokoro-82M ONNX model to generate audio from text for case studies.

## Features
- Converts text to speech using Kokoro-82M ONNX model
- Uses default voice (50-50 mix of Bella & Sarah)
- Generates 24khz audio output
- Stores generated audio in Supabase Storage
- Returns public URL for immediate playback

## Environment Variables Required
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Usage
Send a POST request with:
```json
{
  "text": "Text to convert to speech",
  "sectionId": "unique-section-identifier"
}
```

Response:
```json
{
  "url": "https://...audio.wav",
  "phonemes": [...],
  "message": "Audio generated successfully"
}
```