import * as vscode from 'vscode';

import { HeaderContext } from '../../helpers/headerContext.types';
import { MARKDOWN } from '../../../../constants';

import { markdownHeaderDefinition } from '../../../../definitions/header/headerDefinition';
import { getHeaderContext } from '../../helpers/headerContextRetriever'; 

export const headerAttributeValueProvider = vscode.languages.registerCompletionItemProvider(
    MARKDOWN,
    {
        async provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            context: vscode.CompletionContext
        ): Promise<vscode.CompletionItem[] | undefined> {

            // 1. Get the detailed context using the refactored function
            const headerContext: HeaderContext = getHeaderContext(document, position);

            // 2. Use a switch statement on the contextType for type safety
            switch (headerContext.contextType) {

                case 'AttributeValue': {
                    // We are expecting a value for a standard 'key: value' attribute
                    const { attributeName, attributeDefinition } = headerContext; // Safely access properties
                    const attrDef = attributeDefinition ?? markdownHeaderDefinition.attributes.find(a => a.name === attributeName); // Fallback lookup if needed

                    if (!attrDef) {
                        console.log(` -> Attribute ${attributeName} not found in header definition.`);
                        return undefined;
                    }

                    console.log(`Context: AttributeValue - Providing completions for '${attrDef.name}'`);

                    // Provide completions based on the definition (load dynamically or use static list)
                    if (attrDef.loadSupportedValues) {
                        console.log(` -> Calling loadSupportedValues for ${attrDef.name}`);
                        const currentAttributes = headerContext.parsedHeader || {};
                        // Pass the specific context subtype
                        return await attrDef.loadSupportedValues(document, position, headerContext, attrDef, currentAttributes);
                    } else if (attrDef.values && Array.isArray(attrDef.values)) {
                        console.log(` -> Providing static values for ${attrDef.name}`);
                        return attrDef.values.map(val => {
                            const item = new vscode.CompletionItem(String(val), vscode.CompletionItemKind.EnumMember);
                            item.insertText = String(val);
                            item.detail = `Value for ${attrDef.name}`;
                            item.sortText = `A_${val}`;
                            return item;
                        });
                    } else {
                        console.log(` -> No specific values or loader defined for ${attrDef.name}`);
                        return undefined;
                    }
                }

                case 'ListItemValue': {
                    // We are expecting a value for a YAML list item ('- value')
                    const { parentAttributeName, parentAttributeDefinition } = headerContext; // Safely access properties
                    const parentAttrDef = parentAttributeDefinition ?? markdownHeaderDefinition.attributes.find(a => a.name === parentAttributeName); // Fallback lookup

                    // Check if the parent attribute is defined, is a list, and has a loader
                    if (parentAttrDef?.dataType?.endsWith('[]') && parentAttrDef?.loadSupportedValues) {
                        console.log(`Context: ListItemValue - Calling loadSupportedValues for list item in '${parentAttrDef.name}'`);
                        const currentAttributes = headerContext.parsedHeader || {};
                         // Pass the specific context subtype
                        return await parentAttrDef.loadSupportedValues(document, position, headerContext, parentAttrDef, currentAttributes);
                    } else {
                        console.log(` -> List attribute ${parentAttributeName} has no value loader or is not defined as a list.`);
                        return undefined;
                    }
                }

                // --- NEW CASE for Nested Attribute Values ---
                case 'NestedAttributeValue': {
                    const { nestedAttributeName, nestedAttributeDefinition, parentAttributeName } = headerContext;
                    console.log(`Provider Context: NestedAttributeValue - Suggesting values for '${parentAttributeName}.${nestedAttributeName}'`);

                    // Check for loader first (though unlikely for min/max level)
                    if (nestedAttributeDefinition.loadSupportedValues) {
                         console.log(` -> Calling loadSupportedValues for nested ${nestedAttributeName}`);
                         // Note: Loader needs access to full context if it depends on parent/siblings
                         return await nestedAttributeDefinition.loadSupportedValues(document, position, headerContext, nestedAttributeDefinition, headerContext.parsedHeader || {});
                    }
                    // Check for static values (this will pick up the '1'-'6')
                    else if (nestedAttributeDefinition.values && Array.isArray(nestedAttributeDefinition.values)) {
                         console.log(` -> Providing static values for nested ${nestedAttributeName}`);
                         return nestedAttributeDefinition.values.map(val => {
                            const item = new vscode.CompletionItem(String(val), vscode.CompletionItemKind.Value);
                            item.insertText = String(val);
                            item.detail = `Value for ${parentAttributeName}.${nestedAttributeName}`;
                            item.sortText = `N_${String(val)}`; // Sort numerically if possible
                            return item;
                         });
                    } else {
                         console.log(` -> No specific values or loader defined for nested ${nestedAttributeName}`);
                         return undefined;
                    }
                }

                // Cases where this provider should not activate
                case 'AttributeKey':
                case 'NotInHeader':
                default:
                    // console.log(`Context: ${headerContext.contextType} - No value completions needed.`);
                    return undefined;
            }
        }
    },
    ' ' // Trigger completion after a space (works for 'key: ' and '- ')
    // ':' // Optionally trigger after colon if needed
    // Removed '[' and "'" triggers previously associated with bracketed arrays
);