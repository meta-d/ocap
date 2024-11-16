import { Pipe, PipeTransform } from '@angular/core'
import { get } from 'lodash-es'

@Pipe({
  standalone: true,
  name: 'property',
})
export class PropertyPipe implements PipeTransform {
  transform(value: Record<string, unknown>, ...args: [string]): unknown {
    return get(value, args[0])
  }
}
