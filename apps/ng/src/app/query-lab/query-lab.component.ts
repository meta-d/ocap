import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { NgmFormulaModule } from '@metad/ocap-angular/formula'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { DUCKDB_TOP_SUBSCRIBED_MODEL } from '@metad/ocap-duckdb'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, NgmFormulaModule],
  selector: 'metad-ocap-query-lab',
  templateUrl: 'query-lab.component.html',
  styles: [],
  providers: []
})
export class QueryLabComponent {
  editorOptions = {
    theme: 'vs',
    automaticLayout: true,
    language: 'sql'
  }
  statement1 = `SELECT concat('[', CASE WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#' ELSE "topsubscribed_topSubscribed"."Category" END, ']') AS "[Category]", "topsubscribed_topSubscribed"."Category" AS "[Category].[MEMBER_CAPTION]", SUM( "topsubscribed_topSubscribed"."Subscribers" ) AS "Subscribers" FROM "main"."topSubscribed" AS "topsubscribed_topSubscribed" WHERE NOT ( "topsubscribed_topSubscribed"."Category" = 'https://us.youtubers.me/global/all/top-1000-most_subscribed-youtube-channels' ) GROUP BY "topsubscribed_topSubscribed"."Category" ORDER BY "Subscribers" ASC, "topsubscribed_topSubscribed"."Category"`
  statement = `(
    SELECT '(All)' AS "[Youtube Channel]",
        'All' AS "[Youtube Channel].[MEMBER_CAPTION]",
        '' AS "[Youtube Channel].[PARENT_UNIQUE_NAME]",
        COUNT(
            DISTINCT concat(
                '[',
                CASE
                    WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#'
                    ELSE "topsubscribed_topSubscribed"."Category"
                END,
                ']'
            )
        ) AS "[Youtube Channel].[CHILDREN_CARDINALITY]",
        SUM("topsubscribed_topSubscribed"."Subscribers") AS "Subscribers"
    FROM "main"."topSubscribed" AS "topsubscribed_topSubscribed"
    WHERE NOT (
            "topsubscribed_topSubscribed"."Category" = 'https://us.youtubers.me/global/all/top-1000-most_subscribed-youtube-channels'
        )
    GROUP BY 1
)
union
(
    SELECT concat(
            '[',
            CASE
                WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#'
                ELSE "topsubscribed_topSubscribed"."Category"
            END,
            ']'
        ) AS "[Youtube Channel]",
        "topsubscribed_topSubscribed"."Category" AS "[Youtube Channel].[MEMBER_CAPTION]",
        '(All)' AS "[Youtube Channel].[PARENT_UNIQUE_NAME]",
        COUNT(
            DISTINCT concat(
                '[',
                CASE
                    WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#'
                    ELSE "topsubscribed_topSubscribed"."Category"
                END,
                '].[',
CASE
                    WHEN "topsubscribed_topSubscribed"."Youtube Channel" IS NULL THEN '#'
                    ELSE "topsubscribed_topSubscribed"."Youtube Channel"
                END,
                ']'
            )
        ) AS "[Youtube Channel].[CHILDREN_CARDINALITY]",
        SUM("topsubscribed_topSubscribed"."Subscribers") AS "Subscribers"
    FROM "main"."topSubscribed" AS "topsubscribed_topSubscribed"
    WHERE NOT (
            "topsubscribed_topSubscribed"."Category" = 'https://us.youtubers.me/global/all/top-1000-most_subscribed-youtube-channels'
        )
    GROUP BY "topsubscribed_topSubscribed"."Category"
    ORDER BY "topsubscribed_topSubscribed"."Category"
)
union
(
    SELECT concat(
            '[',
            CASE
                WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#'
                ELSE "topsubscribed_topSubscribed"."Category"
            END,
            '].[',
CASE
                WHEN "topsubscribed_topSubscribed"."Youtube Channel" IS NULL THEN '#'
                ELSE "topsubscribed_topSubscribed"."Youtube Channel"
            END,
            ']'
        ) AS "[Youtube Channel]",
        "topsubscribed_topSubscribed"."Youtube Channel" AS "[Youtube Channel].[MEMBER_CAPTION]",
        concat(
            '[',
            CASE
                WHEN "topsubscribed_topSubscribed"."Category" IS NULL THEN '#'
                ELSE "topsubscribed_topSubscribed"."Category"
            END,
            ']'
        ) AS "[Youtube Channel].[PARENT_UNIQUE_NAME]",
        0 AS "[Youtube Channel].[CHILDREN_CARDINALITY]",
        SUM("topsubscribed_topSubscribed"."Subscribers") AS "Subscribers"
    FROM "main"."topSubscribed" AS "topsubscribed_topSubscribed"
    WHERE NOT (
            "topsubscribed_topSubscribed"."Category" = 'https://us.youtubers.me/global/all/top-1000-most_subscribed-youtube-channels'
        )
    GROUP BY "topsubscribed_topSubscribed"."Category",
        "topsubscribed_topSubscribed"."Youtube Channel"
    ORDER BY "topsubscribed_topSubscribed"."Category",
        "topsubscribed_topSubscribed"."Youtube Channel"
)`

  result = {}
  error
  constructor(private agent: WasmAgentService, private _cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (isMobile()) {
      alert(`Is Mobile platform!`)
    }
  }

  onStatementChange(event) {
    console.log(event)
  }

  async run() {
    try {
      this.result = await this.agent.request(
        {
          name: DUCKDB_TOP_SUBSCRIBED_MODEL.name
        } as any,
        {
          method: 'post',
          url: 'query',
          body: {
            statement: this.statement
          }
        }
      )

      console.log(this.result)
    } catch (err) {
      this.error = err
    }

    this._cdr.detectChanges()
  }

  async catalogs() {
    try {
      this.result = await this.agent.request(
        {
          name: DUCKDB_TOP_SUBSCRIBED_MODEL.name
        } as any,
        {
          method: 'get',
          url: 'catalogs'
        }
      )

      console.log(this.result)
    } catch (err) {
      this.error = err
    }

    this._cdr.detectChanges()
  }
}

// 检测是否为移动设备
function isMobile() {
  return /Mobi/i.test(navigator.userAgent)
}

// 检测是否为 iOS 设备
function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// 检测是否为 Android 设备
function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}
