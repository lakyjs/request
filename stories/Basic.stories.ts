import type { Meta, StoryObj } from '@storybook/html';
import type { Method } from '../lib/types';
import oxios from '../lib/index';
import { createDom } from './createDom';

interface OxiosConfig {
  method?: Method
  url?: string
  data?: unknown
  params?: Record<string, any>
  headers?: Record<string, any>
  responseType?: XMLHttpRequestResponseType
  timeout?: number
  baseURL?: string
  adapter?: 'xhr' | 'fetch'
}

const meta = {
  title: 'Basic',
  argTypes: {
    method: {
      description: '请求方法',
      control: { type: 'select' },
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    url: {
      description: '请求地址',
      control: { type: 'text' },
    },
    timeout: {
      description: '请求超时时间',
      control: { type: 'number' },
    },
    adapter: {
      description: '请求适配器',
      control: { type: 'select' },
      options: ['xhr', 'fetch'],
    },
    responseType: {
      description: '响应类型',
      control: { type: 'select' },
      options: ['json', 'text', 'arraybuffer', 'blob', 'document', 'stream'],
    },
    baseURL: {
      description: '请求基础地址',
      control: { type: 'text' },
    },
  },
  args: {
    method: 'GET',
    adapter: 'xhr',
    responseType: 'json',
    baseURL: 'https://foo'
  },
  render: args => {
    const { resDom, dom } = createDom({
      desc: `Oxios 请求方法 ${args.method} demo`,
      btnText: args.method ?? 'GET',
      onClick: () => {
        resDom.innerHTML = 'loading...';
        resDom.style.color = '#5b7daf';
        oxios(args).then(res => {
          resDom.innerHTML = JSON.stringify(res);
          resDom.style.color = 'green';
        }).catch(err => {
          resDom.innerHTML = JSON.stringify(err);
          resDom.style.color = 'red';
        })
      }

    })
    return dom
  },
} satisfies Meta<OxiosConfig>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const index: StoryObj<OxiosConfig> = {
  args: {
    method: 'GET',
    url: '/get'
  },
};
