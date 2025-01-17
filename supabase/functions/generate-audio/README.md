# Generate Audio Edge Function

This edge function generates audio from text using the Kokoro ONNX model and saves it to Supabase Storage.

## Features

- Uses Kokoro-82M ONNX model for text-to-speech conversion
- Downloads model at runtime to reduce function size
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