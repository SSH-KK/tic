import { createEffect, createEvent } from 'effector'

import { Coord } from '../../../types/coord'

import { BACKEND_URL, BOARD_SIZE, CENTAUR_TOKEN } from '../../../config'

import { rotateAntiClockwise } from '../../../utils/matrix'

import type { LeelaHint } from '../board'

import type { HintParam } from './types'
import { registerHint } from './utils'

const boardSizeHalf = Math.floor(BOARD_SIZE / 2)

export const heatmap = createEvent()
export const heatmapFx = createEffect(
  async ({ coords, token, gameId }: HintParam) => {
    const query = new URLSearchParams({
      token,
      game_id: gameId.toString(),
      centaur_token: CENTAUR_TOKEN,
    })
    let quarters: Set<number> = new Set()
    for (let coord of coords) {
      const c = Coord.parse(coord)
      let quarter = 0
      if (c.x < boardSizeHalf && c.y < boardSizeHalf) quarter = 2
      else if (c.x > boardSizeHalf && c.y < boardSizeHalf) quarter = 1
      else if (c.x < boardSizeHalf && c.y > boardSizeHalf) quarter = 3
      else if (c.x > boardSizeHalf && c.y > boardSizeHalf) quarter = 4
      if (quarter !== 0) quarters.add(quarter)
    }
    let url: URL
    switch (quarters.size) {
      case 1:
        url = new URL(`${BACKEND_URL}/hints/heatmap-quarter`)
        query.append('quarter', Array.from(quarters)[0].toString())
        break
      case 2:
        url = new URL(`${BACKEND_URL}/hints/heatmap-two-quarters`)
        query.append('quarters', Array.from(quarters).join(','))
        break
      default:
        url = new URL(`${BACKEND_URL}/hints/heatmap-full`)
        break
    }
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
    return {
      coords: [],
      type: 'heatmap',
      heatmap: rotateAntiClockwise(json.hint),
      price: 1 <= quarters.size && quarters.size <= 2 ? 1 : 2,
    } as LeelaHint
  },
)

registerHint({
  clock: heatmap,
  target: heatmapFx,
})
