import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { Meta, moduleMetadata } from '@storybook/angular'
import { OcapCoreModule } from '../core.module'
import { ButtonGroupDirective } from './button-group.directive'

export default {
  title: 'Core/ButtonGroupDirective',
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,

        OcapCoreModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatSlideToggleModule,
        ButtonGroupDirective,
      ],
      providers: []
    })
  ]
} as Meta

export const Primary = {
  render: (args: ButtonGroupDirective) => ({
    template: `
    <mat-slide-toggle>Slide me!</mat-slide-toggle>
  
  <div >
  <div >
    <mat-icon>share</mat-icon>
    <mat-icon displayDensity="cosy">share</mat-icon>
    <mat-icon displayDensity="compact">share</mat-icon>
  </div>
  
  <div>
    <button mat-icon-button ngmAppearance="danger">
      <mat-icon>share</mat-icon>
    </button>
    <button mat-icon-button ngmAppearance="acrylic">
      <mat-icon>share</mat-icon>
    </button>
    <button mat-icon-button displayDensity="cosy">
      <mat-icon>share</mat-icon>
    </button>
    <button mat-icon-button displayDensity="compact">
      <mat-icon>share</mat-icon>
    </button>
  </div>
  
  <div>
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="color" color="primary">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="color" color="accent">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" displayDensity="compact"
      ngmAppearance="color" color="accent"
      [value]="'italic'">
      <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
      <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
      <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" multiple="true" displayDensity="compact"
      ngmAppearance="color" color="accent">
      <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
      <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
      <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" vertical ngmAppearance="color" color="primary">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" vertical multiple="true" displayDensity="compact"
      ngmAppearance="color" color="accent">
      <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
      <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
      <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="outline" color="primary">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  
    <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="outline" color="primary" displayDensity="compact">
      <mat-button-toggle value="bold">Bold</mat-button-toggle>
      <mat-button-toggle value="italic">Italic</mat-button-toggle>
      <mat-button-toggle value="underline">Underline</mat-button-toggle>
    </mat-button-toggle-group>
  </div>
  
  <div>
    <mat-chip-list aria-label="Fish selection" >
      <mat-chip>One fish</mat-chip>
      <mat-chip>Two fish</mat-chip>
      <mat-chip color="primary" selected>Primary fish</mat-chip>
      <mat-chip color="accent" selected>Accent fish</mat-chip>
      <mat-chip color="warn" selected>warn fish</mat-chip>
    </mat-chip-list>
  
    <mat-chip-list aria-label="Fish selection" ngmAppearance="outline">
      <mat-chip>One fish</mat-chip>
      <mat-chip>Two fish</mat-chip>
      <mat-chip color="primary" selected>Primary fish</mat-chip>
      <mat-chip color="accent" selected>Accent fish</mat-chip>
      <mat-chip color="warn" selected>warn fish</mat-chip>
    </mat-chip-list>
  
    <mat-chip-list aria-label="Fish selection" ngmAppearance="dashed">
      <mat-chip>One fish</mat-chip>
      <mat-chip>Two fish</mat-chip>
      <mat-chip color="primary" selected>Primary fish</mat-chip>
      <mat-chip color="accent" selected>Accent fish</mat-chip>
      <mat-chip color="warn" selected>warn fish</mat-chip>
    </mat-chip-list>
  
    <mat-chip-list aria-label="Fish selection" ngmAppearance="outline" displayDensity="compact">
      <mat-chip>One fish</mat-chip>
      <mat-chip>Two fish</mat-chip>
      <mat-chip color="primary" selected>Primary fish</mat-chip>
      <mat-chip color="accent" selected>Accent fish</mat-chip>
      <mat-chip color="warn" selected>warn fish</mat-chip>
    </mat-chip-list>
  </div>
  
  <div fxLayout="row wrap" fxLayoutAlign="space-between center" >
    <div ngmButtonGroup>
      <button mat-button>Click me!</button>
      <button mat-raised-button color="primary">Click me!</button>
    </div>
  
    <div ngmButtonGroup>
      <button mat-flat-button>Click me!</button>
      <button mat-raised-button color="primary">Click me!</button>
      <button mat-raised-button color="accent">Click me!</button>
    </div>
  
    <div ngmButtonGroup displayDensity="cosy">
      <button mat-flat-button displayDensity="cosy">Click me!</button>
      <button mat-raised-button color="primary" displayDensity="cosy">Click me!</button>
      <button mat-raised-button color="accent" displayDensity="cosy">Click me!</button>
    </div>
  
    <div ngmButtonGroup displayDensity="compact">
      <button mat-flat-button displayDensity="compact">Click me!</button>
      <button mat-raised-button color="primary" displayDensity="compact">Click me!</button>
      <button mat-raised-button color="accent" displayDensity="compact">Click me!</button>
    </div>
  </div>
  
  <div fxLayout="row wrap" fxLayoutAlign="space-between center" >
    <button mat-button color="accent" [loading]="true">Accent</button>
  
    <button mat-flat-button [loading]="true">Confortable</button>
    <button mat-flat-button displayDensity="cosy" [loading]="true">Cosy</button>
    <button mat-flat-button displayDensity="compact" [loading]="true">Compact</button>
  
    <button mat-raised-button color="primary" [loading]="true">Primary</button>
    <button mat-raised-button color="accent" [loading]="true">Accent</button>
  
    <button mat-stroked-button color="accent" [loading]="true">Accent</button>
  
    <button mat-icon-button [loading]="true" color="primary">
      <mat-icon>more_vert</mat-icon>
    </button>
    <button mat-fab [loading]="true" color="primary">
      <mat-icon>delete</mat-icon>
    </button>
    <button mat-mini-fab [loading]="true" color="primary">
      <mat-icon>menu</mat-icon>
    </button>
  </div>
  
  <div fxLayout="row wrap" fxLayoutAlign="space-between center" >
    <div ngmButtonGroup>
      <button mat-button>Click me!</button>
      <button mat-raised-button color="accent" [loading]="true">Click me!</button>
    </div>
  </div>
  </div>
    `,
    props: args
  }),
  args: {
    text: 'Click me!',
    padding: 10,
    disabled: true
  }
}
