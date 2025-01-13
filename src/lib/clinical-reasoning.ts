interface ClinicalReasoningStep {
  title: string;
  content: string;
  evidence_level?: string;
  references?: string[];
}

interface ClinicalReasoning {
  introduction: string;
  history: string;
  assessment: string;
  special_tests: string[];
  red_flags: string[];
  reasoning_path: ClinicalReasoningStep[];
}

export const parseClinicalReasoning = (text: string): ClinicalReasoning => {
  const sections = text.split('\n\n');
  const reasoning: ClinicalReasoning = {
    introduction: '',
    history: '',
    assessment: '',
    special_tests: [],
    red_flags: [],
    reasoning_path: []
  };

  let currentSection = '';
  
  sections.forEach(section => {
    if (section.toLowerCase().includes('introduction:')) {
      reasoning.introduction = section.replace('Introduction:', '').trim();
    } else if (section.toLowerCase().includes('history taken:')) {
      reasoning.history = section.replace('History Taken:', '').trim();
    } else if (section.toLowerCase().includes('assessment:')) {
      reasoning.assessment = section.replace('Assessment:', '').trim();
    } else if (section.toLowerCase().includes('special tests:')) {
      reasoning.special_tests = section
        .replace('Special Tests:', '')
        .trim()
        .split('\n')
        .filter(test => test.trim().length > 0)
        .map(test => test.replace(/^\d+\.\s*/, '').trim());
    } else if (section.toLowerCase().includes('red flags:')) {
      reasoning.red_flags = section
        .replace('Red Flags:', '')
        .trim()
        .split('\n')
        .filter(flag => flag.trim().length > 0)
        .map(flag => flag.replace(/^-\s*/, '').trim());
    } else if (section.toLowerCase().includes('clinical reasoning:')) {
      reasoning.reasoning_path.push({
        title: 'Clinical Analysis',
        content: section.replace('Clinical Reasoning:', '').trim()
      });
    }
  });

  return reasoning;
};

export const formatClinicalReasoning = (reasoning: ClinicalReasoning): { title: string; content: string }[] => {
  return [
    {
      title: 'Patient Introduction',
      content: reasoning.introduction
    },
    {
      title: 'Medical History',
      content: reasoning.history
    },
    {
      title: 'Assessment Strategy',
      content: reasoning.assessment
    },
    {
      title: 'Special Tests',
      content: reasoning.special_tests.map(test => `- ${test}`).join('\n')
    },
    {
      title: 'Red Flags',
      content: reasoning.red_flags.map(flag => `- ${flag}`).join('\n')
    },
    ...reasoning.reasoning_path.map(step => ({
      title: step.title,
      content: step.content
    }))
  ];
};

export const importClinicalCase = async (caseText: string) => {
  try {
    const parsedCase = parseClinicalReasoning(caseText);
    const formattedSections = formatClinicalReasoning(parsedCase);
    
    return {
      sections: formattedSections,
      analysis: parsedCase.reasoning_path[0]?.content || ''
    };
  } catch (error) {
    console.error('Error parsing clinical case:', error);
    throw new Error('Failed to parse clinical case structure');
  }
};