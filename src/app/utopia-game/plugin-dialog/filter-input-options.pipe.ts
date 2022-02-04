import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterInputOptions'
})
export class FilterInputOptionsPipe implements PipeTransform {

    transform(options: { key: string, value: string }[], filter: string): unknown {
        return options.filter(option => option.value.toLowerCase().includes(filter.toLowerCase()));
    }

}
