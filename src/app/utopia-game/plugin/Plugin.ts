export class Plugin {
    id?: number;
    walletId?: string;
    name?: string;
    description?: string;
    scriptUrl?: string;
    autostart?: boolean;
}

export enum PluginState {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC",
    DEPRECATED = "DEPRECATED"
}
