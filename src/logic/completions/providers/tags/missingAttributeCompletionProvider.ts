import * as vscode from 'vscode';
import { MARKDOWN, TagNames } from '../../../../constants';
import { TagUtils } from '../../../_helpers/tagUtils';
import { getTagDefinition } from '../../../../definitions/definitionRegister';

/**
 * SINGLE provider that suggests missing NAMED attributes for ANY known tag.
 * Triggers on space (' ') within the tag definition, but not inside attribute value quotes.
 */
export const missingAttributeProvider = vscode.languages.registerCompletionItemProvider(
    MARKDOWN,
    {
        async provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken,
                context: vscode.CompletionContext) 
        {
            // Only trigger on space or manual invocation for now
            if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && context.triggerCharacter !== ' ') {
                return undefined;
            }
            // --- Declare currentTagName with the Enum type ---
            let currentTagName: TagNames | undefined;
            // --- Declare the variable to hold the full context ---
            let currentTagContext: { tagContent: string; tagRange: vscode.Range; startTagPos: vscode.Position; tagName: TagNames } | undefined;


            // Iterate using Object.keys
            for (const tagNameKey of Object.keys(TagNames)) {
                // Get the string value associated with the key
                const tagNameValue = TagNames[tagNameKey as keyof typeof TagNames];

                // Ensure we are using the string value
                if (typeof tagNameValue === 'string') {
                    // Call findEnclosingTagRange with the string value
                    const tagContextResult = TagUtils.findEnclosingTagRange(document, position, tagNameValue);

                    if (tagContextResult) {
                        // --- Assign the validated string value to the variable typed as TagNames ---
                        currentTagName = tagNameValue;
                        // --- Construct the full context object ---
                        currentTagContext = { ...tagContextResult, tagName: currentTagName };
                        // console.log(`Detected cursor potentially inside ${currentTagName} tag.`);
                        break; // Found the most likely enclosing tag
                    }
                }
            }

            // Check if a tag context was found
            if (!currentTagContext) {
                return undefined; // Not inside any known tag definition
            }

            // Now you can safely use currentTagContext.tagName, which is typed as TagNames
            const { tagName, /* ... rest of context ... */ } = currentTagContext;

            // 2. If inside a known tag, call the generalized function
            if (currentTagName) {
                // The provideMissingTagAttributes function already handles:
                // - Checking if cursor is NOT in quotes
                // - Checking if positional params need to be entered first
                // - Finding existing attributes and suggesting missing named ones
                return await provideMissingTagAttributes(document, position, tagName);
            }
            // If not inside any known tag context where attributes might be added
            return undefined;
        }
    },
    ' ' // Trigger when a space is typed
);

/**
 * Provides completion items for missing attributes within a specific tag.
 *
 * @param document The text document.
 * @param position The cursor position.
 * @param tagName The specific TagNames enum value for the tag being checked.
 * @returns An array of CompletionItems for missing attributes, or undefined.
 */
async function provideMissingTagAttributes(
    document: vscode.TextDocument,
    position: vscode.Position,
    tagName: TagNames
): Promise<vscode.CompletionItem[] | undefined> {

    const tagDefinition = getTagDefinition(tagName);
    if (!tagDefinition) { return undefined; };

    const tagContext = TagUtils.findEnclosingTagRange(document, position, tagName);
    if (!tagContext) { return undefined; };

    const hasPositionalParams = tagDefinition.attributes.some(attr => attr.isPositional);

    if (hasPositionalParams) {
        // Calculate cursor offset relative to the start of the tag {%
        const offsetInTag = document.offsetAt(position) - document.offsetAt(tagContext.startTagPos);
        // Get the text within the tag definition from its start up to the cursor
        const textBeforeCursorInTag = tagContext.tagContent.substring(0, offsetInTag);

        // Check if the text before the cursor ONLY contains the tag name and whitespace
        // (meaning the cursor is right after '{% tagName ' )
        const tagStartRegex = new RegExp(`^\\{\\%\\s*${tagName}\\s*$`, 'i');
        // Trim trailing space because the trigger character is space
        if (tagStartRegex.test(textBeforeCursorInTag.trimEnd())) {
            const firstPositionalAttr = tagDefinition.attributes.find(attr => attr.isPositional);

            if (firstPositionalAttr?.loadSupportedValues) {
                // If it has a loader, call it to get value suggestions
                console.log(`Cursor after ${tagName}, providing positional value completions for ${firstPositionalAttr.name}`);
                // Pass necessary context to the loader function
                const currentAttributes = TagUtils.parseAttributes(tagContext.tagContent);
                return await firstPositionalAttr.loadSupportedValues(document, position, tagContext, firstPositionalAttr, currentAttributes);
            } else if (firstPositionalAttr?.values && Array.isArray(firstPositionalAttr?.values)) {
                return await convertValuesToCompletions(firstPositionalAttr.values);
            } else {
                // No loader defined for the first positional arg, or no positional args
                // Provide no suggestions here (allow user to type freely)
                // or potentially suggest missing *required named* attributes immediately? Less common.
                console.log(`Cursor after ${tagName}, no positional value loader found.`);
                return undefined;
            }
        }
    }

    // Check if cursor is inside ANY named attribute value's quotes
    let cursorInValue = false;
    for (const attrDef of tagDefinition.attributes) {
        if (!attrDef.isPositional) {
            // --- Decide which helper to use based on omitValueSnippet ---
            if (attrDef.omitValueSnippet) {
                // Check if inside UNQUOTED value area
                cursorInValue = TagUtils.isCursorInsideUnquotedAttributeValue(document, position, tagContext, attrDef.name);
            } else {
                // Check if inside QUOTED value area
                cursorInValue = TagUtils.isCursorInsideQuotedAttributeValue(document, position, tagContext, attrDef.name);
            }
        }
    }
    if (cursorInValue) { return undefined; }; // Let value completion provider handle it

    // Parse existing NAMED attributes
    const existingAttrNames = new Set<string>();
    const attrNameRegex = /\b(\w+)\s*=/gi;
    let match;
    while ((match = attrNameRegex.exec(tagContext.tagContent)) !== null) {
        existingAttrNames.add(match[1].toLowerCase());
    }

    // Determine missing NAMED attributes and create completions
    const missingAttributeCompletions: vscode.CompletionItem[] = [];
    tagDefinition.attributes.forEach(attrDef => {
        if (!attrDef.isPositional && !existingAttrNames.has(attrDef.name.toLowerCase())) {
            const item = new vscode.CompletionItem(attrDef.name, vscode.CompletionItemKind.Property);
            if (attrDef.omitValueSnippet) {
                // Insert just the attribute name, maybe followed by a space
                item.insertText = new vscode.SnippetString(attrDef.name + '=$1 ');
            } else {
                // Default: Insert attribute name with snippet for value
                item.insertText = new vscode.SnippetString(`${attrDef.name}="$1" `);
            }
            item.documentation = new vscode.MarkdownString(attrDef.description || `The ${attrDef.name} attribute.`);
            item.detail = attrDef.required ? '(Required)' : '(Optional)';
            // Priority
            const sortPrefix = attrDef.required ? 'AAA' : 'AAB';
            item.sortText = `${sortPrefix}_Atcmpl${tagName}MissingAttr_${attrDef.name}`;
            item.preselect = attrDef.required;
            missingAttributeCompletions.push(item);
        }
    });

    return missingAttributeCompletions.length > 0 ? missingAttributeCompletions : undefined;
}

async function convertValuesToCompletions(values: (string | number | boolean)[]): Promise<vscode.CompletionItem[]> {
    return values.map(val => {
        const item = new vscode.CompletionItem(val.toString(), vscode.CompletionItemKind.EnumMember);
        item.insertText = val.toString();
        item.sortText = `AAA_${val}`;
        return item;
    });
}
