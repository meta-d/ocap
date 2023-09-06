# Color Scale Chromatic Pellete

https://zefoy.github.io/ngx-color-picker/

https://ngx-color.netlify.com/

https://material.io/design/color/the-color-system.html

https://material.io/design/material-studies/rally.html

https://material.angular.io/guide/theming

https://material.io/inline-tools/color/

https://github.com/edelstone/material-palette-generator

![Material Design Palette Generator](https://github.com/edelstone/material-palette-generator/raw/master/images/screenshot.png)

## Color Pellete

为图形选择颜色可以分为三种类型：

* **Single** 单值颜色，指一种颜色
* **Spectrum** 颜色序列，指渐变的颜色序列
* **Category** 类别颜色，指一组离散的颜色值

通常坐标系的:

* Catetory 轴可以选择 Spectrum 和 Category；
* Value 轴可以选择 Spectrum；
* 一个 Series Component 可以选择 Single；

单个颜色是从 Spectrum 或者 Category 中再选出来的单个颜色值，所以选择单个颜色时先要选择颜色系列再选择此系列中的单个颜色值。

## Issues

### t.rgb is not a function (latest d3-color version (1.4.0))

https://github.com/d3/d3-color/issues/68

as an Angular issue.
