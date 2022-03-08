export class PluginParameter {
    name: string;
    label?: string;
    hint: string;
    required: boolean;
    isList: boolean = false;
    type: 'text' | 'number' | 'selection' | 'position' | 'land' | 'blockType';
    options?: { key: string, value: any }[];
    defaultValue?: any;
}
