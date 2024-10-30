import { trigger, transition, style, animate, query, stagger } from '@angular/animations'

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0 }), stagger('60ms', animate('300ms ease-out', style({ opacity: 1 })))], {
      optional: true
    }),
    query(':leave', animate('100ms', style({ opacity: 0 })), { optional: true })
  ])
])

export function listFadeIn(time?: number) {
  return trigger('listFadeIn', [
    // 列表项新添加时淡入
    transition(':enter', [
      style({ opacity: 0.5 }),   // 初始透明度为 0
      animate(`${time ?? 300}ms ease-out`, style({ opacity: 1 })),  // 动画到透明度为 1
    ]),
  ])
}