import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { gridTagCompletion } from "./gridSnippet";

// --- Definition for grid tag ---
export const gridTagDefinition: TagDefinition = {
    tagName: TagNames.GRID,
    isPairTag: true,
    snippetProvider: gridTagCompletion,
    attributes: [
        {
            name: 'columns', // The required named parameter ($1)
            required: true,
            description: 'The number of columns in the grid layout (1-12).',
            isPositional: false,
            // Define the allowed values based on the snippet choices
            values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        }
        // NOTE: Grids also wrap content ({% grid_item %}), but we don't define 'content' as an attribute.
    ]
};
