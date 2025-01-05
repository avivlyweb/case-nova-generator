import { ProcessedEntity } from "./types";

export const processEntityData = (entities: any[]) => {
  const entityDetails: Record<string, string[]> = {};
  const entityCounts: Record<string, number> = {};
  
  entities.forEach(entitySet => {
    if (typeof entitySet === 'object' && entitySet !== null) {
      Object.entries(entitySet).forEach(([category, entities]) => {
        if (Array.isArray(entities)) {
          entities.forEach(entity => {
            if (typeof entity === 'string') {
              const processedEntity = parseEntityString(entity);
              const formattedEntity = `${category}: ${processedEntity.term}`;
              
              // Store entity details
              if (!entityDetails[formattedEntity]) {
                entityDetails[formattedEntity] = [];
              }
              if (processedEntity.context) {
                entityDetails[formattedEntity].push(`Context: ${processedEntity.context}`);
              }
              if (processedEntity.significance) {
                entityDetails[formattedEntity].push(`Clinical Significance: ${processedEntity.significance}`);
              }
              
              // Count occurrences
              entityCounts[formattedEntity] = (entityCounts[formattedEntity] || 0) + 1;
            }
          });
        }
      });
    }
  });

  return { entityDetails, entityCounts };
};

export const parseEntityString = (entity: string): ProcessedEntity => {
  const matches = entity.match(/^(.*?)(?:\s*\((.*?)\))?\s*(?:\[(.*?)\])?$/);
  if (matches) {
    const [, term, context, significance] = matches;
    return {
      term: term.trim(),
      context,
      significance
    };
  }
  return { term: entity.trim() };
};