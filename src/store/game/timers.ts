import dayjs from 'dayjs'
import { createApi, createEvent, createStore } from 'effector'

import { endGame } from './end'
import { initGame } from './summary'

type Timers = {
  whiteEnd: number
  blackEnd: number
  now: number
  currentTurn: 'white' | 'black'
}

type Timer = {
  leftTime: number
  isActive: boolean
}

const tick = createEvent()
createStore<number>(-1)
  .on(initGame, () => {
    return setInterval(tick, 1000)
  })
  .on(endGame, state => {
    if (state !== -1) clearInterval(state)
    return -1
  })

const timers = createStore<Timers | null>(null).on(endGame, () => null)

export const timersApi = createApi(timers, {
  set: (_, timers: Timers) => timers,
})

export const blackTimer = createStore<Timer | null>(null)
  .on(timers, (_, timersState) => {
    if (timersState === null) return null
    return {
      leftTime: dayjs(timersState.blackEnd).diff(dayjs(timersState.now)),
      isActive: timersState.currentTurn === 'black',
    }
  })
  .on(tick, state => {
    if (state.isActive) {
      return {
        leftTime: state.leftTime - 1000,
        isActive: true,
      }
    }
    return state
  })

export const whiteTimer = createStore<Timer | null>(null)
  .on(timers, (_, timersState) => {
    if (timersState === null) return null
    return {
      leftTime: dayjs(timersState.whiteEnd).diff(dayjs(timersState.now)),
      isActive: timersState.currentTurn === 'white',
    }
  })
  .on(tick, state => {
    if (state.isActive) {
      return {
        leftTime: state.leftTime - 1000,
        isActive: true,
      }
    }
    return state
  })
