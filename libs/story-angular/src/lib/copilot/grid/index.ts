import { CopilotCommand } from "@metad/copilot";
import { editGridWidgetCommand } from "./chat";

export const GridCommand = {
    name: 'grid',
    description: 'Edit grid attributes of widget',
    examples: [
      'add dimension "XXXX" to grid',
    ],
    processor: editGridWidgetCommand
} as CopilotCommand