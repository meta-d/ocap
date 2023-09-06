import { InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { StoryFeed } from './types'

export const NX_STORY_FEED = new InjectionToken<NxStoryFeedService>('Story Feed Service')

/**
 * 存储 Story 配置的服务抽象接口
 */
export interface NxStoryFeedService {
  /**
   * 创建 Feed 在这里是 Pin Widget
   */
  createFeed(feed: StoryFeed): Observable<StoryFeed>
  /**
   * 删除 Feed
   * @param uuid
   */
  deleteFeed(uuid: string): Observable<void>
  /**
   * 获取当前用户所有的 Feed
   */
  getMyFeed(): Observable<Array<StoryFeed>>
}
