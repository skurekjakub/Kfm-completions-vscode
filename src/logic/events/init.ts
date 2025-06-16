// In logic/events/index.ts

import * as vscode from 'vscode';
import { registerEventListeners } from "./eventListeners/listenerRegister";

export const initEventHandling = async (context: vscode.ExtensionContext) => {
  await registerEventListeners(context);

  console.log("Event handling initialized. Initial handlers NOT called directly.");
};