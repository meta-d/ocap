import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview } from '@storybook/angular';
import docJson from './documentation.json';
setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    docs: {
      toc: true, // 👈 Enables the table of contents
    },
  },
};

export default preview;