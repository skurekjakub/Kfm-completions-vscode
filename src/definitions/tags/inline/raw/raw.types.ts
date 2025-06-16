import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { rawTagCompletion } from "./rawSnippet";

// --- Definition for raw tag ---
export const rawTagDefinition: TagDefinition = {
    tagName: TagNames.RAW,
    isPairTag: true,
    snippetProvider: rawTagCompletion,
    attributes: [
        // The raw tag takes no attributes according to the snippet definition
    ]
};
