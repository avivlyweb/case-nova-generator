import { supabase } from '@/integrations/supabase/client';
import * as pdfParse from 'pdf-parse';

interface ProcessedSection {
  title: string;
  content: string;
}

interface ProcessedGuideline {
  title: string;
  condition: string;
  url: string;
  content: Record<string, any>;
  interventions: Record<string, any>[];
  evidence_levels: Record<string, any>;
  protocols: Record<string, any>[];
  embedding: string;
}

export async function processPDFGuideline(file: File): Promise<ProcessedGuideline | null> {
  try {
    // Read the PDF file
    const buffer = await file.arrayBuffer();
    const data = await pdfParse(buffer);
    
    // Extract title from the first line or specific pattern
    const title = extractTitle(data.text);
    
    // Split into sections based on headers
    const sections = splitIntoSections(data.text);
    
    // Generate embedding using Supabase's vector operations
    const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
      body: { text: data.text }
    });

    if (embeddingError) {
      console.error('Error generating embedding:', embeddingError);
      throw embeddingError;
    }

    // Structure the guideline data
    const guideline: ProcessedGuideline = {
      title: title, // Add the title field
      condition: extractCondition(data.text),
      url: URL.createObjectURL(file),
      content: { 
        sections: sections.map(s => ({
          title: s.title,
          content: s.content
        }))
      },
      interventions: extractInterventions(data.text),
      evidence_levels: extractEvidenceLevels(data.text),
      protocols: extractProtocols(data.text),
      embedding: JSON.stringify(embeddingData.embedding)
    };

    // Store in Supabase
    const { data: savedGuideline, error } = await supabase
      .from('dutch_guidelines')
      .insert({
        title: guideline.title,
        condition: guideline.condition,
        url: guideline.url,
        content: guideline.content,
        interventions: guideline.interventions,
        evidence_levels: guideline.evidence_levels,
        protocols: guideline.protocols,
        embedding: guideline.embedding,
        assessment_criteria: [],
        exercise_recommendations: [],
        sections: {},
        grade_evidence: {}
      })
      .select()
      .single();

    if (error) throw error;

    return guideline;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return null;
  }
}

function splitIntoSections(text: string): ProcessedSection[] {
  // Basic section splitting based on common headers
  const sectionRegex = /^(#+|\d+\.)\s+(.+)$/gm;
  const sections: ProcessedSection[] = [];
  let currentSection: ProcessedSection | null = null;
  let content = '';

  text.split('\n').forEach(line => {
    const match = line.match(sectionRegex);
    if (match) {
      if (currentSection) {
        currentSection.content = content.trim();
        sections.push(currentSection);
      }
      currentSection = {
        title: match[2],
        content: ''
      };
      content = '';
    } else if (currentSection) {
      content += line + '\n';
    }
  });

  if (currentSection) {
    currentSection.content = content.trim();
    sections.push(currentSection);
  }

  return sections;
}

function extractTitle(text: string): string {
  // Extract title from first line or specific pattern
  const firstLine = text.split('\n')[0];
  return firstLine.trim();
}

function extractCondition(text: string): string {
  // Extract condition from specific section or pattern
  const conditionRegex = /Condition:\s*(.+)/i;
  const match = text.match(conditionRegex);
  return match ? match[1].trim() : '';
}

function extractInterventions(text: string): Record<string, any>[] {
  // Extract interventions from specific section
  const interventions: Record<string, any>[] = [];
  const interventionRegex = /Intervention:\s*(.+?)(?=Intervention:|$)/gs;
  let match;
  
  while ((match = interventionRegex.exec(text)) !== null) {
    interventions.push({
      name: match[1].trim(),
      description: '',
      evidence_level: ''
    });
  }

  return interventions;
}

function extractEvidenceLevels(text: string): Record<string, any> {
  // Extract evidence levels from specific section
  const evidenceLevels: Record<string, any> = {};
  const evidenceRegex = /Evidence Level ([A-D]):\s*(.+)/g;
  let match;

  while ((match = evidenceRegex.exec(text)) !== null) {
    evidenceLevels[match[1]] = {
      description: match[2].trim(),
      count: 0
    };
  }

  return evidenceLevels;
}

function extractProtocols(text: string): Record<string, any>[] {
  // Extract protocols from specific section
  const protocols: Record<string, any>[] = [];
  const protocolRegex = /Protocol:\s*(.+?)(?=Protocol:|$)/gs;
  let match;

  while ((match = protocolRegex.exec(text)) !== null) {
    protocols.push({
      name: match[1].trim(),
      steps: []
    });
  }

  return protocols;
}