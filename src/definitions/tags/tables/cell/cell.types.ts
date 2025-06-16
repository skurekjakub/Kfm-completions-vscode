import { TagNames } from "../../../../constants";
import { AttributeDataType } from "../../../common/types";
import { TagDefinition } from "../../types";
import { cellTagCompletion } from "./cellSnippet";

// --- Definition for table tag ---
export const cellTagDefinition: TagDefinition = {
    tagName: TagNames.CELL,
    isPairTag: true,
    snippetProvider: cellTagCompletion,
    allowedParents: [TagNames.ROW], 
    attributes: [
        {
            name: 'insidelist',
            required: false
        },
        {
            name: 'colspan',
            required: false,
            values: [1, 2, 3, 4, 5, 6],
            dataType: AttributeDataType.String,
            description: "How many columns this cell spans."
        },
        {
            name: 'rowspan',
            required: false,
            values: [1, 2, 3, 4, 5, 6],
            dataType: AttributeDataType.String,
            description: "How many rows this cell spans."
        }
    ]
};
