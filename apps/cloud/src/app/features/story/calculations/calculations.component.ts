import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, ViewContainerRef, computed, effect, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { ISelectOption, NgmDSCacheService } from '@metad/ocap-angular/core'
import { NgmParameterCreateComponent } from '@metad/ocap-angular/parameter'
import { CalculationProperty, EntityType, ParameterProperty, Syntax, getEntityCalculations } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { ConfirmDeleteComponent } from '@metad/components/confirm'
import { NxCoreService } from '@metad/core'
import { NxStoryService } from '@metad/story/core'
import { firstValueFrom } from 'rxjs'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    TranslateModule,
    NgmCommonModule
  ],
  selector: 'pac-story-calculations',
  templateUrl: 'calculations.component.html',
  styleUrls: ['calculations.component.scss'],
  host: {
    class: 'pac-story-calculations'
  }
})
export class StoryCalculationsComponent {
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly dsCoreService = inject(NgmDSCacheService)

  entities: ISelectOption<string>[] = []
  readonly activeLink = signal<{ dataSource: string; entity: string }>(null)

  readonly #entitySchema = computed(() => {
    const { dataSource, entity } = this.activeLink() ?? {}
    return this.schemas$()?.[dataSource]?.[entity]
  })

  readonly parameters = computed<ParameterProperty[]>(() => Object.values(this.#entitySchema()?.parameters ?? {}))
  readonly calculations = computed<CalculationProperty[]>(() => getEntityCalculations(this.#entitySchema()))

  readonly dataSettings = computed(() => (this.activeLink() ? {
    dataSource: this.activeLink().dataSource,
    entitySet: this.activeLink().entity
  } : null))
  private schemas$ = toSignal(this.storyService.schemas$, { initialValue: null })

  public entities$ = computed(() => {
    const schemas = this.schemas$()
    if (schemas) {
      const entities = []

      Object.keys(schemas).forEach((dataSource) => {
        Object.keys(schemas[dataSource]).forEach((entity) => {
          entities.push({
            dataSource,
            value: entity,
            label: schemas[dataSource][entity].caption
          })
        })
      })
      return entities
    }

    return null
  })

  constructor(
    private storyService: NxStoryService,
    private coreService: NxCoreService,
    private readonly _dialog: MatDialog,
    private readonly _viewContainerRef: ViewContainerRef
  ) {
    effect(() => {
      const entities = this.entities$()
      if (!this.activeLink() && entities?.length > 0) {
        this.activeEntity(entities[0].dataSource, entities[0].value)
      }
    }, { allowSignalWrites: true })
  }

  activeEntity(dataSource: string, entity: string) {
    this.activeLink.set({ dataSource, entity })
  }

  async openCreateParameter(name?: string) {
    const dataSettings = this.dataSettings()
    const entityType = await firstValueFrom(this.storyService.selectEntityType(dataSettings))
    this._dialog
        .open(NgmParameterCreateComponent, {
          viewContainerRef: this._viewContainerRef,
          data: {
            dataSettings: dataSettings,
            entityType: entityType,
            coreService: this.coreService,
            name: name
          }
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            // 参数创建成功
            console.log(result)
          }
        })
  }

  removeParameter(parameter: string) {
    this.storyService.removeEntityParameter({
      dataSource: this.activeLink().dataSource,
      entity: this.activeLink().entity,
      parameter
    })
  }

  async openCreateCalculation() {

    this.router.navigate(['create'], { relativeTo: this.route })
    return

    // const dataSettings = {
    //   dataSource: this.activeLink().dataSource,
    //   entitySet: this.activeLink().entity
    // }
    // const entityType = await firstValueFrom(this.storyService.selectEntityType(dataSettings))
    // const data = {
    //   dataSettings,
    //   entityType,
    //   syntax: Syntax.MDX,
    //   coreService: this.coreService,
    //   value: null
    // }

    // const property = await firstValueFrom(
    //   this._dialog
    //     .open<unknown, unknown, CalculationProperty>(CalculationEditorComponent, {
    //       viewContainerRef: this._viewContainerRef,
    //       data
    //     })
    //     .afterClosed()
    // )
    // if (property) {
    //   this.storyService.addCalculationMeasure({ dataSettings, calculation: property })
    // }
  }

  async openEditCalculation(calculationProperty: CalculationProperty) {

    this.router.navigate([calculationProperty.__id__], { relativeTo: this.route, state: { value: calculationProperty } })
    return

    // const dataSettings = {
    //   dataSource: this.activeLink().dataSource,
    //   entitySet: this.activeLink().entity
    // }
    // const entityType = await firstValueFrom(this.storyService.selectEntityType(dataSettings))
    // const property = await firstValueFrom(
    //   this._dialog
    //     .open<unknown, unknown, CalculationProperty>(CalculationEditorComponent, {
    //       viewContainerRef: this._viewContainerRef,
    //       data: {
    //         dataSettings: dataSettings,
    //         entityType: entityType,
    //         value: calculationProperty,
    //         syntax: Syntax.MDX,
    //         coreService: this.coreService
    //       }
    //     })
    //     .afterClosed()
    // )

    // if (property) {
    //   this.storyService.updateCalculationMeasure({ dataSettings, calculation: property })
    // }
  }

  async removeCalculation(calculationProperty: CalculationProperty) {
    const confirm = await firstValueFrom(
      this._dialog
        .open(ConfirmDeleteComponent, { data: { value: calculationProperty.caption || calculationProperty.name } })
        .afterClosed()
    )
    if (confirm) {
      this.storyService.removeCalculation({
        dataSettings: { dataSource: this.activeLink().dataSource, entitySet: this.activeLink().entity },
        name: calculationProperty.name
      })
    }
  }

  close() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }
}
