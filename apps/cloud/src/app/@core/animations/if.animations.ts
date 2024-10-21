import { animate, style, transition, trigger } from '@angular/animations'


export const IfAnimation = trigger('ifAnimationTrigger', [
    transition(':enter', [style({opacity: 0}), animate('100ms', style({opacity: 1}))]),
    transition(':leave', [animate('100ms', style({opacity: 0}))]),
  ])