// start game -> send request -> wait response -> ws connect -> wait opponent
// -> init board\gameSummary\gameState -> show page
import { get } from 'svelte/store'
import { attach, forward } from 'effector'

import './websocket'
import {
  createClosedGame,
  createGameWithBot,
  createGameWithRandom,
  joinClosedGame,
  joinCurrentGame,
} from './start'

import { gameStatus, GameStatus } from './status'
import { updateCurrentGameFx, currentGame } from './current'
import { auth } from '../auth'
import { board, Board } from './board'
import { gameSummary } from './summary'

import { gameState, locking } from './state'

export {
  createClosedGame,
  createGameWithBot,
  createGameWithRandom,
  joinClosedGame,
  joinCurrentGame,
}
export { gameStatus, GameStatus }

const attachedToken = attach({
  effect: updateCurrentGameFx,
  mapParams: () => ({ token: get(auth) }),
})

forward({
  from: [auth, gameStatus],
  to: attachedToken,
})

export { updateCurrentGameFx, currentGame }

attachedToken()

export { board }
export type { Board }

export { gameState, locking }

export { gameSummary }
