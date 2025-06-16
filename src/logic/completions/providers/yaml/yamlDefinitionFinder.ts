// logic/completions/providers/yaml/yamlDefinitionFinder.ts
import { moduleRootDefinition } from '../../../../definitions/yaml/rootModuleDefinition';
import { pageObjectDefinition } from '../../../../definitions/yaml/page/pageDefinition';
// Import YamlAttributeDefinition to use it as a type
import { YamlObjectDefinition, YamlAttributeDefinition } from '../../../../definitions/yaml/types';

/**
 * Finds the YamlObjectDefinition corresponding to a given path (derived from regex).
 * Traverses the predefined module structure.
 * @param nodePath Array of strings representing the keys navigated so far.
 * @returns The relevant YamlObjectDefinition or undefined.
 */
export function findDefinitionForPathRegex(nodePath: string[]): YamlObjectDefinition | undefined {
    let currentDef: YamlObjectDefinition | undefined = moduleRootDefinition as YamlObjectDefinition;
    console.log(`[findDefinitionForPathRegex] Traversing path: [${nodePath.join('/')}]`);

     // Handle empty path -> root definition
     if (nodePath.length === 0) {
         return moduleRootDefinition;
     }

    for (let i = 0; i < nodePath.length; i++) {
        const segment = nodePath[i];
        if (!currentDef?.attributes) {
            console.log(`  -> Path stopped at segment '${segment}': current definition or attributes missing.`);
            return undefined; // Cannot proceed
        }
        console.log(`  -> Current segment: '${segment}', Current Def ID: ${currentDef.id || 'unknown'}`);

        // Find the attribute definition for the current path segment
        const attrDef: YamlAttributeDefinition | undefined = currentDef.attributes.find(a => a.name === segment);

        if (!attrDef) {
            console.log(`  -> Key '${segment}' not found in definition ${currentDef.id || 'unknown'}`);
             // Special case: If path is ['sequence'] and 'page' is not explicitly defined but implied for list items
             if (segment === 'page' && i > 0 && nodePath[i - 1] === 'sequence') {
                 console.log("  -> Inferred 'page' segment under 'sequence', returning pageObjectDefinition.");
                 // If this is the last segment, return pageObjectDefinition
                 // If path continues, this case shouldn't normally be hit as 'page' isn't a container in pageObjectDefinition
                 return pageObjectDefinition;
             }
            return undefined; // Segment not defined
        }
        console.log(`  -> Found attrDef for key '${segment}'. Type: ${attrDef.dataType}, ObjDef: ${!!attrDef.objectDefinition}, ListItemDef: ${!!attrDef.listItemObjectDefinition}`);

        // Determine the definition for the *next* level or the final level
        if (i === nodePath.length - 1) {
            // Last segment in the path. Return the definition *for* this segment if it's a container.
            // Otherwise, the context remains within the *current* definition (currentDef).
            if (attrDef.objectDefinition) {
                currentDef = attrDef.objectDefinition;
            } else if (attrDef.listItemObjectDefinition) {
                currentDef = attrDef.listItemObjectDefinition;
            }
            // If it's a simple type (string, number, etc.), currentDef remains the container.
            break; // End of path
        } else {
            // Not the last segment, we must step into the definition for the next level.
            if (attrDef.objectDefinition) {
                currentDef = attrDef.objectDefinition;
            } else if (attrDef.listItemObjectDefinition) {
                 // Check if the *next* segment in the path implies a list item index (although our path doesn't store indices)
                 // Or just assume we step into the item definition if the attribute defines it.
                currentDef = attrDef.listItemObjectDefinition;
            } else {
                console.log(`  -> Path continues after non-container attribute '${segment}'. Invalid path.`);
                return undefined; // Cannot go deeper
            }
        }
    }
    console.log(`[findDefinitionForPathRegex] Traversal complete. Final definition ID: ${currentDef?.id || 'undefined'}`);
    return currentDef;
}