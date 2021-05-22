import { attach, createEffect, createEvent, forward } from 'effector'
import { get } from 'svelte/store'

import { BACKEND_URL } from '../../config'
import { auth } from '../auth'
import { notificationApi } from '../notification'

type GameStart = {
  gameId: number
  code: string | null
}

enum GameRequestType {
  withBot,
  withRandom,
  createClosed,
  joinClosed,
  joinCurrent,
}

export const createGameWithBot = createEvent()
export const createGameWithRandom = createEvent()
export const createClosedGame = createEvent()
export const joinCurrentGame = createEvent()
export const joinClosedGame = createEvent<string>()

export const gameRequestFx = createEffect(
  async ({ type, code }: { type: GameRequestType; code: string | null }) => {
    let url: URL
    switch (type) {
      case GameRequestType.withBot:
        url = new URL(`${BACKEND_URL}/game/create/bot`)
        break
      case GameRequestType.withRandom:
        url = new URL(`${BACKEND_URL}/game/create/random`)
        break
      case GameRequestType.createClosed:
        url = new URL(`${BACKEND_URL}/game/create/code`)
        break
      case GameRequestType.joinClosed:
        url = new URL(`${BACKEND_URL}/game/join/${code!}`)
        break
      case GameRequestType.joinCurrent:
        url = new URL(`${BACKEND_URL}/game/current`)
    }
    url.search = new URLSearchParams({ token: get(auth) }).toString()
    let resp: Response
    try {
      resp = await fetch(url.toString(), {
        method: type === GameRequestType.joinCurrent ? 'GET' : 'POST',
      })
    } catch (e) {
      throw new Error(e.toString())
    }
    if (resp.status === 404) {
      throw new Error('Game not found')
    }
    const json = await resp.json()
    if (type === GameRequestType.joinCurrent && json['gameId'] === null) {
      throw new Error('No current game')
    }
    if (type === GameRequestType.createClosed && json['code']) {
      notificationApi.pushInfo(`Created game with code ${json['code']}`)
    }
    return {
      gameId: json[type === GameRequestType.joinClosed ? 'id' : 'gameId'],
      code: json['code'] ?? null,
    } as GameStart
  },
)

forward({
  from: createGameWithBot,
  to: attach({
    effect: gameRequestFx,
    mapParams: () => ({ type: GameRequestType.withBot, code: null }),
  }),
})

forward({
  from: createGameWithRandom,
  to: attach({
    effect: gameRequestFx,
    mapParams: () => ({ type: GameRequestType.withRandom, code: null }),
  }),
})

forward({
  from: createClosedGame,
  to: attach({
    effect: gameRequestFx,
    mapParams: () => ({ type: GameRequestType.createClosed, code: null }),
  }),
})

forward({
  from: joinCurrentGame,
  to: attach({
    effect: gameRequestFx,
    mapParams: () => ({ type: GameRequestType.joinCurrent, code: null }),
  }),
})

forward({
  from: joinClosedGame,
  to: attach({
    effect: gameRequestFx,
    mapParams: (code: string) => ({ type: GameRequestType.joinClosed, code }),
  }),
})

gameRequestFx.failData.watch(e => notificationApi.pushError(e.message))
