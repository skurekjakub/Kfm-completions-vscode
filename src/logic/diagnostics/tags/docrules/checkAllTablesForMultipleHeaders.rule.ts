import * as vscode from 'vscode';
import { TagNames } from '../../../../constants';
import { TagInstanceInfo, TagDocumentValidationRuleFn } from '../types'; // Adjust path
import { createTagDiagnostic, findTagAttributeValueRange } from '../helpers'; // Adjust path

/**
 * DOCUMENT-LEVEL RULE
 * Analyzes a list of all tags found in a document to find tables
 * with more than one row marked as header="true".
 */
export const checkAllTablesForMultipleHeaders: TagDocumentValidationRuleFn = (
    document,
    allTagsInfo // Receive the full list of tags
    // finalTagStack is not needed for this specific rule
) => {
    const diagnostics: vscode.Diagnostic[] = [];
    const tableRanges: vscode.Range[] = [];

    // First, find the ranges of all table blocks by pairing tags from the list
    const tableStack: TagInstanceInfo[] = [];
    for (const tagInfo of allTagsInfo) {
        if (tagInfo.tagName === TagNames.TABLE) {
            if (tagInfo.isOpeningTag) {
                tableStack.push(tagInfo);
            } else if (tagInfo.isClosingTag && tableStack.length > 0 && tableStack[tableStack.length - 1].tagName === TagNames.TABLE) {
                const openingTable = tableStack.pop();
                if (openingTable) {
                    tableRanges.push(new vscode.Range(openingTable.tagRange.start, tagInfo.tagRange.end));
                }
            }
        }
    }
    // Unclosed tables will be caught by the unclosed tag rule

    // Process each identified table range
    for (const tableRange of tableRanges) {
        let firstHeaderRow: TagInstanceInfo | null = null;

        // Find all 'row' tags strictly within this table's range
        for (const tagInfo of allTagsInfo) {
            if (
                tagInfo.tagName === TagNames.ROW &&
                tagInfo.isOpeningTag &&
                tableRange.contains(tagInfo.tagRange) &&
                !tagInfo.tagRange.isEqual(tableRange) // Check start/end points if contains is inclusive
            ) {
                const isHeaderRow = tagInfo.attributes['header']?.toLowerCase() === 'true';
                if (isHeaderRow) {
                    if (firstHeaderRow === null) {
                        firstHeaderRow = tagInfo; // Store the first one
                    } else {
                        // Subsequent header row found!
                        const headerAttrRange = findTagAttributeValueRange(document, tagInfo.tagRange, 'header') || tagInfo.tagRange;
                        const message = `Multiple rows with 'header="true"' found within the same '{% table %}'. Use 'secondaryHeader="true" for the second and any subsequent header in tables.'`;
                        const diag = createTagDiagnostic(
                            headerAttrRange,
                            message,
                            vscode.DiagnosticSeverity.Warning,
                            `TAG-MULTI-HEADERROW-${TagNames.TABLE}`
                        );
                        diag.relatedInformation = [
                            new vscode.DiagnosticRelatedInformation(
                                new vscode.Location(document.uri, firstHeaderRow.tagRange),
                                'The first header row was defined here.'
                            )
                        ];
                        diagnostics.push(diag);
                    }
                }
            }
        }
    }
    return diagnostics;
};