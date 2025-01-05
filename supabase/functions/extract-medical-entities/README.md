# Extract Medical Entities Function

This Edge Function uses the BiomedNLP-PubMedBERT model to extract medical entities from case studies and updates them in the database.

## Features

- Processes all case studies in the database
- Extracts medical entities using BiomedNLP-PubMedBERT
- Categorizes entities into: conditions, symptoms, medications, procedures, tests, and anatomical references
- Updates the medical_entities field for each case study

## Usage

The function can be invoked using:

```typescript
const { data, error } = await supabase.functions.invoke('extract-medical-entities');
```