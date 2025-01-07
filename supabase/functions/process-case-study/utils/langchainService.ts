import { ChatGroq } from 'npm:@langchain/groq';
import { PromptTemplate } from 'npm:@langchain/core/prompts';
import { StringOutputParser } from 'npm:@langchain/core/output_parsers';
import { RunnableSequence } from 'npm:@langchain/core/runnables';
import type { CaseStudy } from './types.ts';

export class LangChainService {
  private model: ChatGroq;
  private outputParser: StringOutputParser;

  constructor(apiKey: string) {
    this.model = new ChatGroq({
      apiKey,
      temperature: 0.5,
      modelName: "gemma2-9b-it",
    });
    this.outputParser = new StringOutputParser();
  }

  async generateSection(
    sectionTitle: string,
    sectionDescription: string,
    caseStudy: CaseStudy,
    entities: any,
    references: any[]
  ) {
    const template = `Generate the following section for a physiotherapy case study:

{sectionTitle}

Description of what to include:
{sectionDescription}

Case Information:
Patient Name: {patientName}
Age: {age}
Gender: {gender}
Condition: {condition}
Medical History: {medicalHistory}
Background: {background}
Symptoms: {symptoms}
Comorbidities: {comorbidities}
Psychosocial Factors: {psychosocialFactors}

Medical Entities Found:
{entities}

Relevant References:
{references}

Please ensure your response:
1. Is evidence-based and suitable for PhD/university level
2. Uses proper markdown formatting
3. Includes clinical reasoning
4. References the provided literature using clickable links [Author et al](URL)
5. Uses proper markdown table syntax with | for columns when presenting data
6. Includes evidence levels for each recommendation`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = RunnableSequence.from([
      prompt,
      this.model,
      this.outputParser
    ]);

    const response = await chain.invoke({
      sectionTitle,
      sectionDescription,
      patientName: caseStudy.patient_name,
      age: caseStudy.age,
      gender: caseStudy.gender,
      condition: caseStudy.condition || '',
      medicalHistory: caseStudy.medical_history || '',
      background: caseStudy.patient_background || '',
      symptoms: caseStudy.presenting_complaint || '',
      comorbidities: caseStudy.comorbidities || '',
      psychosocialFactors: caseStudy.psychosocial_factors || '',
      entities: JSON.stringify(entities, null, 2),
      references: references.map(ref => `[${ref.citation}](${ref.url})`).join('\n')
    });

    return {
      title: sectionTitle,
      content: response
    };
  }

  async generateQuickAnalysis(caseStudy: CaseStudy) {
    const template = `You are a phd level KNGF physiotherapist analyzing case studies. Provide insights about the case in a concise, professional manner. Focus on key medical observations, potential implications, and suggested areas for further investigation. Format your response using proper markdown, including tables with the | syntax when appropriate. Include relevant ICF codes in your analysis using the format b### for body functions, d### for activities and participation, e### for environmental factors, and s### for body structures.

Patient: {patientName}
Age: {age}
Gender: {gender}
Medical History: {medicalHistory}
Presenting Complaint: {presentingComplaint}
Condition: {condition}`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = RunnableSequence.from([
      prompt,
      this.model,
      this.outputParser
    ]);

    const response = await chain.invoke({
      patientName: caseStudy.patient_name,
      age: caseStudy.age,
      gender: caseStudy.gender,
      medicalHistory: caseStudy.medical_history || 'None provided',
      presentingComplaint: caseStudy.presenting_complaint || 'None provided',
      condition: caseStudy.condition || 'Not specified'
    });

    return response;
  }

  async generateClinicalGuidelines(condition: string) {
    const template = `Generate relevant clinical guidelines for {condition} in physiotherapy practice. Include guideline names, URLs, and key recommendations. Format as JSON array with objects containing name, url, and key_points fields.`;
    
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = RunnableSequence.from([prompt, this.model, this.outputParser]);
    const response = await chain.invoke({ condition });
    
    return JSON.parse(response);
  }

  async generateLearningObjectives(caseStudy: CaseStudy) {
    const template = `Generate specific learning objectives for a physiotherapy student studying this case of {condition}. Include clinical reasoning, evidence-based practice, and practical skills objectives.`;
    
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = RunnableSequence.from([prompt, this.model, this.outputParser]);
    const response = await chain.invoke({ condition: caseStudy.condition });
    
    return JSON.parse(response);
  }

  async generateClinicalReasoningPath(caseStudy: CaseStudy) {
    const template = `Create a clinical reasoning pathway for {condition}, including differential diagnosis, clinical tests, and decision points. Format as a structured JSON array with reasoning steps.`;
    
    const prompt = PromptTemplate.fromTemplate(template);
    const chain = RunnableSequence.from([prompt, this.model, this.outputParser]);
    const response = await chain.invoke({ condition: caseStudy.condition });
    
    return JSON.parse(response);
  }
}