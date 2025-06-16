import * as vscode from 'vscode';
import { EmitterEvent, InternalEventName, InternalEventPayload } from './types';

// Emitter for specific events (more type-safe) - requires separate emitters
// Or a single emitter handling a generic structure:
const internalEmitter = new vscode.EventEmitter<EmitterEvent<InternalEventName>>();

// Export functions to fire events (ensures correct payload type)
export function fireEvent<T extends InternalEventName>(eventName: T, payload: InternalEventPayload[T]): void {
    console.log(`[InternalEmitter] Firing event: ${eventName}`); // Debug log
    internalEmitter.fire({ eventName, payload });
}

// Export a way to subscribe (provides the event object for listening)
// Listener callbacks will receive { eventName: T, payload: InternalEventPayload[T] }
export const onInternalEvent = internalEmitter.event;


// Export a function to dispose the emitter during deactivation
export function disposeEmitter(): void {
    internalEmitter.dispose();
    console.log("[InternalEmitter] Disposed.");
}
