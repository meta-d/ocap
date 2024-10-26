import { Injectable, signal } from "@angular/core";
import { IXpertAgentExecution } from "apps/cloud/src/app/@core";

@Injectable()
export class XpertExecutionService {
    readonly execution = signal<IXpertAgentExecution>(null)

    
}