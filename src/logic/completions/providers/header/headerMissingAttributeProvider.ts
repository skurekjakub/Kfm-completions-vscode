import * as vscode from 'vscode';
import { MARKDOWN } from '../../../../constants';
import { HeaderContext } from '../../helpers/headerContext.types';
import { getHeaderContext } from '../../helpers/headerContextRetriever';
import { markdownHeaderDefinition } from '../../../../definitions/header/headerDefinition';

export const headerMissingAttributeProvider = vscode.languages.registerCompletionItemProvider(
    MARKDOWN,
    {
        async provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            context: vscode.CompletionContext
        ): Promise<vscode.CompletionItem[] | undefined> {

            const headerContext: HeaderContext = getHeaderContext(document, position);

            // Use switch based on context type
            switch (headerContext.contextType) {

                case 'AttributeKey': {
                    // Suggest top-level missing attributes
                    console.log("Provider Context: AttributeKey - Suggesting top-level attributes.");
                    const existingNames = new Set(Object.keys(headerContext.parsedHeader || {}));
                    const completionPromises: Promise<vscode.CompletionItem | undefined>[] = [];

                    markdownHeaderDefinition.attributes.forEach(attrDef => {
                         if (!existingNames.has(attrDef.name)) {
                            // Use custom generator or default
                             if (attrDef.getMissingAttributeCompletion) {
                                 completionPromises.push(
                                    attrDef.getMissingAttributeCompletion(document, position, headerContext, attrDef)
                                 );
                             } else {
                                const item = new vscode.CompletionItem(attrDef.name, vscode.CompletionItemKind.Property);
                                item.insertText = new vscode.SnippetString(`${attrDef.name}: $0`);
                                item.documentation = new vscode.MarkdownString(attrDef.description || `The ${attrDef.name} header attribute.`);
                                item.detail = attrDef.required ? '(Required)' : '(Optional)';
                                item.sortText = attrDef.required ? `A_${attrDef.name}` : `B_${attrDef.name}`;
                                item.preselect = attrDef.required;
                                completionPromises.push(Promise.resolve(item));
                             }
                         }
                    });
                    const completions = (await Promise.all(completionPromises)).filter((item): item is vscode.CompletionItem => item !== undefined);
                    return completions.length > 0 ? completions : undefined;
                }

                case 'NestedAttributeKey': {
                    // Suggest nested attributes for the parent
                    const { parentAttributeName, parentAttributeDefinition, parsedHeader } = headerContext;
                    console.log(`Provider Context: NestedAttributeKey - Suggesting attributes for '${parentAttributeName}'`);

                    // Get attributes defined within the parent definition
                    const nestedAttributeDefs = parentAttributeDefinition?.attributes;
                    if (!nestedAttributeDefs) {return undefined;} // No nested attributes defined

                    // Find which nested attributes already exist under the parent in the parsed header
                    const parentObject = parsedHeader?.[parentAttributeName];
                    const existingNestedNames = new Set(Object.keys(parentObject instanceof Object ? parentObject : {}));
                     console.log("Existing nested keys:", existingNestedNames);

                    const nestedCompletions: vscode.CompletionItem[] = [];
                    nestedAttributeDefs.forEach(nestedAttrDef => {
                        if (!existingNestedNames.has(nestedAttrDef.name)) {
                            // Generate completion for the nested attribute
                             // For now, use default 'key: $0', custom logic could be added here too
                             const item = new vscode.CompletionItem(nestedAttrDef.name, vscode.CompletionItemKind.Property);
                             item.insertText = new vscode.SnippetString(`${nestedAttrDef.name}: $0`);
                             item.documentation = new vscode.MarkdownString(nestedAttrDef.description || `The ${nestedAttrDef.name} property.`);
                             item.detail = nestedAttrDef.required ? '(Required nested)' : '(Optional nested)';
                             // Adjust sorting if needed
                             item.sortText = `N_${parentAttributeName}_${nestedAttrDef.required ? 'A' : 'B'}_${nestedAttrDef.name}`;
                             item.preselect = nestedAttrDef.required;
                             nestedCompletions.push(item);
                        }
                    });
                    return nestedCompletions.length > 0 ? nestedCompletions : undefined;
                }

                // Other contexts where this provider might not suggest keys
                case 'AttributeValue':
                case 'ListItemValue':
                     console.log(`Provider Context: ${headerContext.contextType} - Not suggesting keys here.`);
                     return undefined; // Value provider handles these

                case 'NotInHeader':
                default:
                    return undefined;
            }
        }
    },
    '\n', // Trigger on new line
    ':'  // Trigger on space
);