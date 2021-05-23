import { createApi, createEvent, createStore } from 'effector'

import { endGame } from './end'
import { initGame } from './summary'

type GameState = {
  currentTurn: 'white' | 'black'
  currentTurnNumber: number
}

export const nextMove = createEvent()
export const setCurrentTurn = createEvent<'black' | 'white'>()

export const gameState = createStore<GameState | null>(
  JSON.parse(localStorage.getItem('gameState')),
)
  .on(endGame, () => null)
  .on(initGame, () => {
    const entry = JSON.parse(localStorage.getItem('gameState'))
    if (entry === null) {
      return {
        currentTurn: 'black',
        currentTurnNumber: 0,
      }
    } else {
      return entry
    }
  })
  .on(nextMove, state => ({
    currentTurn: state.currentTurn === 'black' ? 'white' : 'black',
    currentTurnNumber: state.currentTurnNumber + 1,
  }))
  .on(setCurrentTurn, (state, currentTurn) => {
    if (state.currentTurn !== currentTurn) {
      return {
        currentTurnNumber: state.currentTurnNumber + 1,
        currentTurn,
      }
    }
    return state
  })

gameState.watch(state =>
  localStorage.setItem('gameState', JSON.stringify(state)),
)

export const locking = createStore<boolean>(false)
export const lockingApi = createApi(locking, {
  lock: () => true,
  unlock: () => false,
})
