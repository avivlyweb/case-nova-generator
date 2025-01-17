import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import * as pdfParse from 'pdf-parse';

interface ProcessedSection {
  title: string;
  content: string;
  embedding?: number[];
}

interface ProcessedGuideline {
  title: string;
  condition: string;
  sections: ProcessedSection[];
  interventions: any[];
  evidence_levels: Record<string, any>;
  protocols: any[];
}

export async function processPDFGuideline(file: File): Promise<ProcessedGuideline | null> {
  try {
    // Read the PDF file
    const buffer = await file.arrayBuffer();
    const data = await pdfParse(buffer);
    
    // Split into sections based on headers
    const sections = splitIntoSections(data.text);
    
    // Process each section
    const processedSections = await Promise.all(
      sections.map(async (section) => {
        const embedding = await generateEmbedding(section.content);
        return {
          ...section,
          embedding
        };
      })
    );

    // Structure the data
    const guideline: ProcessedGuideline = {
      title: extractTitle(data.text),
      condition: extractCondition(data.text),
      sections: processedSections,
      interventions: extractInterventions(data.text),
      evidence_levels: extractEvidenceLevels(data.text),
      protocols: extractProtocols(data.text)
    };

    // Store in Supabase
    const { data: savedGuideline, error } = await supabase
      .from('dutch_guidelines')
      .insert([{
        title: guideline.title,
        condition: guideline.condition,
        content: { sections: guideline.sections },
        interventions: guideline.interventions,
        evidence_levels: guideline.evidence_levels,
        protocols: guideline.protocols,
        embedding: processedSections[0]?.embedding // Store main section embedding
      }])
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

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
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

function extractInterventions(text: string): any[] {
  // Extract interventions from specific section
  const interventions: any[] = [];
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

function extractProtocols(text: string): any[] {
  // Extract protocols from specific section
  const protocols: any[] = [];
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