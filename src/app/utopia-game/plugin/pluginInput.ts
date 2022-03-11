export class GridDescriptor {
    rows: string[][];
    templateRows?: string;
    templateColumns?: string;
}

export class PluginInputFormDescriptor {
    inputs: PluginInput[];
    gridDescriptor?: GridDescriptor;
}

export class PluginInput {
    name: string;
    label?: string;
    hint: string;
    required: boolean;
    isList: boolean = false;
    type: 'text' | 'number' | 'selection' | 'position' | 'land' | 'blockType' | 'file';
    options?: { key: string, value: any }[];
    defaultValue?: any;
}
