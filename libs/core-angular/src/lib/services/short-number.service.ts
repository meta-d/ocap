import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class NxShortNumberService {
  // private valueModel: Model<ShortNumberType>;
  // private unitModel: Model<string>;
  
  public value$: Observable<ShortNumberType>;
  public unit$: Observable<string>;

  constructor(
  ) {
    // this.valueModel = valueFactory.create(null);
    // this.unitModel  = unitFactory.create('');

    // this.value$ = this.valueModel.data$;
    // this.unit$  = this.unitModel.data$;
  }

  /**
   * 输入数字， 输出缩短后的数字和单位
   * 
   * @param number 
   * @param args 
   */
  public transform(number: number, args?: any): ShortNumberType {
    if (isNaN(number)) return null; // will only work value is a number
    if (number === null) return null;
    if (number === 0) return {value: 0, unit: ''};

    let abs = Math.abs(number);
    const rounder = Math.pow(10, 1);
    const isNegative = number < 0; // will also work for Negetive numbers
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 }
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }

    let shortNumber = {
      value: Number((isNegative ? '-' : '') + abs),
      unit: key
    }
    // this.valueModel.set(shortNumber);

    // this.unitModel.set(key);

    return shortNumber;
  }
}

export type ShortNumberType = {
  value: number,
  unit: string
}
