export const ODATA_SRV = 'ZMyOData_SRV'
export const ODATA_URI = `/sap/opu/odata/sap/${ODATA_SRV}/`
export const ODATA_URI_METADATA = `${ODATA_URI}$metadata`
export const ODATA_ENTITY = 'MyEntity'
export const ODATA_ENTITY_DIMENSION = 'Factory'
export const ODATA_ENTITY_VALUEHELP_PROPERTY = 'Factory'
export const ODATA_ENTITY_VALUEHELP_ENTITY = 'ZTV_I_FactoryVH'
export const ODATA_META_DATA = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="1.0"
    xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"
    xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"
    xmlns:sap="http://www.sap.com/Protocols/SAPData">
    <edmx:Reference xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
        <edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common"/>
    </edmx:Reference>
    <edmx:DataServices m:DataServiceVersion="2.0">
        <Schema Namespace="ZMyOData_SRV" xml:lang="zh" sap:schema-version="1"
            xmlns="http://schemas.microsoft.com/ado/2008/09/edm">
            <EntityType Name="MyEntityType" sap:semantics="aggregate" sap:label="My Entity" sap:content-version="1">
                <Key>
                    <PropertyRef Name="ID"/>
                </Key>
                <Property Name="ID" Type="Edm.String" Nullable="false"/>
                <Property Name="Factory" Type="Edm.String" MaxLength="10" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:text="FactoryName"/>
                <Property Name="FactoryName" Type="Edm.String" MaxLength="10" sap:aggregation-role="dimension" sap:display-format="UpperCase"/>
                <Property Name="ProdQuantity" Type="Edm.Decimal" Precision="16" Scale="0" sap:aggregation-role="dimension" sap:label="产出数量"/>
                <Property Name="PlanQuantity" Type="Edm.Decimal" Precision="16" Scale="0" sap:aggregation-role="dimension" sap:label="计划数量"/>
                <Property Name="Rate" Type="Edm.Decimal" Precision="8" Scale="0" sap:aggregation-role="measure" sap:unit="Percentage" sap:filterable="false"/>
                <Property Name="Percentage" Type="Edm.String" MaxLength="3" sap:aggregation-role="dimension" sap:semantics="unit-of-measure"/>
                <Property Name="A" Type="Edm.Decimal" Precision="16" Scale="0" sap:aggregation-role="measure" sap:label="当期"/>
                <Property Name="M" Type="Edm.Decimal" Precision="16" Scale="0" sap:aggregation-role="measure" sap:label="上期"/>
                <Property Name="Y" Type="Edm.Decimal" Precision="16" Scale="0" sap:aggregation-role="measure" sap:label="同期"/>
            </EntityType>
            <EntityType Name="ZTV_I_FactoryVHType" sap:label="工厂搜索帮助" sap:content-version="1">
                <Key>
                    <PropertyRef Name="Product"/>
                    <PropertyRef Name="Factory"/>
                </Key>
                <Property Name="Product" Type="Edm.String" Nullable="false" MaxLength="2" sap:display-format="UpperCase"/>
                <Property Name="Factory" Type="Edm.String" Nullable="false" MaxLength="10" sap:display-format="UpperCase" sap:text="FactoryName"/>
                <Property Name="FactoryName" Type="Edm.String" MaxLength="10" sap:display-format="UpperCase"/>
            </EntityType>
            <EntityType Name="ZSCM_C_PurExpCategoryResult" sap:semantics="aggregate" sap:label="供应链：采购支出分析-带品类参数" sap:content-version="1">
                <Key>
                    <PropertyRef Name="ID"/>
                </Key>
                <Property Name="ID" Type="Edm.String" Nullable="false"/>
                <Property Name="OrderNo" Type="Edm.String" MaxLength="10" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:label="订单编号"/>
                <Property Name="Materials" Type="Edm.String" MaxLength="18" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:label="物料号"/>
                <Property Name="MaterialsText" Type="Edm.String" MaxLength="60" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:label="物料描述"/>
                <Property Name="Amount" Type="Edm.Decimal" Precision="17" Scale="3" sap:aggregation-role="measure" sap:label="金额" sap:filterable="false"/>
                <Property Name="Quantity" Type="Edm.Decimal" Precision="18" Scale="3" sap:aggregation-role="measure" sap:unit="QuantityUnit" sap:label="数量" sap:filterable="false"/>
            </EntityType>
            <EntityType Name="ZSCM_C_PurExpCategoryParameters" sap:semantics="parameters" sap:content-version="1">
                <Key>
                    <PropertyRef Name="p_category"/>
                </Key>
                <Property Name="p_category" Type="Edm.String" Nullable="false" MaxLength="10" sap:parameter="mandatory" sap:label="物料品类" sap:creatable="false" sap:updatable="false" sap:sortable="false" sap:filterable="false"/>
                <NavigationProperty Name="Results" Relationship="ZMyOData_SRV.assoc_2ED98D58F9F501E27A6A88BCD5004593" FromRole="FromRole_assoc_2ED98D58F9F501E27A6A88BCD5004593" ToRole="ToRole_assoc_2ED98D58F9F501E27A6A88BCD5004593"/>
            </EntityType>
            <Association Name="assoc_2ED98D58F9F501E27A6A88BCD5004593" sap:content-version="1">
                <End Type="ZMyOData_SRV.ZSCM_C_PurExpCategoryParameters" Multiplicity="1" Role="FromRole_assoc_2ED98D58F9F501E27A6A88BCD5004593"/>
                <End Type="ZMyOData_SRV.ZSCM_C_PurExpCategoryResult" Multiplicity="*" Role="ToRole_assoc_2ED98D58F9F501E27A6A88BCD5004593"/>
            </Association>
            <EntityContainer Name="ZMyOData_SRV_Entities" m:IsDefaultEntityContainer="true" sap:supported-formats="atom json xlsx">
                <EntitySet Name="MyEntity" EntityType="ZMyOData_SRV.MyEntityType" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1"/>
                <EntitySet Name="ZSCM_C_PurExpCategoryResults" EntityType="ZMyOData_SRV.ZSCM_C_PurExpCategoryResult" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:addressable="false" sap:content-version="1"/>
                <EntitySet Name="ZSCM_C_PurExpCategory" EntityType="ZMyOData_SRV.ZSCM_C_PurExpCategoryParameters" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:pageable="false" sap:content-version="1"/>
                <EntitySet Name="ZTV_I_FactoryVH" EntityType="ZMyOData_SRV.ZTV_I_FactoryVHType" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1"/>
                <AssociationSet Name="assoc_2ED98D58F9F501E27A6A88BCD5004593" Association="ZMyOData_SRV.assoc_2ED98D58F9F501E27A6A88BCD5004593" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1">
                    <End EntitySet="ZSCM_C_PurExpCategory" Role="FromRole_assoc_2ED98D58F9F501E27A6A88BCD5004593"/>
                    <End EntitySet="ZSCM_C_PurExpCategoryResults" Role="ToRole_assoc_2ED98D58F9F501E27A6A88BCD5004593"/>
                </AssociationSet>
            </EntityContainer>
            <Annotations Target="ZMyOData_SRV.MyEntityType/Factory"
                xmlns="http://docs.oasis-open.org/odata/ns/edm">
                <Annotation Term="Common.ValueList">
                    <Record>
                        <PropertyValue Property="Label" String="工厂搜索帮助"/>
                        <PropertyValue Property="CollectionPath" String="ZTV_I_FactoryVH"/>
                        <PropertyValue Property="SearchSupported" Bool="true"/>
                        <PropertyValue Property="Parameters">
                            <Collection>
                                <Record Type="Common.ValueListParameterInOut">
                                    <PropertyValue Property="LocalDataProperty" PropertyPath="Product"/>
                                    <PropertyValue Property="ValueListProperty" String="Product"/>
                                </Record>
                                <Record Type="Common.ValueListParameterInOut">
                                    <PropertyValue Property="LocalDataProperty" PropertyPath="Factory"/>
                                    <PropertyValue Property="ValueListProperty" String="Factory"/>
                                </Record>
                                <Record Type="Common.ValueListParameterDisplaOnly">
                                    <PropertyValue Property="ValueListProperty" String="FactoryName"/>
                                </Record>
                            </Collection>
                        </PropertyValue>
                    </Record>
                </Annotation>
            </Annotations>
        </Schema>
    </edmx:DataServices>
</edmx:Edmx>`

const ODATA_ANNOTATION = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
    <edmx:Reference Uri="../../catalogservice;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_COMMON',Version='0001',SAP__Origin='BW')/$value">
        <edmx:Include Namespace="com.sap.vocabularies.Common.v1" Alias="Common"/>
    </edmx:Reference>
    <edmx:Reference Uri="../../catalogservice;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_UI',Version='0001',SAP__Origin='BW')/$value">
        <edmx:Include Namespace="com.sap.vocabularies.UI.v1" Alias="UI"/>
    </edmx:Reference>
    <edmx:Reference Uri="../../catalogservice;v=2/Vocabularies(TechnicalName='%2FIWBEP%2FVOC_COMMUNICATION',Version='0001',SAP__Origin='BW')/$value">
        <edmx:Include Namespace="com.sap.vocabularies.Communication.v1" Alias="Communication"/>
    </edmx:Reference>
    <edmx:Reference Uri="../../../sap/${ODATA_SRV}/$metadata">
        <edmx:Include Namespace="${ODATA_SRV}" Alias="SAP"/>
    </edmx:Reference>
    <edmx:DataServices>
        <Schema Namespace="${ODATA_SRV}_anno_mdl.v1" xmlns="http://docs.oasis-open.org/odata/ns/edm">
            <Annotations Target="${ODATA_SRV}.MyEntityType">
                <Annotation Term="UI.DataPoint" Qualifier="periodic">
                    <Record>
                        <PropertyValue Property="Value" Path="PeriodicMoMRate"/>
                        <PropertyValue Property="Title" String="环比"/>
                        <PropertyValue Property="TargetValue" Path="MoMRate"/>
                        <PropertyValue Property="TrendCalculation">
                            <Record>
                                <PropertyValue Property="ReferenceValue" Path="MoMRate"/>
                                <PropertyValue Property="IsRelativeDifference" Bool="true"/>
                                <PropertyValue Property="UpDifference" Decimal="0"/>
                                <PropertyValue Property="StrongUpDifference" Decimal="0"/>
                                <PropertyValue Property="DownDifference" Decimal="0"/>
                                <PropertyValue Property="StrongDownDifference" Decimal="0"/>
                            </Record>
                        </PropertyValue>
                    </Record>
                </Annotation>
            </Annotations>
        </Schema>
    </edmx:DataServices>
</edmx:Edmx>`

export const ODATA_ENTITY_DATA = [
  {
    Factory: '000000001',
    FactoryName: 'Factory 1',
    ProdQuantity: 1000,
  },
  {
    Factory: '000000002',
    FactoryName: 'Factory 2',
    ProdQuantity: 500,
  },
  {
    Factory: '000000003',
    FactoryName: 'Factory 3',
    ProdQuantity: 10000,
  },
]
export const ODATA_VALUEHELP_DATA = [
  {
    Factory: '000000001',
    FactoryName: 'Factory 1',
  },
  {
    Factory: '000000002',
    FactoryName: 'Factory 2',
  },
  {
    Factory: '000000003',
    FactoryName: 'Factory 3',
  },
]
export const ODATA_VALUEHELP_SELECT_OPTIONS = [
  {
    value: '000000001',
    text: 'Factory 1',
  },
  {
    value: '000000002',
    text: 'Factory 2',
  },
  {
    value: '000000003',
    text: 'Factory 3',
  },
]

export const DATA = [
  {
    Field: 'Name 1',
    Value: 10,
  },
  {
    Field: 'Name 2',
    Value: 50,
  },
  {
    Field: 'Name 3',
    Value: 20,
  },
]
