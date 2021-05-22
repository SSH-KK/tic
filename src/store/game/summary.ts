import { createEvent, createStore } from 'effector'
import type { User } from '../../types/user'
import { endGame } from './end'

type GameSummary = {
  white: User
  blacK: User
  selfColor: 'black' | 'white'
  gameId: number
}

export const initGame = createEvent<GameSummary>()

export const gameSummary = createStore<GameSummary | null>(null)
  .on(endGame, () => null)
  .on(initGame, (_, summary) => summary)
