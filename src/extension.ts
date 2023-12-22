// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';
import YMAL from 'yaml';
import path from 'node:path';

interface YamlHeader {
	identifier?: string, 
	title: string
  }

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const langs: string[] = ['csharp','css','cshtml','html','js','tsx'];

	const provider1 = vscode.languages.registerCompletionItemProvider(
		'markdown', 
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) 
			{
				const pagelinkCompletion = new vscode.CompletionItem('page_link');
				pagelinkCompletion.insertText = new vscode.SnippetString('{% page_link $1${2: linkText=\"${3:(optional)}\"} %} $0');
				pagelinkCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you link.");
				pagelinkCompletion.preselect = true;
				pagelinkCompletion.sortText = 'AtcmplSnippet';
				
				const inPagelinkCompletion = new vscode.CompletionItem('inpage_link');
				inPagelinkCompletion.insertText = new vscode.SnippetString('{% inpage_link $1${2: linkText=\"${3:(optional)}\"} %} $0');
				inPagelinkCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you link to an anchor on the current page.");
				inPagelinkCompletion.preselect = true;
				inPagelinkCompletion.sortText = 'AtcmplSnippet';

				const codeCompletion = new vscode.CompletionItem('code_tag');
				codeCompletion.insertText = new vscode.SnippetString('{% code lang=${1|csharp,css,cshtml,html,js,tsx|} title=\"$2\"${3: linenumbers=true} %}\r\n$0\r\n{% endcode %}\r\n\r\n');
				codeCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you link to an anchor on the current page.");
				codeCompletion.preselect = true;
				codeCompletion.sortText = 'AtcmplSnippet';

				const imageCompletion = new vscode.CompletionItem('image_tag');
				imageCompletion.insertText = new vscode.SnippetString('{% image $1 title="$2" width="$3"}${4: border=true} %}');
				imageCompletion.documentation = new vscode.MarkdownString("Inserts image tag snippet.");
				imageCompletion.preselect = true;
				imageCompletion.sortText = 'AtcmplSnippet';

				const fileCompletion = new vscode.CompletionItem('file_tag');
				fileCompletion.insertText = new vscode.SnippetString('{% file $1 disposition="${2:download} %}"');
				fileCompletion.documentation = new vscode.MarkdownString("Inserts file tag snippet.");
				fileCompletion.preselect = true;
				fileCompletion.sortText = 'AtcmplSnippet';

				const videoCompletion = new vscode.CompletionItem('video_tag');
				videoCompletion.insertText = new vscode.SnippetString('{% video $1${2: width="$3"}${4: height="$"} %}"');
				videoCompletion.documentation = new vscode.MarkdownString("Inserts file tag snippet.");
				videoCompletion.preselect = true;
				videoCompletion.sortText = 'AtcmplSnippet';

				// return all completion items as array
				return [
					pagelinkCompletion,
					inPagelinkCompletion,
					codeCompletion,
					imageCompletion,
					fileCompletion,
					videoCompletion
				];
			}
		}
	);
	
	const files = (await vscode.workspace.findFiles(`**/src/_documentation/_xp/**`)).sort((a,b) => a.fsPath.length - b.fsPath.length);
		
	var completions: vscode.CompletionItem[] = []
	const reg : RegExp = /\s*^\s*---$(.*?)^---$/ms
	for (const content of files) {
		console.log('processing:' + content.fsPath)
		let header = await loadFile(content)
		const success = header.match(reg)
		header = success?.[0] ? success?.[0] : ''
		header = header.split('\r\n').slice(1,-1).join('\r\n')
		const jsonHeader = YMAL.parse(header ? header : '')
		const completion = new vscode.CompletionItem(`${jsonHeader.title}--${jsonHeader.identifier}`, 
						vscode.CompletionItemKind.Enum);
		completion.insertText = `${jsonHeader.identifier}`;
		completions.push(completion)
	};
	async function loadFile(file: vscode.Uri){
		return await fs.readFile(file.fsPath, 'utf-8')
	} 

	const pageLinkCompletionProvider = vscode.languages.registerCompletionItemProvider(
		{language: 'markdown'},
		{
			async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) 
			{
				const line = document.lineAt(position).text;
				if (!(line.match(/\{\% page_link.*\%\}/i) || line.match(/\s*related_pages:.*/i))) {
					return undefined;
				}
				
				return completions;
			}
		},
		'' // triggered whenever a '.' is being typed 
	);

	const inPageLinkCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'markdown',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				var inpagecompletions: vscode.CompletionItem[] = []
				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text;
				if (!linePrefix.match(/\{\% inpage_link.*\%\}/i)?.[0]) {
					return undefined;
				}
				
				const headings = document.getText().matchAll(/^#+\s+(.*)$/gm)
				for (var heading of headings) {
					let cmpl = new vscode.CompletionItem(`"${heading[1].replaceAll(/\{%.*%\}/g, '')	}"`, vscode.CompletionItemKind.Enum)
					cmpl.preselect = true
					cmpl.sortText = "AtcmplMdTitle"
					inpagecompletions.push(cmpl)
				}

				return inpagecompletions;
			}
		}
	);

	const assetCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'markdown', 
		{
			async provideCompletionItems(document, position, token, context) {
				// context
				const linePrefix = document.lineAt(position).text;
				if (
					!(linePrefix.match(/\{\% image.*\%\}/i)   ||
					  linePrefix.match(/\{\% file.*\%\}/i)    ||
					  linePrefix.match(/\{\% video.*\%\}/i))
				   ) 
				{
					return undefined;
				}

				var assetCompletions: vscode.CompletionItem[] = [];
				console.log(path.basename(document.fileName));
				const assets = await vscode.workspace
				.findFiles(`**/src/docsassets/xp/${path.basename(document.fileName).replace(path.extname(document.fileName), '')}/**`);
				assets.forEach(ass => {
					var cmpl = new vscode.CompletionItem(`${path.basename(ass.fsPath)}`, vscode.CompletionItemKind.Color)
					cmpl.preselect = true;
					cmpl.sortText = 'AtcmplAssets'
					assetCompletions.push(cmpl)
				})
				
				return assetCompletions;
			},
		}
	)

	const codeLangCompletionProvider = vscode.languages.registerCompletionItemProvider(
		'markdown',
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

				langs.forEach(lang => {
					const cmpl = new vscode.CompletionItem(`${lang}`, vscode.CompletionItemKind.Value);
					cmpl.sortText = 'AtcmplCodeLangShrtc';
					cmpl.preselect = true;
					codeLangCompletions.push(cmpl);
				})

				return codeLangCompletions;
			},			
		}
	)	

	context.subscriptions.push(provider1, 
		pageLinkCompletionProvider, 
		inPageLinkCompletionProvider, 
		codeLangCompletionProvider,
		assetCompletionProvider
		);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('kc-mdcompletions.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Kc-MdCompletions!');
	});

	context.subscriptions.push(disposable);

	vscode.window.showInformationMessage('Autocompletions for XP loaded.');
}

// This method is called when your extension is deactivated
export function deactivate() {}
