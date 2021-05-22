import { createEvent, createStore, forward } from 'effector'

import { endGame } from './end'
import { initGame } from './summary'

export enum GameStatus {
  notStarted,
  waiting,
  running,
  ended,
}

export const reset = createEvent()
export const setWaiting = createEvent()
export const setRunning = createEvent()
export const setEnded = createEvent()

export const gameStatus = createStore<GameStatus>(GameStatus.notStarted)
  .on(reset, () => GameStatus.notStarted)
  .on(setWaiting, () => GameStatus.waiting)
  .on(setRunning, () => GameStatus.running)
  .on(setEnded, () => GameStatus.ended)

forward({
  from: endGame,
  to: setEnded,
})

forward({
  from: initGame,
  to: setRunning,
})
