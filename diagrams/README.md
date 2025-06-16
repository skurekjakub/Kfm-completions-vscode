# Kentico Docs VSCode Extension Lifecycle

This document explains the component lifecycle and architecture of the Kentico docs autocomplete VS Code extension. The diagrams below were generated using Mermaid.js.

## Extension Lifecycle Flow

The following diagram illustrates the initialization and shutdown flow of the extension components:

```mermaid
flowchart TD
    %% Main extension lifecycle components
    activate[Extension activation]
    deactivate[Extension deactivation]
    
    %% Core initialization
    initPlugin[initPlugin]
    disposeAll[disposeAll]
    
    %% Main system components
    initCompletions[initCompletions]
    initDiagnostics[initDiagnostics]
    initEventHandling[initEventHandling]
    loadFiles[Load Workspace Files]
    decorationInit[decorationManager.initialize]
    subscribeEvents[subscribeEvents]
    fireActivationComplete[Fire 'activationComplete' event]
    
    %% File loading components
    loadXpMdFiles[loadXpMdFiles]
    loadXpIcons[loadXpIcons]
    
    %% Event system
    registerListeners[registerEventListeners]
    vs_listeners[VS Code Event Listeners]
    internalEvents[Internal Event System]
    
    %% Completions system
    regTagDefinitions[registerAllTagDefinitions]
    completionProviders[Register Completion Providers]
    
    %% Diagnostics system
    diagnosticCollections[Register Diagnostic Collections]
    
    %% Event handler execution - happens when events fire
    eventListeners[Event Listeners]
    diagnosticUpdates[Trigger Diagnostic Updates]
    tagDecorationUpdates[Trigger Tag Decoration Updates]
    editorDecorationUpdates[Trigger Editor Decoration Updates]
    
    %% Activation flow
    activate --> initPlugin
    initPlugin --> initCompletions
    initPlugin --> initDiagnostics
    initPlugin --> initEventHandling
    initPlugin --> loadFiles
    initPlugin --> decorationInit
    initPlugin --> subscribeEvents
    initPlugin --> fireActivationComplete
    
    %% File loading
    loadFiles --> loadXpMdFiles
    loadFiles --> loadXpIcons
    
    %% Event system initialization
    initEventHandling --> registerListeners
    registerListeners --> vs_listeners
    
    %% Completion system initialization
    initCompletions --> regTagDefinitions
    initCompletions --> completionProviders
    
    %% Diagnostics initialization
    initDiagnostics --> diagnosticCollections
    
    %% Event subscription and handling
    subscribeEvents --> internalEvents
    
    %% Event processing flow
    vs_listeners -.->|fires| internalEvents
    internalEvents -.->|handles| eventListeners
    eventListeners -.->|triggers| diagnosticUpdates
    eventListeners -.->|triggers| tagDecorationUpdates
    eventListeners -.->|triggers| editorDecorationUpdates
    
    %% Activation event - special case
    fireActivationComplete -.->|triggers initial scan| eventListeners
    
    %% Deactivation flow
    deactivate --> disposeAll
    disposeAll --> clearDiagnosticTimers[Clear Diagnostic Timers]
    disposeAll --> clearTagDecorationTimers[Clear Tag Decoration Timers]
    disposeAll --> clearEditorDecorationTimers[Clear Editor Decoration Timers]
    disposeAll --> decorationManagerDispose[Dispose Decoration Manager]
    disposeAll --> disposeEmitter[Dispose Event Emitter]
    
    %% Styling
    classDef mainFlow fill:#f9f,stroke:#333,stroke-width:2px
    classDef eventSystem fill:#bbf,stroke:#33b,stroke-width:1px
    classDef fileSystem fill:#bfb,stroke:#3b3,stroke-width:1px
    classDef decorations fill:#fbb,stroke:#b33,stroke-width:1px
    classDef completions fill:#ffb,stroke:#bb3,stroke-width:1px
    classDef diagnostics fill:#bff,stroke:#3bb,stroke-width:1px
    
    class activate,deactivate,initPlugin,disposeAll mainFlow
    class initEventHandling,registerListeners,vs_listeners,internalEvents,subscribeEvents,eventListeners,fireActivationComplete eventSystem
    class loadFiles,loadXpMdFiles,loadXpIcons fileSystem
    class decorationInit,tagDecorationUpdates,editorDecorationUpdates,decorationManagerDispose,clearTagDecorationTimers,clearEditorDecorationTimers decorations
    class initCompletions,regTagDefinitions,completionProviders completions
    class initDiagnostics,diagnosticCollections,diagnosticUpdates,clearDiagnosticTimers diagnostics
```

## Sequence Diagram

This diagram shows the initialization sequence and event flow between components:

```mermaid
sequenceDiagram
    participant VSCode
    participant Extension
    participant LifecycleSystem
    participant EventSystem
    participant CompletionSystem
    participant DiagnosticsSystem
    participant DecorationSystem
    participant FileSystem
    
    %% Extension activation
    VSCode->>Extension: activate(context)
    activate Extension
    Extension->>LifecycleSystem: initPlugin(context)
    activate LifecycleSystem
    
    %% Init completions
    LifecycleSystem->>CompletionSystem: initCompletions(context)
    activate CompletionSystem
    CompletionSystem->>CompletionSystem: registerAllTagDefinitions()
    CompletionSystem->>VSCode: Register completion providers
    CompletionSystem-->>LifecycleSystem: Completions initialized
    deactivate CompletionSystem
    
    %% Init diagnostics
    LifecycleSystem->>DiagnosticsSystem: initDiagnostics(context)
    activate DiagnosticsSystem
    DiagnosticsSystem->>VSCode: Register diagnostic collections
    DiagnosticsSystem-->>LifecycleSystem: Diagnostics initialized
    deactivate DiagnosticsSystem
    
    %% Init events
    LifecycleSystem->>EventSystem: initEventHandling(context)
    activate EventSystem
    EventSystem->>EventSystem: registerEventListeners(context)
    EventSystem->>VSCode: Register VS Code event handlers
    EventSystem-->>LifecycleSystem: Event handling initialized
    deactivate EventSystem
    
    %% Load workspace files
    LifecycleSystem->>FileSystem: loadXpMdFiles()
    activate FileSystem
    FileSystem->>VSCode: Find files (config)
    VSCode-->>FileSystem: Config files
    FileSystem->>VSCode: Find files (markdown)
    VSCode-->>FileSystem: Markdown files
    FileSystem->>FileSystem: Parse and store headers
    FileSystem-->>LifecycleSystem: MD files loaded
    deactivate FileSystem
    
    LifecycleSystem->>FileSystem: loadXpIcons()
    activate FileSystem
    FileSystem->>VSCode: Find files (icons)
    VSCode-->>FileSystem: Icon files
    FileSystem->>FileSystem: Create completion items
    FileSystem-->>LifecycleSystem: Icons loaded
    deactivate FileSystem
    
    %% Init decorations
    LifecycleSystem->>DecorationSystem: decorationManager.initialize()
    activate DecorationSystem
    DecorationSystem->>DecorationSystem: Create decoration types
    DecorationSystem-->>LifecycleSystem: Decorations initialized
    deactivate DecorationSystem
    
    %% Subscribe to events
    LifecycleSystem->>EventSystem: subscribeEvents(context)
    activate EventSystem
    EventSystem->>EventSystem: Set up internal event handler
    EventSystem-->>LifecycleSystem: Events subscribed
    deactivate EventSystem
    
    %% Fire activation complete
    LifecycleSystem->>EventSystem: fireEvent('activationComplete')
    activate EventSystem
    EventSystem->>EventSystem: Handle activationComplete
    EventSystem->>DiagnosticsSystem: Trigger initial diagnostics
    EventSystem->>DecorationSystem: Trigger initial decorations
    EventSystem-->>LifecycleSystem: Initial scan complete
    deactivate EventSystem
    
    LifecycleSystem-->>Extension: Plugin initialized
    deactivate LifecycleSystem
    
    Extension->>VSCode: Show information message
    Extension-->>VSCode: Extension activated
    deactivate Extension
    
    %% Normal operation (event-driven)
    VSCode->>EventSystem: Document/Editor events
    activate EventSystem
    EventSystem->>EventSystem: Fire internal event
    EventSystem->>DiagnosticsSystem: Trigger diagnostics
    EventSystem->>DecorationSystem: Trigger decorations
    EventSystem-->>VSCode: Event handled
    deactivate EventSystem
    
    %% Extension deactivation
    VSCode->>Extension: deactivate()
    activate Extension
    Extension->>LifecycleSystem: disposeAll()
    activate LifecycleSystem
    
    LifecycleSystem->>DiagnosticsSystem: Clear diagnostic timers
    LifecycleSystem->>DecorationSystem: Clear decoration timers
    LifecycleSystem->>DecorationSystem: Dispose decoration manager
    LifecycleSystem->>EventSystem: Dispose event emitter
    
    LifecycleSystem-->>Extension: Resources disposed
    deactivate LifecycleSystem
    
    Extension-->>VSCode: Extension deactivated
    deactivate Extension
```

## Component Class Diagram

This diagram shows the main components and their relationships:

```mermaid
classDiagram
    class Extension {
        +activate(context)
        +deactivate()
    }
    
    class LifecycleSystem {
        +initPlugin(context)
        +disposeAll()
    }
    
    class EventSystem {
        +initEventHandling(context)
        +registerEventListeners(context)
        +subscribeEvents(context)
        +fireEvent(name, payload)
        +onInternalEvent()
        +disposeEmitter()
    }
    
    class CompletionSystem {
        +initCompletions(context)
        +registerAllTagDefinitions()
        -snippetCompletionProvider
        -attributeValueCompletionProvider
        -missingAttributeProvider
        -headerMissingAttributeProvider
        -headerAttributeValueProvider
        -YamlCompletionProvider
    }
    
    class DiagnosticsSystem {
        +initDiagnostics(context)
        +triggerDiagnosticUpdate(editor, handler, type)
        +updateHeaderDiagnostics(editor)
        +updateTagDiagnostics(editor)
        +clearDiagnosticTimer(uri)
        +clearAllDiagnosticTimers()
    }
    
    class DecorationSystem {
        +initialize()
        +getTypeByName(name)
        +getAllManagedTypeNames()
        +getTagDecorationTypeNames()
        +handleConfigurationChange(event)
        +dispose()
        +updateTagDecorations(editor)
        +updateEditorDecorations(editor)
        +triggerTagDecorationUpdate(editor)
        +triggerEditorDecorationUpdate(editor)
        +clearAllTagDecorationTimers()
        +clearAllEditorDecorationTimers()
    }
    
    class FileSystem {
        +loadXpMdFiles()
        +loadXpIcons()
        +loadLicenseTiers()
        +loadChangelogCategories()
        +getCollection(descriptor)
        +getCardMediaCompletions()
        +getCardTagIconCompletions()
        +loadFileByIdentifier(pageId)
        -loadFile(file)
        -getFileDescriptors(globPattern)
    }
    
    class TagDefinitions {
        +registerTagDefinition(definition)
        +getTagDefinition(tagName)
        +getAllTagDefinitions()
    }
    
    %% Main extension lifecycle dependencies
    Extension --> LifecycleSystem
    
    %% Lifecycle system dependencies
    LifecycleSystem --> CompletionSystem
    LifecycleSystem --> DiagnosticsSystem
    LifecycleSystem --> EventSystem
    LifecycleSystem --> FileSystem
    LifecycleSystem --> DecorationSystem
    
    %% CompletionSystem dependencies
    CompletionSystem --> TagDefinitions
    
    %% EventSystem effects
    EventSystem --> DiagnosticsSystem: triggers
    EventSystem --> DecorationSystem: triggers
    
    %% DecorationSystem dependencies
    DecorationSystem --> TagDefinitions
    
    %% FileSystem provides data to other systems
    FileSystem --> CompletionSystem: provides data
    FileSystem --> DiagnosticsSystem: provides paths
```

## Component Descriptions

### Extension Core
- **Extension**: The main entry point with `activate` and `deactivate` functions
- **LifecycleSystem**: Manages initialization and dispose sequences

### Key Subsystems
- **EventSystem**: Bridges VS Code events to internal components using a custom event emitter
- **CompletionSystem**: Provides IntelliSense for tags, attributes, and YAML frontmatter
- **DiagnosticsSystem**: Validates markdown content and shows errors/warnings
- **DecorationSystem**: Manages text decorations for markdown elements
- **FileSystem**: Loads and parses workspace files and icons

### Event Flow
1. VS Code events are captured by registered listeners
2. Internal events are fired via the EventSystem
3. Event handlers trigger diagnostics and decorations updates as needed

### Key Features
- Debounced updates for good performance
- Event-driven architecture
- Comprehensive initialization and cleanup
