import { TagNames } from "../../../../constants";
import { TagDefinition } from "../../types";
import { pageTreeTagCompletion } from "./pageTreeSnippet";

// --- Definition for table tag ---
export const pageTreeTagDefinition: TagDefinition = {
    tagName: TagNames.PAGE_TREE,
    isPairTag: false,
    snippetProvider: pageTreeTagCompletion,
    attributes: [
        // The table tag takes no attributes according to the snippet definition
    ]
};
