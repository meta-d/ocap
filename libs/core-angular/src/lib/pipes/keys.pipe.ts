import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  standalone: true,
  name: 'keys',
})
export class KeysPipe implements PipeTransform {
  transform(value: object, args?: any): Array<string> {
    return value ? Object.keys(value) : null
  }
}
