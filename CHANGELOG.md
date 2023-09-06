<a name="0.2.0-rc.0"></a>

# 0.2.0-rc.0 (2023-1-5)

## core

New features:

* Add `aggregator` attribute in type `Indicator`, `CalculationProperty` and `CalculatedMember`.
* Add `indicators` attribute in `Schema` interface.
* Add convert indicators from `Schema` to `EntityType` logic in `selectEntitySet` method of `AbstractDataSource`.
* Remove deprecated `label` (replace with `caption`) attribute in types `EntityType` `Property` etc.

## SQL

New features:

* Support indicator measures.
* Support use keywords `Measures` in formula of calculated measure.
