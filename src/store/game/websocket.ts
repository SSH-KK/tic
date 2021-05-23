import { navigateTo } from 'svelte-router-spa'
import { get } from 'svelte/store'

import { WEBSOCKET_URL } from '../../config'
import type { User } from '../../types/user'

import { Place, setCells } from './board'
import { auth } from '../auth'
import { gameRequestFx } from './start'
import { setWaiting, gameStatus, GameStatus } from './status'
import { gameSummary, initGame } from './summary'
import { move, pass, resign } from './action'
import { endGame } from './end'
import { self } from '../self'
import { rotateAntiClockwise } from '../../utils/matrix'
import { lockingApi } from './state'

const ws = new WebSocket(WEBSOCKET_URL)

let token: string
let gameId: number | null = null
auth.watch(val => (token = val))

function wsSend(m: any, code: number = 7) {
  ws.send(JSON.stringify([code, 'go/game', m]))
}

ws.addEventListener('open', () => {
  ws.send(JSON.stringify([5, 'go/game']))
})

gameRequestFx.doneData.watch(({ gameId: pgameId }) => {
  wsSend({
    command: 'auth',
    token: token,
    game_id: pgameId,
  })
  gameId = pgameId
  navigateTo('/game')
  setWaiting()
})

resign.watch(() => {
  wsSend({
    command: 'resign',
    token: token,
    game_id: gameId,
  })
})

pass.watch(() => {
  wsSend({
    command: 'pass',
    token: token,
    game_id: gameId,
  })
})

move.watch(coord => {
  wsSend({
    command: 'move',
    token: token,
    place: coord.toString().toLowerCase(),
    game_id: gameId,
  })
  lockingApi.lock()
})

ws.addEventListener('message', event => {
  const data = JSON.parse(event.data)
  if (data.error) {
  }
  if (!data.payload) return
  const payload = data.payload
  type MessageType = 'currentMap' | 'newTurn' | 'userConnected' | 'endGame'
  const type: MessageType = payload.type
  if (type === 'userConnected' && get(gameStatus) === GameStatus.waiting) {
    if (payload.player.nickname !== get(self).nickname) {
      wsSend({
        command: 'auth',
        token: token,
        game_id: gameId,
      })
    }
  }
  if (type === 'currentMap' && payload.opponent.position === '0') return
  else if (type === 'currentMap' && get(gameStatus) !== GameStatus.running) {
    const self: User = { nickname: payload.you.nickname }
    const opponent: User = { nickname: payload.opponent.nickname }
    const selfColor = payload.player === 'w' ? 'white' : 'black'
    initGame({
      white: selfColor === 'white' ? self : opponent,
      black: selfColor === 'black' ? self : opponent,
      selfColor: selfColor,
      gameId,
    })
    const currentMap = payload.currentMap as Place[][]
    setCells(rotateAntiClockwise(currentMap))
    console.log(payload)
    if (payload.turn[0] !== payload.player) {
      lockingApi.lock()
    }
  } else if (type === 'newTurn') {
    const currentMap = payload.currentMap as Place[][]
    setCells(rotateAntiClockwise(currentMap))
    if (get(gameSummary).selfColor === payload.turn) {
      lockingApi.unlock()
    }
  } else if (type === 'endGame') {
    endGame({
      finalScore: payload.finalScore,
      loser: {
        user: { nickname: payload.loserPlayer.nickname },
        finalScore: payload.loserPlayer.finalScore,
        hintScore: payload.loserPlayer.hintScore,
        rpScore: payload.loserPlayer.rpScore,
      },
      winner: {
        user: { nickname: payload.winnerPlayer.nickname },
        finalScore: payload.winnerPlayer.finalScore,
        hintScore: payload.winnerPlayer.hintScore,
        rpScore: payload.winnerPlayer.rpScore,
      },
      winnerColor: payload.winner === 'w' ? 'white' : 'black',
    })
    gameId = null
  }
})
