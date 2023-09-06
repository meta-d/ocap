import { ComponentType } from '@angular/cdk/portal'
import { InjectionToken, Type } from '@angular/core'
import { Observable, Subject } from 'rxjs'

export interface DesignerComponentType<T> {
  componentType: string
  component?: ComponentType<unknown>
  icon?: string
  label: string
  schema?: ComponentType<DesignerSchema>
  model: T | Observable<T>
  submit?: Subject<T>
}

export interface SettingsComponent {
  id?: string
  container: ComponentType<unknown>
  model: any
  componentType: string | number
  schema?: ComponentType<DesignerSchema>
  submit: Subject<any>
  transition?: boolean
}

export const STORY_DESIGNER_FORM = new InjectionToken<SettingsComponent>('SETTINGS_COMPONENT')

export const STORY_DESIGNER_LIVE_MODE = new InjectionToken<boolean>('Designer Live Mode')
export const STORY_DESIGNER_SCHEMA = new InjectionToken<DesignerSchema<unknown>>('Component Designer Schema')

export interface DesignerSchema<T = any> {
  model: T

  getTitle(): Observable<string>

  /**
   * 返回 schema 的可观察对象
   * 因为 schema 可能会随着 model 的数据而变化
   */
  getSchema(): Observable<any>
}

export interface DesignerComponentProvider {
  type: string
  icon?: string
  component: ComponentType<any>
  schema?: ComponentType<DesignerSchema>
  factory?: () => Promise<Type<DesignerSchema<unknown>>>
}

export const STORY_DESIGNER_COMPONENT = new InjectionToken<Array<DesignerComponentProvider>>(
  'Story Designer Component Provider'
)
