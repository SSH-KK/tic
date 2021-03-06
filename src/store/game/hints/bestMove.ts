import { createEffect, createEvent } from 'effector'

import { Coord } from '../../../types/coord'

import { BACKEND_URL, CENTAUR_TOKEN } from '../../../config'

import type { LeelaHint } from '../board'

import type { HintParam } from './types'
import { registerHint } from './utils'

export const bestMove = createEvent()
export const bestMoveFx = createEffect(
  async ({ coords, token, gameId }: HintParam) => {
    const query = new URLSearchParams({
      token,
      game_id: gameId.toString(),
      centaur_token: CENTAUR_TOKEN,
    })
    if (coords.size === 0) {
      const url = new URL(`${BACKEND_URL}/hints/best-moves`)
      query.append('count', '1')
      url.search = query.toString()
      let resp: Response
      try {
        resp = await fetch(url.toString())
      } catch (e) {
        throw new Error(e.toString())
      }
      if (!resp.ok) {
        throw new Error(`Invalid status ${resp.status}`)
      }
      const json = await resp.json()
      if (json.hint.length === 0) {
        throw new Error('Invalid Leela answer')
      }
      const move = json.hint[0].move
      if (move === 'pass' || move === 'resign') {
        throw new Error(`You should ${move}...`)
      }
      return {
        coords: [Coord.parse(move)],
        type: 'single',
        heatmap: null,
        price: 3,
      } as LeelaHint
    } else {
      const url = new URL(`${BACKEND_URL}/hints/show-best`)
      query.append('moves', Array.from(coords).join(','))
      url.search = query.toString()
      let resp: Response
      try {
        resp = await fetch(url.toString())
      } catch (e) {
        throw new Error(e.toString())
      }
      if (!resp.ok) {
        throw new Error(`Invalid status ${resp.status}`)
      }
      const json = await resp.json()
      if (!json.hint) {
        throw new Error('Invalid Leela answer')
      }
      return {
        coords: [Coord.parse(json.hint)],
        type: 'single',
        heatmap: null,
        price: 2,
      } as LeelaHint
    }
  },
)

registerHint({
  clock: bestMove,
  target: bestMoveFx,
})
