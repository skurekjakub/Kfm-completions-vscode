import * as vscode from 'vscode';

// Define the types of events and their expected payload (context)
export type InternalEventPayload = {
    'editorChanged': vscode.TextEditor | undefined; // Fired when active editor changes, becomes visible, etc.
    'documentChanged': DocumentChangedPayloadInternal; // Fired when document text changes
    'selectionChanged': vscode.TextEditorSelectionChangeEvent; // Fired on selection change
    'configChanged': vscode.ConfigurationChangeEvent; // Fired on config change
    'activationComplete': undefined;
    // Add more events as needed
};

export type DocumentChangedPayloadInternal = {
  document: vscode.TextDocument;
  editor?: vscode.TextEditor;
};

// Helper type for event names
export type InternalEventName = keyof InternalEventPayload;

// Create and export a single emitter instance using VS Code's EventEmitter
// We type it based on our payload map for type safety when firing/listening.
// NOTE: VS Code's EventEmitter expects a single argument type for listeners.
// We'll pass an object containing the event name and payload.
export interface EmitterEvent<T extends InternalEventName> {
    eventName: T;
    payload: InternalEventPayload[T];
}
