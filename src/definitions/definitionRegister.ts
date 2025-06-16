import { TagDefinition } from './tags/types';
import { TagNames } from '../constants';

const definitions = new Map<TagNames, TagDefinition>();

export function registerTagDefinition(definition: TagDefinition): void {
    if (definition && definition.tagName) {
        if (definitions.has(definition.tagName)) {
            console.warn(`Duplicate registration attempt for tag: ${definition.tagName}`);
            throw new Error(`Duplicate registration attempt for tag: ${definition.tagName}`);
        }
        definitions.set(definition.tagName, definition);
        // console.log(`Registered tag definition: ${definition.tagName}`);
    } else {
        console.error("Attempted to register invalid tag definition:", definition);
        throw new Error(`Attempted to register invalid tag definition: ${definition}`);
    }
}

export function getTagDefinition(tagName: TagNames): TagDefinition | undefined {
    return definitions.get(tagName);
}

export function getAllTagDefinitions(): TagDefinition[] {
    return Array.from(definitions.values());
}

// Optional: Return as a map if that's more useful for providers
export function getTagDefinitionMap(): ReadonlyMap<TagNames, TagDefinition> {
    return definitions;
}