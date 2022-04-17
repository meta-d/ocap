import { DSCoreService } from "@metad/ocap-core";
import React from "react";

export const AppContext = React.createContext<{coreService: DSCoreService}>({coreService: null})