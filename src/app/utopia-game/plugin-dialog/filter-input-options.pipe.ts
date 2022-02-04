import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterInputOptions'
})
export class FilterInputOptionsPipe implements PipeTransform {

    transform(options: { key: string, value: string }[], filter: string): unknown {
        if (filter == null) {
            return options;
        }
        return options.filter(option => option.key.toLowerCase().includes((filter + "").toLowerCase()));
    }

}
