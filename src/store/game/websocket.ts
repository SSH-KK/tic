import { navigateTo } from 'svelte-router-spa'
import { get } from 'svelte/store'

import { WEBSOCKET_URL } from '../../config'
import type { User } from '../../types/user'

import { auth } from '../auth'
import { gameRequestFx } from './start'
import { setWaiting, gameStatus, GameStatus } from './status'
import { initGame } from './summary'
import { resign } from './action'
import { endGame } from './end'
import { self } from '../self'

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
  if (type === 'currentMap') {
    const self: User = { nickname: payload.you.nickname }
    const opponent: User = { nickname: payload.opponent.nickname }
    const selfColor = payload.player === 'w' ? 'white' : 'black'
    initGame({
      white: selfColor === 'white' ? self : opponent,
      blacK: selfColor === 'black' ? self : opponent,
      selfColor: selfColor,
      gameId,
    })
    return
  }
  if (type === 'endGame') {
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
  }
})
