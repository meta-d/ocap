import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  UrlSegment
} from '@angular/router'

interface RouteStorageObject {
  snapshot: ActivatedRouteSnapshot
  handle: DetachedRouteHandle
}

export class AppRouteReuseStrategy implements RouteReuseStrategy {
  storedRoutes: { [key: string]: RouteStorageObject } = {}

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data.reuseRoute || false
    // return true
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    // (handle as any)?.componentRef?.destroy()
    const id = this.createIdentifier(route)
    this.storedRoutes[id] = {
      snapshot: route,
      handle
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const id = this.createIdentifier(route)
    const canAttach = !!route.routeConfig && !!this.storedRoutes[id]
    return canAttach
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const id = this.createIdentifier(route)
    if (!route.routeConfig || !this.storedRoutes[id]) return null
    return this.storedRoutes[id].handle
  }

  public shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {

    if (future.routeConfig === curr.routeConfig) {
      if (future.params.id) {
        return future.params.id === curr.params.id || future.data.reuseRoute
      }
      return true
    }

    return false
  }

  private createIdentifier(route: ActivatedRouteSnapshot) {
    // Build the complete path from the root to the input route
    const segments: UrlSegment[][] = route.pathFromRoot.map((r) => r.url)
    const subpaths = ([] as UrlSegment[])
      .concat(...segments)
      .map((segment) => segment.path)
    // Result: ${route_depth}-${path}
    return segments.length + '-' + subpaths.join('/')
  }
}
