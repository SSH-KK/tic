import { createApi, createStore } from 'effector'

export type Notification = {
  text: string
  type: 'success' | 'info' | 'danger'
}

export const notifications = createStore<Notification[]>([])

export const notificationApi = createApi(notifications, {
  clear: () => [],
  pushSuccess: (val: Notification[], text: string) => [
    ...val,
    { text, type: 'success' },
  ],
  pushInfo: (val: Notification[], text: string) => [
    ...val,
    { text, type: 'info' },
  ],
  pushError: (val: Notification[], text: string) => [
    ...val,
    { text, type: 'danger' },
  ],
  remove: (val: Notification[], pos: number) => [
    ...val.slice(0, pos),
    ...val.slice(pos + 1),
  ],
})
