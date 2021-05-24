import { createEffect, createEvent } from 'effector'

import { Coord } from '../../../types/coord'

import { BACKEND_URL, BOARD_SIZE, CENTAUR_TOKEN } from '../../../config'

import type { LeelaHint } from '../board'

import type { HintParam } from './types'
import { registerHint } from './utils'

export const bestQuarter = createEvent()
export const bestQuarterFx = createEffect(
  async ({ token, gameId }: HintParam) => {
    const query = new URLSearchParams({
      token,
      game_id: gameId.toString(),
      centaur_token: CENTAUR_TOKEN,
    })
    const url = new URL(`${BACKEND_URL}/hints/heatmap-best-move-zone`)
    query.append('is_quarter', 'true')
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
    const heatmap = new Array(BOARD_SIZE)
      .fill(0)
      .map(() => new Array(BOARD_SIZE).fill(0))
    let bx = 0,
      ex = BOARD_SIZE - 1
    let by = 0,
      ey = BOARD_SIZE - 1
    const boardSizeHalf = Math.floor(BOARD_SIZE / 2)
    switch (json.hint as number) {
      case 1:
        bx = boardSizeHalf
        ey = boardSizeHalf
        break
      case 2:
        ex = boardSizeHalf
        ey = boardSizeHalf
        break
      case 3:
        ex = boardSizeHalf
        by = boardSizeHalf
        break
      case 4:
        bx = boardSizeHalf
        by = boardSizeHalf
        break
      default:
        throw new Error(`Invalid quarter ${json.hint}`)
    }
    for (let x = bx; x <= ex; x++)
      for (let y = by; y <= ey; y++) heatmap[y][x] = 50
    return {
      coords: [],
      type: 'heatmap',
      heatmap,
      price: 1,
    } as LeelaHint
  },
)

registerHint({
  clock: bestQuarter,
  target: bestQuarterFx,
})
