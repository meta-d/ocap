// import { NxXmlaService } from './xmla.service'
// import { Xmla } from './xmla/Xmla'
// import axios from 'axios';
// // import MockAdapter from 'axios-mock-adapter';
// import { fetchDataFromMultidimensionalTuple } from './xmla/multidimensional'

// const XMLA_URI = `http://127.0.0.1:3001/xmla`

// describe('NxXmlaService', () => {
//   let service: NxXmlaService
//   let httpMock: HttpTestingController

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule, NxDSCoreModule.forRoot()],
//       providers: [],
//     })
//     httpMock = TestBed.inject(HttpTestingController)
//     service = new NxXmlaService('foodmart', {
//       url: XMLA_URI,
//     })
//   })

//   afterEach(() => {
//     httpMock.verify()
//   })

//   it('#discoverMDDimensions', () => {

//     service.discoverDataSources().subscribe((rowset) => {
//       console.warn(rowset.fetchAllAsObject())
//     })

//     service.discoverMDDimensions({}).subscribe((rowset) => {
//       console.warn(rowset.fetchAllAsObject())
//     })

//   //   service.discoverMDMeasures({}).subscribe((rowset) => {
//   //     console.warn(rowset.fetchAllAsObject())
//   //   })

//   //   service.discoverMDHierarchies({}).subscribe((rowset) => {
//   //     console.warn(rowset.fetchAllAsObject())
//   //   })

//   //   // service
//   //   //   .execute(
//   //   //     `WITH MEMBER [Measures].[Price] AS IIF([Measures].[ZYXQB]=0,null,([Measures].[ZPO_LCVAL]/[Measures].[ZYXQB])) SELECT {[ZDOCTYPE]} ON ROWS, {[Measures].[Price], [Measures].[ZPO_LCVAL], [Measures].[ZYXQB]} ON COLUMNS FROM ZCPMM0003/ZCPMM0003_Q001`,
//   //   //     Xmla.PROP_FORMAT_MULTIDIMENSIONAL
//   //   //   )
//   //   //   .subscribe((response) => {
//   //   //     console.warn(response.fetchAsObject())
//   //   //   })
//   //   expect(service).toBeDefined(0)
//   })

//   // it('#discoverMDLevels', (done) => {

//   //   service.discoverMDLevels({
//   //     properties: {
//   //       Catalog: catalog,
//   //     },
//   //     restrictions: {
//   //       CUBE_NAME,
//   //       DIMENSION_UNIQUE_NAME: '[/CPMB/IKDBOC0]',
//   //       HIERARCHY_UNIQUE_NAME: '[/CPMB/IKDBOC0                 PARENTH1]',
//   //     },

//   //   }).subscribe((rowset) => {
//   //     console.warn(rowset.fetchAllAsObject())
//   //     done()
//   //   })
//   // })

//   // it('#discoverMDMembers', (done) => {

//   //   service.discoverMDMembers({
//   //     properties: {
//   //       Catalog: catalog,
//   //       // DbpropMsmdFlattened2: true
//   //     },
//   //     restrictions: {
//   //       CUBE_NAME,
//   //       DIMENSION_UNIQUE_NAME: '[/CPMB/IKDBOC0]',
//   //       HIERARCHY_UNIQUE_NAME: '[/CPMB/IKDBOC0                 PARENTH1]',
//   //       LEVEL_UNIQUE_NAME: '[/CPMB/IKDBOC0                 PARENTH1].[LEVEL01]',
//   //     },

//   //   }).subscribe((rowset) => {
//   //     console.warn(rowset.fetchAllAsObject())
//   //     done()
//   //   })
//   // })

//   // it('#query', (done) => {
//   //   // const mock = new MockAdapter(axios);
//   //   service.execute(`SELECT
//   //   {[Measures].[/CPMB/SDATA]} ON COLUMNS
//   //   FROM [$/CPMB/IKIJLTD]
//   //   WHERE {[/CPMB/IKDBOC0                 PARENTH1].[CLOUDBMC]}`)
//   //     .subscribe(response => {
//   //       console.warn(fetchDataFromMultidimensionalTuple(response))
//   //       done()
//   //     })
//   //   // mock.onPost(XMLA_URI).reply(200, RETURN_XML, {
//   //   //   'content-type': 'text/xml; charset=utf-8'
//   //   // })
//   // })

//   // it('#query return empty cell data', (done) => {
//   //   // const mock = new MockAdapter(axios);
//   //   service.execute(`SELECT
//   //   {[Measures].[/CPMB/SDATA]} ON COLUMNS,
//   //   non empty {Descendants([/CPMB/IKDCQ2K                 PARENTH1].[BB020000], 3)} ON ROWS
//   //   FROM [$/CPMB/IKIJLTD]`)
//   //     .subscribe(response => {
//   //       console.warn(fetchDataFromMultidimensionalTuple(response))
//   //       expect({}).toBeDefined()
//   //       done()
//   //     })
//   // })

//   // it('#query return empty data', (done) => {
//   //   service.execute(`SELECT
//   //   {[Measures].[/CPMB/SDATA]} ON COLUMNS,
//   //   non empty {Descendants([/CPMB/IKDCQ2K                 PARENTH1].[2018FUNC                        /CPMB/IKDCQ2K] ,
//   //   [/CPMB/IKDCQ2K                 PARENTH1].[LEVEL02])} ON ROWS
//   //   FROM [$/CPMB/IKIJLTD]`)
//   //     .subscribe(response => {
//   //       console.warn(fetchDataFromMultidimensionalTuple(response))
//   //       expect({}).toBeDefined()
//   //       done()
//   //     })
//   // })

//   // it('#query dimension members', (done) => {
//   //   service.execute(`SELECT
//   //   {} ON COLUMNS,
//   //   non empty {[/CPMB/IKDBOC0                 PARENTH1]}
//   //   DIMENSION PROPERTIES PARENT_UNIQUE_NAME
//   //   ON ROWS
//   //   FROM [$/CPMB/IKIJLTD]`)
//   //     .subscribe(response => {
//   //       console.warn(fetchDataFromMultidimensionalTuple(response))
//   //       expect({}).toBeDefined()
//   //       done()
//   //     })
//   // })
// })

// const RETURN_XML = `<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><SOAP-ENV:Body><ExecuteResponse xmlns="urn:schemas-microsoft-com:xml-analysis">
// <return xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
//         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

// <root xmlns="urn:schemas-microsoft-com:xml-analysis:mddataset" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
// <xsd:schema xmlns="urn:schemas-microsoft-com:xml-analysis:mddataset" 
//            targetNamespace="urn:schemas-microsoft-com:xml-analysis:mddataset"
//            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
//            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
//            xmlns:sql="urn:schemas-microsoft-com:xml-sql"
//            elementFormDefault="qualified">
// <xsd:complexType name="MemberType">
//  <xsd:attribute name="Hierarchy" type="xsd:string"/>
//   <xsd:sequence>
//    <xsd:element name="UName" type="xsd:string"/>
//    <xsd:element name="Caption" type="xsd:string"/>
//    <xsd:element name="LName" type="xsd:string"/>
//    <xsd:element name="LNum" type="xsd:unsignedInt"/>
//    <xsd:element name="DisplayInfo" type="xsd:unsignedInt"/>
//    <xsd:sequence maxOccurs="unbounded" minOccurs="0">
//     <xsd:any processContents="lax" maxOccurs="unbounded"/>
//    </xsd:sequence>
//   </xsd:sequence>
//  </xsd:complexType>
//  <xsd:complexType name="PropType">
//  <xsd:attribute name="name" type="xsd:string"/>
// </xsd:complexType>
// <xsd:complexType name="TupleType">
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="Member" type="MemberType"/>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="MembersType">
//  <xsd:attribute name="Hierarchy" type="xsd:string"/>
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="Member" type="MemberType"/>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="TuplesType">
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="Tuple" type="TupleType"/>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="CrossProductType">
//  <xsd:choice minOccurs="0" maxOccurs="unbounded">
//   <xsd:element name="Members" type="MembersType"/>
//   <xsd:element name="Tuples" type="TuplesType"/>
//  </xsd:choice>
// </xsd:complexType>
// <xsd:complexType name="OlapInfo">
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="CubeInfo">
//    <xsd:complexType>
//     <xsd:sequence maxOccurs="unbounded">
//      <xsd:element name="Cube">
//       <xsd:complexType>
//        <xsd:sequence maxOccurs="unbounded">
//         <xsd:choice>
//          <xsd:element name="CubeName" type="PropType"/>
//         </xsd:choice>
//        </xsd:sequence>
//       </xsd:complexType>
//      </xsd:element>
//     </xsd:sequence>
//    </xsd:complexType>
//   </xsd:element>
//   <xsd:element name="AxesInfo">
//    <xsd:complexType>
//     <xsd:sequence maxOccurs="unbounded">
//      <xsd:element name="AxisInfo">
//       <xsd:complexType>
//        <xsd:attribute name="name" type="xsd:string"/>
//        <xsd:sequence maxOccurs="unbounded">
//         <xsd:element name="HierarchyInfo">
//          <xsd:complexType>
//           <xsd:attribute name="name" type="xsd:string"/>
//           <xsd:sequence>
//            <xsd:sequence maxOccurs="unbounded">
//             <xsd:element name="UName" type="PropType"/>
//             <xsd:element name="Caption" type="PropType"/>
//             <xsd:element name="LName" type="PropType"/>
//             <xsd:element name="LNum" type="PropType"/>
//             <xsd:element name="DisplayInfo" type="PropType"/>
//            </xsd:sequence>
//            <xsd:sequence maxOccurs="unbounded" minOccurs="0">
//             <xsd:any processContents="lax" maxOccurs="unbounded"/>
//            </xsd:sequence>
//           </xsd:sequence>
//          </xsd:complexType>
//         </xsd:element>
//        </xsd:sequence>
//       </xsd:complexType>
//      </xsd:element>
//     </xsd:sequence>
//    </xsd:complexType>
//   </xsd:element>
//   <xsd:element name="CellInfo">
//    <xsd:complexType>
//     <xsd:sequence maxOccurs="unbounded">
//      <xsd:choice>
//       <xsd:element name="Value" type="PropType"/>
//       <xsd:element name="FmtValue" type="PropType"/>
//       <xsd:element name="BackColor" type="PropType"/>
//       <xsd:element name="ForeColor" type="PropType"/>
//       <xsd:element name="Currency" type="PropType"/>
//       <xsd:element name="Unit" type="PropType"/>
//      </xsd:choice>
//     </xsd:sequence>
//    </xsd:complexType>
//   </xsd:element>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="Axes">
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="Axis">
//    <xsd:complexType>
//     <xsd:attribute name="name" type="xsd:string"/>
//     <xsd:choice minOccurs="0" maxOccurs="unbounded">
//      <xsd:element name="CrossProduct" type="CrossProductType"/>
//      <xsd:element name="Tuples" type="TuplesType"/>
//      <xsd:element name="Members" type="MembersType"/>
//    </xsd:choice>
//    </xsd:complexType>
//   </xsd:element>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:complexType name="CellData">
//  <xsd:sequence maxOccurs="unbounded">
//   <xsd:element name="Cell">
//    <xsd:complexType>
//     <xsd:attribute name="CellOrdinal" type="xsd:unsignedInt"/>
//     <xsd:sequence maxOccurs="unbounded">
//      <xsd:choice>
//       <xsd:element name="Value"/>
//       <xsd:element name="FmtValue" type="xsd:string"/>
//       <xsd:element name="BackColor" type="xsd:unsignedInt"/>
//       <xsd:element name="ForeColor" type="xsd:unsignedInt"/>
//       <xsd:element name="Currency" type="xsd:string"/>
//       <xsd:element name="Unit" type="xsd:string"/>
//       <xsd:element name="AlertLevel" type="xsd:unsignedInt"/>
//       <xsd:element name="FontName" type="PropType"/>
//       <xsd:element name="FontSize" type="PropType"/>
//       <xsd:element name="FontFlags" type="PropType"/>
//       <xsd:element name="FormatString" type="PropType"/>
//       <xsd:element name="SolveOrder" type="PropType"/>
//       <xsd:element name="Visible" type="PropType"/>
//       <xsd:element name="Expression" type="PropType"/>
//      </xsd:choice>
//     </xsd:sequence>
//    </xsd:complexType>
//   </xsd:element>
//  </xsd:sequence>
// </xsd:complexType>
// <xsd:element name="root">
//  <xsd:complexType>
//   <xsd:sequence maxOccurs="unbounded">
//    <xsd:element name="OlapInfo" type="OlapInfo"/>
//    <xsd:element name="Axes" type="Axes"/>
//    <xsd:element name="CellData" type="CellData"/>
//   </xsd:sequence>
//  </xsd:complexType>
// </xsd:element>
// </xsd:schema>
// <OlapInfo><CubeInfo>
// <Cube><CubeName>[$/CPMB/IKIJLTD]</CubeName></Cube>
// </CubeInfo><AxesInfo><AxisInfo name="Axis0">
// <HierarchyInfo name="Measures"><UName name="[Measures].[MEMBER_UNIQUE_NAME]"/><Caption name="[Measures].[MEMBER_CAPTION]"/><LName name="[Measures].[LEVEL_UNIQUE_NAME]"/><LNum name="[Measures].[LEVEL_NUMBER]"/><DisplayInfo name="[Measures].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// </AxisInfo>
// <AxisInfo name="SlicerAxis">
// <HierarchyInfo name="/CPMB/IKDBOC0                 PARENTH1"><UName name="[/CPMB/IKDBOC0                 PARENTH1].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDBOC0                 PARENTH1].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDBOC0                 PARENTH1].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDBOC0                 PARENTH1].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDBOC0                 PARENTH1].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKD2ZQE"><UName name="[/CPMB/IKD2ZQE].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKD2ZQE].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKD2ZQE].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKD2ZQE].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKD2ZQE].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKD3RC7"><UName name="[/CPMB/IKD3RC7].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKD3RC7].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKD3RC7].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKD3RC7].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKD3RC7].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKD6CIV"><UName name="[/CPMB/IKD6CIV].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKD6CIV].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKD6CIV].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKD6CIV].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKD6CIV].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKD8BRC"><UName name="[/CPMB/IKD8BRC].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKD8BRC].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKD8BRC].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKD8BRC].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKD8BRC].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKDCQ2K"><UName name="[/CPMB/IKDCQ2K].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDCQ2K].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDCQ2K].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDCQ2K].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDCQ2K].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKDDMIK"><UName name="[/CPMB/IKDDMIK].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDDMIK].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDDMIK].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDDMIK].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDDMIK].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKDFF17"><UName name="[/CPMB/IKDFF17].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDFF17].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDFF17].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDFF17].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDFF17].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKDH7P7"><UName name="[/CPMB/IKDH7P7].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDH7P7].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDH7P7].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDH7P7].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDH7P7].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// <HierarchyInfo name="/CPMB/IKDS5KR"><UName name="[/CPMB/IKDS5KR].[MEMBER_UNIQUE_NAME]"/><Caption name="[/CPMB/IKDS5KR].[MEMBER_CAPTION]"/><LName name="[/CPMB/IKDS5KR].[LEVEL_UNIQUE_NAME]"/><LNum name="[/CPMB/IKDS5KR].[LEVEL_NUMBER]"/><DisplayInfo name="[/CPMB/IKDS5KR].[DISPLAY_INFO]"/>
// </HierarchyInfo>
// </AxisInfo>
// </AxesInfo><CellInfo>
// <Value name="VALUE"/>
// <FmtValue name="FORMATTED_VALUE"/>
// <Currency name="CURRENCY"/>
// <Unit name="UNIT"/>
// </CellInfo></OlapInfo><Axes>
// <Axis name="Axis0">
// <Tuples><Tuple>
// <Member Hierarchy="Measures"><UName>[Measures].[/CPMB/SDATA]</UName><Caption>SignData</Caption><LName>[Measures]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// </Tuple></Tuples></Axis>
// <Axis name="SlicerAxis">
// <Tuples><Tuple>
// <Member Hierarchy="/CPMB/IKDBOC0                 PARENTH1"><UName>[/CPMB/IKDBOC0                 PARENTH1].[CLOUDBMC]</UName><Caption>云平台成本</Caption><LName>[/CPMB/IKDBOC0                 PARENTH1].[LEVEL06]</LName><LNum>6</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKD2ZQE"><UName>[/CPMB/IKD2ZQE].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKD2ZQE].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKD3RC7"><UName>[/CPMB/IKD3RC7].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKD3RC7].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKD6CIV"><UName>[/CPMB/IKD6CIV].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKD6CIV].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKD8BRC"><UName>[/CPMB/IKD8BRC].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKD8BRC].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKDCQ2K"><UName>[/CPMB/IKDCQ2K].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKDCQ2K].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKDDMIK"><UName>[/CPMB/IKDDMIK].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKDDMIK].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKDFF17"><UName>[/CPMB/IKDFF17].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKDFF17].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKDH7P7"><UName>[/CPMB/IKDH7P7].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKDH7P7].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// <Member Hierarchy="/CPMB/IKDS5KR"><UName>[/CPMB/IKDS5KR].[All]</UName><Caption>All</Caption><LName>[/CPMB/IKDS5KR].[LEVEL00]</LName><LNum>0</LNum><DisplayInfo>0</DisplayInfo>
// </Member>
// </Tuple></Tuples></Axis>
// </Axes><CellData>
// <Cell CellOrdinal="0"><Value xsi:type="xsd:double">600.0000000</Value><FmtValue>600.0000000</FmtValue></Cell>
// </CellData>
// </root>
// </return></ExecuteResponse>
// </SOAP-ENV:Body></SOAP-ENV:Envelope>`