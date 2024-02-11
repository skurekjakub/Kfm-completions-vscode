import * as vscode from 'vscode';
import path from 'node:path';

import { getSnippetCompletions, getIconCompletions, getPageLinkCompletions, getInpageLinkCompletions } from './completionProvider';
import { LANGS, MARKDOWN } from './constants';
import { getCollection } from './workspaceFileLoader';

export const registerCompletions = async (context: vscode.ExtensionContext) => {
    const snippetCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) 
			{
				const lineText = document.lineAt(position).text;
				return getSnippetCompletions();
                
			}
		}
	);

	const pageLinkCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN,
		{
			async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) 
			{
				const line = document.lineAt(position).text;
				if (!(line.match(/\{\% page_link.*\%\}/i) || line.match(/\s*related_pages:.*/i))) {
					return undefined;
				}
				
				return getPageLinkCompletions();
			}
		},
	);

	const inPageLinkCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN,
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				
				const line = document.lineAt(position).text;

				if (!line.match(/\{\% inpage_link.*\%\}/i)) {
					return undefined;
				}
				
				return getInpageLinkCompletions(document.getText())
			}
		}
	);

	const assetCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN, 
		{
			async provideCompletionItems(document, position, token, context) {
				// scope
				const linePrefix = document.lineAt(position).text;
				if (
					!(linePrefix.match(/\{\% image.*\%\}/i)   ||
					  linePrefix.match(/\{\% file.*\%\}/i)    ||
					  linePrefix.match(/\{\% video.*\%\}/i))
				   ) 
				{
					return undefined;
				}

				
				return await getAssetCompletionsForDocument(document);
			},
		}
	)

	const codeLangCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN,
		{
			provideCompletionItems(document, position, token, context) {
				let codeLangCompletions: vscode.CompletionItem[] = []
				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const line = document.lineAt(position).text;
				if (!line.match(/\{\% code lang=.*\%\}/i)) {
					return undefined;
				}

				const lineSuffix = document.lineAt(position).text.slice(position.character)
				if (!lineSuffix.match(/.*\s+title=.*%}/gi)) {
					return undefined;
				}

				LANGS.forEach(lang => {
					const cmpl = new vscode.CompletionItem(`${lang}`, vscode.CompletionItemKind.Value);
					cmpl.sortText = 'AtcmplCodeLangShrtc';
					cmpl.preselect = true;
					codeLangCompletions.push(cmpl);
				})

				return codeLangCompletions;
			},			
		}
	)

	const iconCompletionProvider = vscode.languages.registerCompletionItemProvider(
		MARKDOWN,
		{
			provideCompletionItems(document, position, token, context) {
				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const line = document.lineAt(position).text;
				if (!line.match(/\{\% icon .*\%\}/i)) {
					return undefined;
				}

				const lineSuffix = document.lineAt(position).text.slice(position.character)
				if (!lineSuffix.match(/.*\s+.*%}/gi)) {
					return undefined;
				}

				return getIconCompletions();
			},
		}
	)

	context.subscriptions.push(
		snippetCompletionProvider, 
		pageLinkCompletionProvider, 
		inPageLinkCompletionProvider, 
		codeLangCompletionProvider,
		assetCompletionProvider,
		iconCompletionProvider
		);
}

async function getAssetCompletionsForDocument(document: vscode.TextDocument) {

    var assetCompletions: vscode.CompletionItem[] = [];
    console.log(path.basename(document.fileName));
    const assets = await vscode.workspace
        .findFiles(`**/src/docsassets/${getCollection(document.uri)}/${path.basename(document.fileName).replace(path.extname(document.fileName), '')}/**`);
    assets.forEach(ass => {
        var cmpl = new vscode.CompletionItem(`${path.basename(ass.fsPath)}`, vscode.CompletionItemKind.Color)
        cmpl.preselect = true;
        cmpl.sortText = 'AtcmplAssets'
        assetCompletions.push(cmpl)
    })

    return assetCompletions;
}
