import { ScreenshotCreateHandler } from './screenshot-create.handler';
import { ScreenshotDeleteHandler } from './screenshot-delete.handler';
import { ScreenshotUpdateHandler } from './screenshot-update.handler';

export const CommandHandlers = [
    ScreenshotCreateHandler,
    ScreenshotUpdateHandler,
    ScreenshotDeleteHandler
];