import * as vscode from 'vscode';

import { onInternalEvent } from "./events/internalEventEmitter";
import { triggerDiagnosticUpdate } from './diagnostics/diagnosticHandlerWrapper';
import { triggerEditorDecorationUpdate } from './decorations/editorDecorations/editorDecorationTrigger';
import { updateHeaderDiagnostics } from './diagnostics/header/headerDiagnosticsHandler';
import { updateTagDiagnostics } from './diagnostics/tags/tagDiagnosticsHandler';
import { DocumentChangedPayloadInternal } from './events/types';
import { MARKDOWN } from '../constants';
import { triggerTagDecorationUpdate } from './decorations/tagDecorations/tagDecorationTrigger';
import { decorationManager } from './decorations/decorationTypeManager';

export async function subscribeEvents(context: vscode.ExtensionContext) {
  console.log("Setting up internal event subscriptions...");

  const subscription = onInternalEvent(event => {
    if (!event) { return; }

    // Handle specific events using the eventName for type guarding
    switch (event.eventName) {
      case 'activationComplete': {
        console.log("[Event Sub] Handling 'activationComplete' for initial scan.");
        vscode.window.visibleTextEditors.forEach(editor => {
          if (editor && editor.document.languageId === MARKDOWN) {
            console.log(`   Triggering initial scan for: ${editor.document.uri.toString()}`);
            triggerDiagnosticUpdate(editor, updateHeaderDiagnostics, 'headerAll');
            triggerDiagnosticUpdate(editor, updateTagDiagnostics, 'tagAll');
            triggerTagDecorationUpdate(editor);
            triggerEditorDecorationUpdate(editor); 
          }
        });
        break;
      }

      case 'editorChanged': {
        const editor = event.payload as vscode.TextEditor; // Type: vscode.TextEditor | undefined
        if (editor && editor.document.languageId === MARKDOWN) {
          console.log(`[Event Sub] Triggering diagnostics and highlights for ${event.eventName}`);
          triggerDiagnosticUpdate(editor, updateHeaderDiagnostics, 'headerAll');
          triggerDiagnosticUpdate(editor, updateTagDiagnostics, 'tagAll');
          triggerTagDecorationUpdate(editor);
          triggerEditorDecorationUpdate(editor); 
        }
        break;
      }

      case 'documentChanged': {
        // Payload Type: { document: vscode.TextDocument; editor?: vscode.TextEditor | undefined; }
        const { document, editor } = event.payload as DocumentChangedPayloadInternal;
        if (document.languageId === MARKDOWN) {
          console.log(`[Event Sub] Triggering diagnostics and highlights for ${event.eventName}`);
          // Pass editor (which might be undefined) to triggers; they should handle it.
          triggerDiagnosticUpdate(editor, updateHeaderDiagnostics, 'headerAll');
          triggerDiagnosticUpdate(editor, updateTagDiagnostics, 'tagAll');
          // Highlights need an editor
          if (editor) {
            triggerTagDecorationUpdate(editor);
            triggerEditorDecorationUpdate(editor); 
          }
        }
        break;
      }

      case 'selectionChanged': {
        // Payload Type: vscode.TextEditorSelectionChangeEvent
        // Explicitly access .textEditor property from the payload
        const eventData = event.payload as vscode.TextEditorSelectionChangeEvent; // Type: vscode.TextEditor
        if (eventData.textEditor.document.languageId === MARKDOWN) {
          console.log(`[Event Sub] Triggering highlights (only) for ${event.eventName}`);
          triggerTagDecorationUpdate(eventData.textEditor);
          triggerEditorDecorationUpdate(eventData.textEditor); 
        }
        break;
      }

      case 'configChanged': {
        // Payload Type: vscode.ConfigurationChangeEvent
        console.log(`[Event Sub] Processing ${event.eventName}`);
        const payload = event.payload as vscode.ConfigurationChangeEvent;
        const stylesNeedUpdate = decorationManager.handleConfigurationChange(payload);

        // Iterate visible editors if needed, no direct editor in payload
        vscode.window.visibleTextEditors.forEach(visEditor => {
          if (visEditor.document.languageId === MARKDOWN) {
            if (stylesNeedUpdate) {
              // Use the trigger for tag decorations (which calls updateTagDecorations)
              triggerTagDecorationUpdate(visEditor);
            }
            triggerEditorDecorationUpdate(visEditor);
          }
        });
        break;
      }

      default:
        break;
    }
  });

  // Add the subscription to the extension context so it's disposed automatically
  context.subscriptions.push(subscription);
  console.log("Internal event subscriptions set up.");
}
