export class ContextManager {
  private sections: { [key: string]: string } = {};
  private entities: any = {};
  private specialization: string = '';
  private specializationContext: any = {};

  constructor(specialization: string, specializationContext: any) {
    this.specialization = specialization;
    this.specializationContext = specializationContext;
  }

  addSection(title: string, content: string) {
    this.sections[title] = content;
  }

  setEntities(entities: any) {
    this.entities = entities;
  }

  getPromptContext(sectionTitle: string): string {
    const previousSections = Object.entries(this.sections)
      .map(([title, content]) => `${title}:\n${content}`)
      .join('\n\n');

    return `As a ${this.specialization} physiotherapist, ${this.specializationContext.context}

Assessment Criteria for ${this.specialization}:
${this.specializationContext.assessmentCriteria.map((criterion: string) => `- ${criterion}`).join('\n')}

Previously Generated Sections:
${previousSections}

Extracted Medical Entities:
${JSON.stringify(this.entities, null, 2)}

Please generate the ${sectionTitle} section, ensuring it aligns with the ${this.specialization} specialization context and builds upon the previously generated content.`;
  }
}