# Generate Audio Edge Function

This edge function generates audio from text using the ONNX Web Runtime and saves it to Supabase Storage.

## Features

- Uses ONNX Web Runtime for lightweight text-to-speech conversion
- Generates WAV audio files at 24kHz sample rate
- Saves generated audio files to the 'knowledgecase' bucket
- Returns a public URL for audio playback

## Usage

Send a POST request to the function with:

```json
{
  "text": "Text to convert to speech",
  "sectionId": "unique-section-identifier"
}
```

The function will return:

```json
{
  "url": "https://...public-url-to-audio-file...",
  "message": "Audio generated successfully"
}
```

## Error Handling

If an error occurs, the function will return a 500 status code with:

```json
{
  "error": "Error message describing what went wrong"
}
```