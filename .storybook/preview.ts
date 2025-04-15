import type { Preview } from '@storybook/html';

import { handlers } from './handlers';
import { setupWorker } from 'msw/browser';

import './style.css';

const worker = setupWorker(...handlers);
worker.start();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
