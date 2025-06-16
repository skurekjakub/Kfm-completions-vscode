import { clearAllDiagnosticTimers } from "../diagnostics/diagnosticHandlerWrapper";
// Import the specific timer clearing functions
import { clearAllTagDecorationTimers } from "../decorations/tagDecorations/tagDecorationTrigger";
import { decorationManager } from "../decorations/decorationTypeManager";
import { disposeEmitter } from "../events/internalEventEmitter";
import { clearAllEditorDecorationTimers } from "../decorations/editorDecorations/editorDecorationTrigger";

/**
 * Disposes of resources used by the extension.
 * Clears timers, disposes decoration types, and the event emitter.
 */
export const disposeAll = (): void => {
    console.log("[disposeAll] Disposing extension resources...");

    // Clear all pending debounced updates
    clearAllDiagnosticTimers();
    clearAllTagDecorationTimers();
    clearAllEditorDecorationTimers();

    // Dispose decoration types managed by the manager
    decorationManager.dispose();

    // Dispose the central event emitter
    disposeEmitter();

    console.log("[disposeAll] Extension resources disposed.");
};
