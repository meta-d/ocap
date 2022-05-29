import { Agent, DSCoreService } from '@metad/ocap-core'
import React, { useContext } from 'react'

export const OCAPCoreContext = React.createContext<{ coreService: DSCoreService; wasmDBAgent?: Agent }>({
  coreService: null,
  wasmDBAgent: null
})

export function OCAPCoreProvider({children, agents, dataSources, factories, wasmDBAgent}) {
  return <OCAPCoreContext.Provider value={{coreService: new DSCoreService(agents, dataSources, factories)}}>
    {children}
  </OCAPCoreContext.Provider>
}

export function useOCAPCoreContext() {
  return useContext(OCAPCoreContext)
}
