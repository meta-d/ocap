import { Pipe, PipeTransform } from '@angular/core'
import { IUser } from '@metad/contracts'

/*
 * Raise the user's description
 *
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
 */
@Pipe({ name: 'createdBy' })
export class CreatedByPipe implements PipeTransform {
  transform(value: IUser): string {
    if (!value) {
      return ''
    }
    return value.fullName || ((value.firstName || '') + ' ' + (value.lastName || '')).trim() || value.email
  }
}
