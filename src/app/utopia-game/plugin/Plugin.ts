export class Plugin {
    id?: number;
    walletId?: string;
    name?: string;
    description?: string;
    scriptUrl?: string;
}

export enum PluginState {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC",
    DEPRECATED = "DEPRECATED"
}
