export interface IBaseEventArgs {
  /**
   * Provides reference to the owner component.
   */
  owner?: any
}

export interface CancelableEventArgs {
  /**
   * Provides the ability to cancel the event.
   */
  cancel: boolean
}

export interface CancelableBrowserEventArgs extends CancelableEventArgs {
  /** Browser event */
  event?: Event
}
