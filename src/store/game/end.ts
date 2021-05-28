import { createEvent, restore } from 'effector'
import { navigateTo } from 'svelte-router-spa'
import type { User } from '../../types/user'

type EndGame = {
  finalScore: number
  loser: {
    user: User
    finalScore: number
    hintScore: number
    rpScore: number
  }
  winner: {
    user: User
    finalScore: number
    hintScore: number
    rpScore: number
  }
  winnerColor: 'white' | 'black'
}

export const endGame = createEvent<EndGame>()
export const endResult = restore(endGame, null)

endGame.watch(() => navigateTo('/end'))
