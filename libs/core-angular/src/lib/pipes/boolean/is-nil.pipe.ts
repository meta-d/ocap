import { Pipe, PipeTransform } from '@angular/core'
import { isNil } from '../utils/utils'

@Pipe({
  standalone: true,
  name: 'isNil'
})
export class IsNilPipe implements PipeTransform {
  transform(value: any): boolean {
    return isNil(value)
  }
}
