// logic/completionRegister.ts
import * as vscode from 'vscode';

import { registerAllTagDefinitions } from '../../definitions/definitionInit';

import { snippetCompletionProvider } from './providers/tags/snippetCompletionProvider';
import { attributeValueCompletionProvider } from './providers/tags/attributeValueCompletionProvider';
import { missingAttributeProvider } from './providers/tags/missingAttributeCompletionProvider';

import { headerMissingAttributeProvider } from './providers/header/headerMissingAttributeProvider';
import { headerAttributeValueProvider } from './providers/header/headerAttributeValueProvider';
import { YamlCompletionProvider } from './providers/yaml/yamlCompletionsProvider';

export const initCompletions = async (context: vscode.ExtensionContext) => {
	console.log("Registering completion providers...");

	// inits the definition registry
	await registerAllTagDefinitions();

	context.subscriptions.push(
		// tag helpers
		snippetCompletionProvider,
		missingAttributeProvider,
		attributeValueCompletionProvider,

		// header helpers
		headerMissingAttributeProvider,
		headerAttributeValueProvider,

		vscode.languages.registerCompletionItemProvider(
			// Language selector for YAML files
			{ language: 'yaml', scheme: 'file' },
			new YamlCompletionProvider(),
			''
			// No specific trigger characters needed here unless desired
	)
	);

	console.log("Completion providers registered.");
};