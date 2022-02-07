import { Pipe, PipeTransform } from '@angular/core';
import { Plugin } from '../Plugin';

@Pipe({
    name: 'filterPlugins'
})
export class FilterPluginsPipe implements PipeTransform {

    transform(options: Plugin[], filter: string): unknown {
        if (filter == null) {
            return options;
        }
        return options.filter(option => option.name.toLowerCase().includes((filter + '').toLowerCase()));
    }

}
