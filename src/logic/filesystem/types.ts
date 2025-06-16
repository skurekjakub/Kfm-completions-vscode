
/** Interface for the structure of parsed header data stored in pageFileHeaders. */
export interface JsonHeader {
    title: string,
    identifier: string,
    collection: string,
    collectionId: string
    fsPath: string;
    content: string;
    // Add other relevant header fields if needed elsewhere
}

/** Interface for the structure of the primary config YAML file. */
export interface PrimaryConfig {
    collections_dir?: string;
    collections?: {
        [key: string]: { // Key is the collectionId (e.g., 'documentation', 'tutorial')
            title?: string;
            output?: boolean;
            product_version?: string; // The property we need to check
        }
    }
}