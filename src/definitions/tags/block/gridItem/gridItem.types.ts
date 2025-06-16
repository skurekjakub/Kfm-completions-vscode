import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { gridItemTagCompletion } from "./gridItemSnippet";

// --- Definition for table tag ---
export const gridItemTagDefinition: TagDefinition = {
    tagName: TagNames.GRID_ITEM,
    isPairTag: true,
    snippetProvider: gridItemTagCompletion,
    attributes: [
        // The table tag takes no attributes according to the snippet definition
    ]
};
