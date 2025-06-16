// logic/completions/parameters/types.ts

import { TagNames, LANGS } from "../../../../constants";
import { TagDefinition } from "../../types";
import { getCodeBlockDecorations } from "./codeDecorations";
import { codeTagCompletion } from "./codeSnippet";
import { getLangCompletions } from "./helpers";

export const codeTagDefinition: TagDefinition = {
    tagName: TagNames.CODE,
    isPairTag: true,
    snippetProvider: codeTagCompletion,
    decorationProviders: [
        {
            decorationTypeName: "codeHighlight",
            provider: getCodeBlockDecorations,
        }
    ],
    attributes: [
        {
            name: 'lang',
            required: true,
            description: `The programming language for syntax highlighting. Possible values: ${LANGS.join(', ')}`, // Add possible values to description
            isPositional: false,
            omitValueSnippet: true,
            loadSupportedValues: async () => getLangCompletions()
        },
        {
            name: 'title',
            required: false,
            description: 'An optional title displayed for the code block.',
            isPositional: false
        },
        {
            name: 'header',
            required: false,
            description: 'Optionally hides the entire code block header',
            isPositional: false,
            values: ['true', 'false'],
            omitValueSnippet: true
        },
        {
            name: 'highlight',
            required: false,
            description: 'Adds line highlights. Example usage: highlight=4-7,10',
            isPositional: false,
            omitValueSnippet: true
        },
    ]
};
