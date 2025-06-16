// logic/completions/providers/attributeValueCompletionProvider.ts
import * as vscode from 'vscode';
import { MARKDOWN, TagNames } from '../../../../constants';
import { TagUtils } from '../../../_helpers/tagUtils';
import { getTagDefinition } from '../../../../definitions/definitionRegister';

export const attributeValueCompletionProvider = vscode.languages.registerCompletionItemProvider(
  MARKDOWN,
  {
    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
      // 1. Find enclosing tag context (same as before)
      let currentTagContext: { tagContent: string; tagRange: vscode.Range; startTagPos: vscode.Position; tagName: TagNames } | undefined;
      // ...(loop through TagNames to find tagContext)... // Same loop as previous version
      for (const tagName of Object.values(TagNames)) {
        const tagContext = TagUtils.findEnclosingTagRange(document, position, tagName);
        if (tagContext) {
            currentTagContext = { ...tagContext, tagName };
            break;
        }
      }
      if (!currentTagContext) {return undefined;}

      const { tagName } = currentTagContext;
      const tagDefinition = getTagDefinition(tagName);
      if (!tagDefinition) {return undefined;}

      // 2. Find which attribute's value the cursor is inside
      for (const attrDef of tagDefinition.attributes) {
        if (attrDef.isPositional) {continue;} // Skip positional

        let isCursorInside = false;
        // --- Decide which helper to use based on omitValueSnippet ---
        if (attrDef.omitValueSnippet) {
            // Check if inside UNQUOTED value area
            isCursorInside = TagUtils.isCursorInsideUnquotedAttributeValue(document, position, currentTagContext, attrDef.name);
        } else {
            // Check if inside QUOTED value area
            isCursorInside = TagUtils.isCursorInsideQuotedAttributeValue(document, position, currentTagContext, attrDef.name);
        }

        if (isCursorInside) {
          // Cursor is inside this attribute's value! Provide suggestions.
          console.log(`Cursor inside ${tagName}'s '${attrDef.name}' attribute value (omitValueSnippet: ${!!attrDef.omitValueSnippet}). Checking definition...`);

          // 3. Provide completions based on the definition (same logic as before)
          if (attrDef.loadSupportedValues) {
              console.log(` -> Calling loadSupportedValues for ${attrDef.name}`);
              const currentAttributes = TagUtils.parseAttributes(currentTagContext.tagContent);
              return await attrDef.loadSupportedValues(document, position, currentTagContext, attrDef, currentAttributes);
          } else if (attrDef.values && Array.isArray(attrDef.values)) {
                console.log(` -> Providing static values for ${attrDef.name}`);
              return attrDef.values.map(val => {
                  const item = new vscode.CompletionItem(val.toString(), vscode.CompletionItemKind.EnumMember);
                  item.insertText = val.toString();
                  item.detail = `Value for ${attrDef.name}`;
                  item.sortText = `AAA_${val}`;
                  return item;
              });
          } else {
                console.log(` -> No specific values or loader defined for ${attrDef.name}`);
              return undefined;
          }
        }
      }
      return undefined; // Cursor not inside any known attribute value
    }
  },
  '"', // Trigger inside quotes
  '=' // Trigger after equals (for unquoted values like lang=)
  // Add other relevant trigger chars if needed
);