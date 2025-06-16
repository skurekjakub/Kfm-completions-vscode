import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { tableTagCompletion } from "./tableSnippet";

// --- Definition for table tag ---
export const tableTagDefinition: TagDefinition = {
    tagName: TagNames.TABLE,
    isPairTag: true,
    snippetProvider: tableTagCompletion,
    attributes: [
        {
            name: 'insidelist',
            required: false
        }
    ]
};
