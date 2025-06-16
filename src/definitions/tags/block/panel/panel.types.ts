import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { panelTagCompletion } from "./panelSnippet";

// --- Definition for table tag ---
export const panelTagDefinition: TagDefinition = {
    tagName: TagNames.PANEL,
    isPairTag: true,
    snippetProvider: panelTagCompletion,
    attributes: [
        // The table tag takes no attributes according to the snippet definition
    ]
};
