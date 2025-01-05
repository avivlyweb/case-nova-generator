import { ProcessedEntity, ProcessedEntityData } from "./types";

/**
 * Processes raw medical entity data into a structured format
 * @param entities - Array of raw medical entity objects
 * @returns Object containing processed entity details and counts
 */
export const processEntityData = (entities: any[]): ProcessedEntityData => {
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
              
              // Initialize entity details array if not exists
              if (!entityDetails[formattedEntity]) {
                entityDetails[formattedEntity] = [];
              }

              // Add context information if available
              if (processedEntity.context) {
                entityDetails[formattedEntity].push(
                  `Context: ${processedEntity.context}`
                );
              }

              // Add clinical significance if available
              if (processedEntity.significance) {
                entityDetails[formattedEntity].push(
                  `Clinical Significance: ${processedEntity.significance}`
                );
              }
              
              // Increment entity count
              entityCounts[formattedEntity] = (entityCounts[formattedEntity] || 0) + 1;
            }
          });
        }
      });
    }
  });

  return { entityDetails, entityCounts };
};

/**
 * Parses a medical entity string into its components
 * Format: "term (context) [significance]"
 * @param entity - Raw entity string
 * @returns Processed entity object with separated components
 */
export const parseEntityString = (entity: string): ProcessedEntity => {
  const matches = entity.match(/^(.*?)(?:\s*\((.*?)\))?\s*(?:\[(.*?)\])?$/);
  if (matches) {
    const [, term, context, significance] = matches;
    return {
      term: term.trim(),
      context: context?.trim(),
      significance: significance?.trim()
    };
  }
  return { term: entity.trim() };
};