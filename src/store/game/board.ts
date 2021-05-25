import { createApi, createEffect, createStore, forward } from 'effector'
import type { Coord } from '../../types/coord'

import { calculatePowers } from '../../helpers/groupPower'
import { getProbabilityMap } from '../../helpers/deadstones'

import { endGame } from './end'
import { initGame } from './summary'
import { BOARD_SIZE } from '../../config'

export type Color = -1 | 0 | 1

export type LeelaHint = {
  type: 'single' | 'heatmap' | 'sequence'
  heatmap: number[][] | null
  coords: Coord[]
  price: number
}

export type Board = {
  cells: Color[][]
  lastPlace: Coord | null
  powers: number[][]
  leelaHints: LeelaHint[]
  probabilityMap: number[][]
}

type NewMove = {
  cells: Color[][]
  place: Coord
}

function _generateCells(): Color[][] {
  return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(0))
}

export const probabilityMapFx = createEffect(
  async (board: Color[][]) => await getProbabilityMap(board),
)

export const board = createStore<Board | null>(null)
  .on(initGame, () => ({
    cells: _generateCells(),
    lastPlace: null,
    powers: _generateCells(),
    leelaHints: [],
    probabilityMap: _generateCells(),
  }))
  .on(endGame, () => null)
  .on(probabilityMapFx.doneData, (state, probabilityMap) => ({
    ...state,
    probabilityMap: probabilityMap.map((row, ridx) =>
      row.map((val, cidx) => {
        if (val * state.cells[ridx][cidx] > 0.5) return 0
        else return val
      }),
    ),
  }))

export const boardApi = createApi(board, {
  setCells: (state, cells) => {
    probabilityMapFx(cells)
    return {
      ...state,
      cells,
      powers: calculatePowers(cells),
    }
  },
  newMove: (state, { cells, place }: NewMove) => {
    probabilityMapFx(cells)
    return {
      ...state,
      cells,
      lastPlace: place,
      powers: calculatePowers(cells),
    }
  },
  pushLeelaHint: (state, hint: LeelaHint) => ({
    ...state,
    leelaHints: [...state.leelaHints, hint],
  }),
  clearLeelaHints: state => ({ ...state, leelaHints: [] }),
})
