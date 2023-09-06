import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'entries'
})
export class EntriesPipe implements PipeTransform {

  transform(value: Object, args?: any): [string, any][] {
    return Object.entries(value);
  }

}
