// logic/completions/providers/yaml/YamlCompletionProvider.ts
import * as vscode from 'vscode';
// Import definitions and types
import { moduleRootDefinition } from '../../../../definitions/yaml/rootModuleDefinition';
import { pageObjectDefinition } from '../../../../definitions/yaml/page/pageDefinition';
// Import refactored functions
import { analyzeContextRegex } from './yamlRegexContextAnalyzer';
import { getKeyCompletionsRegex } from './yamlKeyCompletions';

/**
 * Provides completion items for module definition YAML files based on regex and line analysis.
 */
export class YamlCompletionProvider implements vscode.CompletionItemProvider {

    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ): Promise<vscode.CompletionItem[] | undefined> {

        if (document.languageId !== 'yaml') {return undefined;}
        console.log(`[YamlCompletionProvider] Triggered at ${position.line}:${position.character}`);

        // 1. Analyze Context
        const analysisResult = analyzeContextRegex(document, position); // Use imported function

        if (!analysisResult) {
            console.log("[YamlCompletionProvider] Context analysis failed or context unsuitable.");
             // Provide root completions only if document is essentially empty
             if (document.lineCount <= 1 && document.getText().trim() === '') {
                 return getKeyCompletionsRegex(moduleRootDefinition, 0, document, 0); // Use imported function
             }
            return undefined;
        }

        const {
            path, parentDefinition, isKeyContext, isValueContext, currentKey,
            currentIndentation, isExpectingPageKeyOnly, isUnderPageListItem
        } = analysisResult;

        console.log(`[YamlCompletionProvider] Context: Path=[${path.join('/')}], ParentDef=${parentDefinition?.id || 'unknown'}, KeyCtx=${isKeyContext}, ValCtx=${isValueContext}, CurKey=${currentKey}, Indent=${currentIndentation}, ExpectingPage=${!!isExpectingPageKeyOnly}, UnderPage=${!!isUnderPageListItem}`);

        const completions: vscode.CompletionItem[] = [];

        // 2. Handle Special Case: Only suggest 'page:' after '- '
        if (isExpectingPageKeyOnly) {
             console.log("[YamlCompletionProvider] Expecting 'page:' key after list item indicator.");
             const item = new vscode.CompletionItem("page", vscode.CompletionItemKind.Property);
             // Snippet to add colon, newline, indent, and place cursor
             item.insertText = new vscode.SnippetString("- page:\n" + ' '.repeat(currentIndentation + 2) + "${1:}");
             item.detail = "Define sequence page properties";
             item.sortText = "AAA_page";
             item.documentation = new vscode.MarkdownString("Start defining a page within the sequence.");
             completions.push(item);
             return completions; // Return *only* this completion
        }

        // Proceed only if we have a definition for the current context (or special handling)
        // Allow proceeding if under page list item (parentDefinition will be pageObjectDefinition)
        if (!parentDefinition && !isUnderPageListItem) {
             console.log("[YamlCompletionProvider] Could not determine parent definition for completions.");
             return undefined;
        }


        // 3. Handle Key Completions
        if (isKeyContext) {
             // Use pageObjectDefinition if under '- page:', otherwise use definition from path analysis
             const definitionForKeys = isUnderPageListItem ? pageObjectDefinition : parentDefinition;
             if (definitionForKeys) {
                  // Pass current line index to the key completion function
                  completions.push(...getKeyCompletionsRegex(definitionForKeys, currentIndentation, document, position.line)); // Use imported function
             } else {
                  console.log("[YamlCompletionProvider] Cannot provide key completions: definition unavailable for context.");
             }
        }
        // 4. Handle Value Completions
        else if (isValueContext && currentKey) {
             // Determine the correct definition for value context
             const definitionForValue = isUnderPageListItem ? pageObjectDefinition : parentDefinition;
             if (definitionForValue){
                 console.log(`[YamlCompletionProvider] Providing VALUE completions for key: ${currentKey}`);
                 const attrDef = definitionForValue.attributes.find(a => a.name === currentKey);
                 if (attrDef) {
                     if (attrDef.loadSupportedValues) {
                         console.log(`[YamlCompletionProvider] Calling value provider for ${currentKey}...`);
                         try {
                             // Pass simplified context
                             // Note: Existing value providers might need adaptation for regex context
                             const dynamicCompletions = await attrDef.loadSupportedValues(document, position, path, null);
                             if (dynamicCompletions) { completions.push(...dynamicCompletions); }
                         } catch (e) {
                              console.error(`Error executing value provider for ${currentKey}:`, e);
                         }
                     } else if (attrDef.values && attrDef.values.length > 0) {
                         console.log(`[YamlCompletionProvider] Providing static values for ${currentKey}...`);
                         attrDef.values.forEach(value => {
                             const insertVal = typeof value === 'string' ? `'${value}'` : String(value);
                             const item = new vscode.CompletionItem(String(value), vscode.CompletionItemKind.Value);
                             item.insertText = insertVal;
                             completions.push(item);
                         });
                     } else {
                         console.log(`[YamlCompletionProvider] No specific values for ${currentKey}, consider type snippet.`);
                         // TODO: Add snippets based on attrDef.dataType
                     }
                 } else {
                     console.log(`[YamlCompletionProvider] Attribute definition not found in ${definitionForValue.id || 'current context'} for key: ${currentKey}`);
                 }
             } else {
                 console.log("[YamlCompletionProvider] Cannot provide value completions: definition unavailable for context.");
             }
        }
        // 5. Handle other cases or return results
        else {
            console.log("[YamlCompletionProvider] Context not suitable for known key or value completion.");
        }

        return completions.length > 0 ? completions : undefined;
    }
}