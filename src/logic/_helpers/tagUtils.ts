import * as vscode from 'vscode';
import { TagContext } from '../../definitions/tags/types';
import { TagNames } from '../../constants';
import { getTagDefinition } from '../../definitions/definitionRegister';

export class TagUtils {
    /**
     * Finds the enclosing tag definition around the current cursor position.
     * Searches backwards and forwards within limits to find the tag boundaries.
     * Returns the tag's content and range if the cursor is inside the tag definition.
     *
     * @param document The text document.
     * @param position The cursor position.
     * @param targetTagName The name of the tag to look for (e.g., TagNames.CARD).
     * @returns TagContext object or undefined if not found or cursor is outside.
     */
    public static findEnclosingTagRange(
        document: vscode.TextDocument,
        position: vscode.Position,
        targetTagName: string
    ): TagContext | undefined {

        const searchLineLimit = 30; // How many lines back/forward
        const maxTagLength = 1000; // Max characters for the tag definition

        const currentLine = position.line;
        let startTagPos: vscode.Position | undefined = undefined;
        let endTagPos: vscode.Position | undefined = undefined;

        // 1. Search backwards for {% targetTagName ...
        for (let lineNum = currentLine; lineNum >= Math.max(0, currentLine - searchLineLimit); lineNum--) {
            const lineText = document.lineAt(lineNum).text;
            const tagStartIndex = lineText.lastIndexOf('{%');
            if (tagStartIndex !== -1) {
                const potentialTagName = lineText.substring(tagStartIndex + 2).trim().split(/\s+/)[0];
                // Check if the found tag name matches the target
                if (potentialTagName === targetTagName) {
                    startTagPos = new vscode.Position(lineNum, tagStartIndex);
                    break;
                }
            }
            if (lineNum < currentLine && (lineText.includes('%}') || lineText.includes('{%'))) {
                break; // Stop early if we hit other tags
            }
        }

        if (!startTagPos) {
            return undefined;
        }

        // 2. Search forwards for %}
        const searchEndOffset = document.offsetAt(startTagPos) + maxTagLength;
        const searchEndLine = Math.min(document.lineCount - 1, currentLine + searchLineLimit);
        const searchEndPos = document.positionAt(Math.min(searchEndOffset, document.offsetAt(new vscode.Position(searchEndLine, Infinity))));
        const textRange = new vscode.Range(startTagPos, searchEndPos);
        const text = document.getText(textRange);
        const tagEndIndex = text.indexOf('%}');

        if (tagEndIndex === -1) {
            return undefined;
        }

        const tagContent = text.substring(0, tagEndIndex + 2);
        endTagPos = document.positionAt(document.offsetAt(startTagPos) + tagEndIndex + 2);
        const tagRange = new vscode.Range(startTagPos, endTagPos);

        // 3. Check if cursor is inside the tag definition range
        if (!tagRange.contains(position)) {
            if (position.line === startTagPos.line && position.character < startTagPos.character) { return undefined; };
            if (position.line === endTagPos.line && position.character > endTagPos.character) { return undefined; };
            if (position.line < startTagPos.line || position.line > endTagPos.line) { return undefined; };
            return undefined;
        }

        // Return the context if found and cursor is inside
        return { tagContent, tagRange, startTagPos };
    }

    /**
     * Parses named attributes AND the first positional argument (as 'argv1')
     * from the content of an opening tag definition.
     * Handles quoted ("...", '...') and unquoted values for named attributes.
     * Handles quoted ("...", '...') and unquoted values (including dots, etc.) for the first positional argument.
     * Stores keys in lowercase.
     *
     * @param tagContent The full content of the tag, e.g., '{% image file.png title="Text" %}'
     * @returns A record mapping attribute names (including 'argv1' if found) to their string values.
     */
    public static parseAttributes(tagContent: string): Record<string, string> {
        const attributes: Record<string, string> = {};
        const positionalKey = 'argv1'; // Keep consistent key for positional arg

        // 1. Extract Tag Name (to isolate parameters)
        const tagNameMatch = tagContent.match(/^\{%\s*(\w+)\s*/);
        if (!tagNameMatch) {
            return attributes;
        }
        let remainingContent = tagContent.substring(tagNameMatch[0].length).trimStart();
        if (!remainingContent || remainingContent.startsWith('%}')) {
            return attributes;
        }

        // 2. Attempt to extract the first positional argument ('argv1')
        // Updated Regex: Matches double-quoted, single-quoted, or UNQUOTED sequence allowing more characters.
        // Captures: 1=double-quoted content, 2=single-quoted content, 3=unquoted sequence
        const positionalMatch = remainingContent.match(/^(?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'|([^%\s'"=]+))\s*/);
        //    ^ double quoted   ^ single quoted   ^ unquoted general

        if (positionalMatch) {
            // Check if the matched value looks like the start of a named attribute (key=...)
            const looksLikeNamedAttr = remainingContent.match(/^[\w-]+\s*=/);

            if (!looksLikeNamedAttr) {
                // It's likely our positional argument. Extract the value (group 1, 2, or 3)
                const positionalValue =
                    (positionalMatch[1]?.replace(/\\"/g, '"')
                        ?? positionalMatch[2]?.replace(/\\'/g, "'")
                        // Use group 3 for the unquoted value
                        ?? positionalMatch[3])
                    ?? "";

                attributes[positionalKey] = positionalValue;
                // Update remaining content
                remainingContent = remainingContent.substring(positionalMatch[0].length);
                // console.log(`Parsed ${positionalKey}: "${attributes[positionalKey]}"`);
            }
        }

        // 3. Parse remaining content for named attributes
        const namedAttrRegex = /\b([\w-]+)\s*(?:=\s*(?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'|([\w-]+))|\b)?/gi;
        let match;
        while ((match = namedAttrRegex.exec(remainingContent)) !== null) {
            if (match[0].trim() === '' || match[0].includes('%}')) { continue; }
            const key = match[1];
            if (!key) { continue; }

            const value =
                (match[2]?.replace(/\\"/g, '"')
                    ?? match[3]?.replace(/\\'/g, "'")
                    ?? match[4])
                ?? "";

            attributes[key.toLowerCase()] = value;
        }
        // console.log('Parsed named attributes:', attributes);
        return attributes;
    }

    /**
     * Checks if the current position is inside the definition part of an opening tag
     * (i.e., between the opening '{%' and its corresponding '%}').
     *
     * @param document The text document.
     * @param position The cursor position.
     * @returns True if the cursor is within an opening tag's definition, false otherwise.
     */
    public static isInsideOpeningTagDefinition(
        document: vscode.TextDocument,
        position: vscode.Position
    ): boolean {
        const searchLineLimit = 5; // How far back to look for '{%'
        const maxTagLength = 1000; // Max length for the opening tag itself
        const currentLine = position.line;

        // 1. Search backwards for the START of a potential opening tag '{%'
        let openingBracePos: vscode.Position | undefined = undefined;
        for (let lineNum = currentLine; lineNum >= Math.max(0, currentLine - searchLineLimit); lineNum--) {
            const lineText = document.lineAt(lineNum).text;
            const searchEndChar = (lineNum === currentLine) ? position.character : lineText.length;
            const braceIndex = lineText.lastIndexOf('{%', searchEndChar - 1);

            if (braceIndex !== -1) {
                // Check if it's NOT an end tag immediately after
                const textAfterBrace = lineText.substring(braceIndex + 2).trimStart();
                if (!textAfterBrace.startsWith('end')) {
                    openingBracePos = new vscode.Position(lineNum, braceIndex);
                    break;
                }
            }
            // Stop searching if we hit another tag's boundary on a previous line
            if (lineNum < currentLine && (lineText.includes('%}') || lineText.includes('{%'))) {
                break;
            }
        }

        if (!openingBracePos) {
            return false; // No opening brace found nearby before cursor
        }

        // 2. Search forwards from the opening brace for the corresponding '%}'
        const searchEndOffset = document.offsetAt(openingBracePos) + maxTagLength;
        const searchEndLine = Math.min(document.lineCount - 1, openingBracePos.line + searchLineLimit); // Search forward from opening brace line
        const searchEndPos = document.positionAt(Math.min(searchEndOffset, document.offsetAt(new vscode.Position(searchEndLine, Infinity))));
        const textRange = new vscode.Range(openingBracePos, searchEndPos);
        const text = document.getText(textRange);
        const tagEndIndex = text.indexOf('%}');

        if (tagEndIndex === -1) {
            return false; // No closing brace found within limits for this opening tag
        }

        // 3. Define the precise range of the opening tag definition
        const closingBracePos = document.positionAt(document.offsetAt(openingBracePos) + tagEndIndex + 2);
        const openingTagRange = new vscode.Range(openingBracePos, closingBracePos);

        // 4. Check if the cursor position is contained within that specific range
        return openingTagRange.contains(position);
    }

    /**
    * Finds the immediate parent tag name enclosing the current position.
    * Returns undefined if the position is not inside any known paired tag.
    *
    * @param document The text document.
    * @param position The cursor position.
    * @returns The TagNames enum value of the parent tag, or undefined.
    */
    public static findEnclosingParentTag(
        document: vscode.TextDocument,
        position: vscode.Position
    ): TagNames | undefined {

        const textBeforePosition = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const tagStack: TagNames[] = []; // Stack to keep track of open tag names

        // Regex to find all start {% tag ... %} and end {% endtag %} tags BEFORE the cursor
        const tagRegex = /\{%\s*(end)?(\w+)\s*.*?%\}/gis;
        let match;

        while ((match = tagRegex.exec(textBeforePosition)) !== null) {
            const isEndTag = !!match[1];
            const tagName = match[2] as TagNames; // Assume match[2] is a valid TagName key

            const definition = getTagDefinition(tagName);
            if (!definition?.isPairTag) {
                // If it's not defined as a pair tag, ignore it for stacking purposes
                continue;
            }

            if (isEndTag) {
                // If it's an end tag, pop the stack if the top matches
                if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
                    tagStack.pop();
                }
                // Ignore unexpected end tags for this purpose
            } else {
                // It's a start tag, push it onto the stack
                tagStack.push(tagName);
            }
        }

        // The tag at the top of the stack (if any) is the immediate parent
        return tagStack.length > 0 ? tagStack[tagStack.length - 1] : undefined;
    }

    /**
     * Checks if the cursor position is inside the DOUBLE QUOTES ("...")
     * of a specific NAMED attribute's value within a given tag context.
     *
     * @param document The text document.
     * @param position The cursor position.
     * @param tagContext The context object returned by findEnclosingTagRange.
     * @param attributeName The exact name of the attribute to check (e.g., 'title', 'image').
     * @returns True if the cursor is inside the attribute value quotes, false otherwise.
     */
    public static isCursorInsideQuotedAttributeValue(
        document: vscode.TextDocument,
        position: vscode.Position,
        tagContext: TagContext,
        attributeName: string
    ): boolean {
        // Construct regex specifically for finding this attribute with quoted value
        // Ensure attribute name is treated as a whole word and handle potential whitespace
        const attributeRegex = new RegExp(`\\b${attributeName}\\s*=\\s*"([^"]*)"`, 'is');
        const attrMatch = tagContext.tagContent.match(attributeRegex);

        if (!attrMatch) {
            return false; // Attribute with quotes not found
        }

        // Calculate positions based on the quotes
        const attrMatchIndexInTag = tagContext.tagContent.indexOf(attrMatch[0]);
        const openingQuoteIndexInAttr = attrMatch[0].indexOf('"');
        const closingQuoteIndexInAttr = attrMatch[0].indexOf('"', openingQuoteIndexInAttr + 1);

        if (openingQuoteIndexInAttr === -1 || closingQuoteIndexInAttr === -1) {
            return false; // Malformed attribute found by regex? Safety check.
        }

        const absoluteOpeningQuoteOffset = document.offsetAt(tagContext.startTagPos) + attrMatchIndexInTag + openingQuoteIndexInAttr;
        const absoluteClosingQuoteOffset = document.offsetAt(tagContext.startTagPos) + attrMatchIndexInTag + closingQuoteIndexInAttr;
        const cursorOffset = document.offsetAt(position);

        // Check if cursor is STRICTLY BETWEEN the quotes
        return cursorOffset > absoluteOpeningQuoteOffset && cursorOffset <= absoluteClosingQuoteOffset;
    }

    /**
     * Checks if the cursor position is inside the UNQUOTED value immediately
     * following a specific NAMED attribute (e.g., lang=VALUE).
     *
     * @param document The text document.
     * @param position The cursor position.
     * @param tagContext The context object returned by findEnclosingTagRange.
     * @param attributeName The exact name of the attribute to check (e.g., 'lang').
     * @returns True if the cursor is inside the unquoted attribute value area, false otherwise.
     */
    public static isCursorInsideUnquotedAttributeValue(
        document: vscode.TextDocument,
        position: vscode.Position,
        tagContext: TagContext,
        attributeName: string
    ): boolean {
        // Construct regex to find the attribute name followed by '=' and potential value characters (\w*)
        // Capture Group 1: The part like 'name=' (with optional whitespace)
        // Capture Group 2: The word characters typed so far for the value
        const attributeRegex = new RegExp(`\\b(${attributeName}=)(\\w*)`, 'i');
        const attrMatch = tagContext.tagContent.match(attributeRegex);

        if (!attrMatch) {
            return false; // Attribute pattern (name=...) not found
        }

        // Calculate the absolute range of the potential value part (Group 2)
        const attrMatchIndexInTag = tagContext.tagContent.indexOf(attrMatch[0]);
        const valueStartIndexInTag = attrMatchIndexInTag + attrMatch[1].length; // Start after 'name=' part
        const valueEndIndexInTag = valueStartIndexInTag + attrMatch[2].length; // End after the typed value chars

        const absoluteValueStartOffset = document.offsetAt(tagContext.startTagPos) + valueStartIndexInTag;
        const absoluteValueEndOffset = document.offsetAt(tagContext.startTagPos) + valueEndIndexInTag;
        const cursorOffset = document.offsetAt(position);

        // Check if cursor is within the range where the value should be
        // (From immediately after '=' up to the end of what's typed so far)
        return cursorOffset >= absoluteValueStartOffset && cursorOffset <= absoluteValueEndOffset;
    }

    /**
     * Checks if the current position is likely inside any {% ... %} tag braces.
     * Searches backwards for '{%' and forwards for '%}' on the current line and potentially nearby lines.
     *
     * @param document The text document.
     * @param position The cursor position.
     * @returns True if the cursor is likely within tag braces, false otherwise.
     */
    public static isInsideTagBraces(
        document: vscode.TextDocument,
        position: vscode.Position
    ): boolean {
        const searchLineLimit = 5; // Limit search for performance
        const currentLine = position.line;

        // Search backwards for '{%' from cursor position
        let openingBracePos: vscode.Position | undefined = undefined;
        for (let lineNum = currentLine; lineNum >= Math.max(0, currentLine - searchLineLimit); lineNum--) {
            const lineText = document.lineAt(lineNum).text;
            // Limit search on current line to characters before cursor
            const searchEndChar = (lineNum === currentLine) ? position.character : lineText.length;
            const braceIndex = lineText.lastIndexOf('{%', searchEndChar - 1);

            if (braceIndex !== -1) {
                openingBracePos = new vscode.Position(lineNum, braceIndex);
                break; // Found nearest opening brace
            }
            // If not on current line and no brace found, stop going back further for this simple check
            if (lineNum < currentLine) { break; };
        }

        if (!openingBracePos) {
            return false; // No opening brace found nearby before cursor
        }

        // Search forwards for '%}' from cursor position
        let closingBracePos: vscode.Position | undefined = undefined;
        for (let lineNum = currentLine; lineNum <= Math.min(document.lineCount - 1, currentLine + searchLineLimit); lineNum++) {
            const lineText = document.lineAt(lineNum).text;
            // Limit search on current line to characters at or after cursor
            const searchStartChar = (lineNum === currentLine) ? position.character : 0;
            const braceIndex = lineText.indexOf('%}', searchStartChar);

            if (braceIndex !== -1) {
                closingBracePos = new vscode.Position(lineNum, braceIndex);
                break; // Found nearest closing brace
            }
            // If not on current line and no brace found, stop going forward further for this simple check
            if (lineNum > currentLine) { break; };
        }

        // If we found both an opening brace before the cursor
        // and a closing brace after the cursor, we are inside.
        return openingBracePos !== undefined && closingBracePos !== undefined;
    }
}
