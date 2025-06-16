import * as vscode from 'vscode';
import {
    KFM_SETTINGS_SECTION,
    CODEBLOCK_HIGHLIGHT_SUBSECTION,
    CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_NAME,
    CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_SETTING_DEFAULT,
    ADMONITION_SECTION,
    ADMONITION_HIGHLIGHT_ENABLED,
    ADMONITION_HIGHLIGHT_ENABLED_DEFAULT
} from '../../resources/settingsConsts'; // Adjust path if needed
// Import the type alias for decoration type names
import { DecorationTypeName } from '../../definitions/tags/types'; // Adjust path if needed

/**
 * Manages the creation, storage, and disposal of TextEditorDecorationType objects
 * used throughout the extension. Allows retrieval of decoration types by a predefined name.
 */
class DecorationManager implements vscode.Disposable {
    /** Map to store decoration types, keyed by their DecorationTypeName. */
    private decorationTypeMap = new Map<DecorationTypeName, vscode.TextEditorDecorationType>();
    /** Array to hold disposable resources managed by this instance. */
    private disposables: vscode.Disposable[] = [];

    /**
     * Initializes the decoration manager by creating the initial set of known decoration types.
     * Should be called once during extension activation.
     */
    public initialize(): void {
        console.log("[DecorationManager] Initializing...");
        // Create and store the initial decoration types
        this.createOrUpdateHighlightType(); // Creates 'codeHighlight'
        this.createOrUpdateRelativeLineType(); // Creates 'relativeLineHint' (assuming we add this name)
        this.createOrUpdateWarningBorderType();
        // Add creation calls for other predefined decoration types here if needed
        console.log(`[DecorationManager] Initialized with ${this.decorationTypeMap.size} decoration types.`);
    }

    /**
     * Retrieves a managed TextEditorDecorationType by its predefined name.
     *
     * @param {DecorationTypeName} name - The name of the decoration type to retrieve.
     * @returns {(vscode.TextEditorDecorationType | undefined)} The decoration type object, or undefined if not found.
     */
    public getTypeByName(name: DecorationTypeName): vscode.TextEditorDecorationType | undefined {
        return this.decorationTypeMap.get(name);
    }

    /**
     * Retrieves the names of all decoration types currently managed (i.e., stored) by this manager instance.
     * Useful for iterating through all managed types, e.g., for clearing decorations.
     *
     * @returns {DecorationTypeName[]} An array of the managed decoration type names.
     */
    public getAllManagedTypeNames(): DecorationTypeName[] { // <-- NEW METHOD
        return Array.from(this.decorationTypeMap.keys());
    }

    /**
     * Handles configuration changes relevant to managed decoration types.
     * Recreates decoration types if their defining settings have changed.
     *
     * @param {vscode.ConfigurationChangeEvent} event - The configuration change event.
     * @returns {boolean} True if any decoration types were updated, false otherwise.
     */
    public handleConfigurationChange(event: vscode.ConfigurationChangeEvent): boolean {
        let typesUpdated = false;

        const affectsHighlightColor = event.affectsConfiguration(`${KFM_SETTINGS_SECTION}.${CODEBLOCK_HIGHLIGHT_SUBSECTION}.${CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_NAME}`);
        if (affectsHighlightColor) {
            console.log('[DecorationManager] Highlight color setting changed, recreating type.');
            this.createOrUpdateHighlightType();
            typesUpdated = true;
        }

        const affectsAdmonitions = event.affectsConfiguration(`${KFM_SETTINGS_SECTION}.${ADMONITION_SECTION}`);
        if (affectsAdmonitions) {
            this.createOrUpdateWarningBorderType();
            typesUpdated = true;
        }

        // Add checks for other settings affecting other decoration types here

        return typesUpdated;
    }

    // Todo: managing both editor and tag level decoration types in a single class is problem
    public getTagDecorationTypeNames(): DecorationTypeName[] {
        // For now, we can hardcode it, but ideally, this could be more dynamic
        // if the manager knew which types were registered by tag providers.
        return ['codeHighlight', 'warningBlockBorder'];
    }

    /**
     * Disposes of all managed TextEditorDecorationType objects and clears the storage map.
     */
    public dispose(): void {
        console.log("[DecorationManager] Disposing decoration types...");
        this.decorationTypeMap.forEach(type => {
            type.dispose();
        });
        this.decorationTypeMap.clear();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        console.log("[DecorationManager] Decoration types disposed.");
    }

    // --- Private Helper Methods for Creating/Updating Specific Types ---

    /**
     * Creates or updates the 'warningBlockBorder' decoration type.
     * Applies a border to the left of the decorated range.
     */
    private createOrUpdateWarningBorderType(): void { // <-- NEW METHOD
        const typeName: DecorationTypeName = 'warningBlockBorder';
        this.decorationTypeMap.get(typeName)?.dispose();

        const config = vscode.workspace.getConfiguration(`${KFM_SETTINGS_SECTION}.${ADMONITION_SECTION}`);
        const enabled = config.get<boolean>(ADMONITION_HIGHLIGHT_ENABLED, ADMONITION_HIGHLIGHT_ENABLED_DEFAULT);
        let newType;
        if (enabled) {
            newType = vscode.window.createTextEditorDecorationType({
                // Use a theme color for background or specify RGBA
                // backgroundColor: new vscode.ThemeColor('editorWarning.background'),
                // gutterIconPath: iconPath, // Uncomment and adjust path when icon exists
                // gutterIconSize: 'contain', // Or 'auto'
                backgroundColor: 'rgba(109, 6, 22, 0.13)', // Example: Faint orange tint
                isWholeLine: true, // Apply tint to the whole line width
                overviewRulerColor: new vscode.ThemeColor('editorWarning.foreground'), // Keep ruler marker
                overviewRulerLane: vscode.OverviewRulerLane.Left,
            });
        } else {
            newType = vscode.window.createTextEditorDecorationType({});
        }
        this.decorationTypeMap.set(typeName, newType);
        console.log(`[DecorationManager] Created/Updated type: ${typeName}`);
    }

    /**
     * Creates or updates the 'codeHighlight' decoration type based on current settings
     * and stores it in the decorationTypeMap.
     */
    private createOrUpdateHighlightType(): void {
        const typeName: DecorationTypeName = 'codeHighlight';
        this.decorationTypeMap.get(typeName)?.dispose();

        const config = vscode.workspace.getConfiguration(`${KFM_SETTINGS_SECTION}.${CODEBLOCK_HIGHLIGHT_SUBSECTION}`);
        const color = config.get<string>(CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_NAME, CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_SETTING_DEFAULT);
        const isValidColor = /^rgba?\(|^#|^[a-zA-Z]+$/.test(color);

        const newType = vscode.window.createTextEditorDecorationType({
            backgroundColor: isValidColor ? color : CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_SETTING_DEFAULT,
            isWholeLine: true,
            overviewRulerColor: isValidColor ? color : CODEBLOCK_HIGHLIGHT_BACKGROUND_COLOR_SETTING_DEFAULT,
            overviewRulerLane: vscode.OverviewRulerLane.Center,
        });

        this.decorationTypeMap.set(typeName, newType);
        console.log(`[DecorationManager] Created/Updated type: ${typeName}`);
    }

    /**
     * Creates or updates the 'relativeLineHint' decoration type and stores it in the map.
     */
    private createOrUpdateRelativeLineType(): void {
        const typeName: DecorationTypeName = 'relativeLineHint';
        this.decorationTypeMap.get(typeName)?.dispose();

        const newType = vscode.window.createTextEditorDecorationType({
            after: {
                color: new vscode.ThemeColor('editorLineNumber.foreground'),
                backgroundColor: 'transparent',
                margin: '0 0 0 1em',
                fontWeight: 'normal',
                fontStyle: 'italic',
                textDecoration: 'none; user-select: none; cursor: default;',
            },
            isWholeLine: false,
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        });

        this.decorationTypeMap.set(typeName, newType);
        console.log(`[DecorationManager] Created/Updated type: ${typeName}`);
    }
}

/** Export a singleton instance of the DecorationManager. */
export const decorationManager = new DecorationManager();
