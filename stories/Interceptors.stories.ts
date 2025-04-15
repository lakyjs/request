import type { Meta, StoryObj } from '@storybook/html'
import { createDom } from './createDom'
import oxios from '../lib/index'


const meta = {
  title: 'Interceptors',
  argTypes: {
    type: {
      description: '拦截器类型',
      control: { type: 'select' },
      options: ['onion', 'normal'],
    }
  },
  args: {
    type: 'onion'
  },
  render: args => {
    const { resDom, dom } = createDom({
      desc: `Oxios ${args.type === 'onion' ? '洋葱' : '常规'}拦截器 demo`,
      btnText: 'send',
      onClick: () => {
        const resArr: string[] = [];
        const config = {
          baseURL: 'https://foo',
          adapter: 'xhr',
          responseType: 'json',
          headers:{
            'Content-Type': 'application/json'
          }
        } as any

        resDom.innerText = ''
        const onionInstance = oxios.create({ ...config })
        const normalInstance = oxios.create({ ...config })
        if (args.type === 'onion') {
          onionInstance.interceptors.use(async (_ctx, next) => {
            resArr.push('interceptor1 in')
            resDom.innerText = resArr.join('\n')
            await next()
            resArr.push('interceptor1 out')
            resDom.innerText = resArr.join('\n')
          })
          onionInstance.interceptors.use(async (_ctx, next) => {
            resArr.push('interceptor2 in')
            resDom.innerText = resArr.join('\n')
            await next()
            resArr.push('interceptor2 out')
            resDom.innerText = resArr.join('\n')
          })
          onionInstance.interceptors.use(async (_ctx, next) => {
            resArr.push('interceptor3 in')
            resDom.innerText = resArr.join('\n')
            await next()
            resArr.push('interceptor3 out')
            resDom.innerText = resArr.join('\n')
          })

          onionInstance.get('/get')
        } else {
          normalInstance.interceptors.request.use((config) => {
            resArr.push('requestInterceptor in')
            resDom.innerText = resArr.join('\n')
            return config
          }, (_err) => {
            resArr.push('requestErrorInterceptor in')
            resDom.innerText = resArr.join('\n')
          })
          normalInstance.interceptors.response.use(() => {
            resArr.push('responseInterceptor in')
            resDom.innerText = resArr.join('\n')
          }, (_err) => {
            resArr.push('responseErrorInterceptor in')
            resDom.innerText = resArr.join('\n')
          })
          normalInstance.get('/get')
        }
      }
    })
    return dom
  }
} satisfies Meta

export default meta

export const Onion: StoryObj = {
  args: {
    type: 'onion'
  }
}

export const Normal: StoryObj = {
  args: {
    type: 'normal'
  }
}

