import { createApi, createEffect, createStore } from 'effector'
import type { Coord } from '../../types/coord'

import { calculatePowers } from '../../helpers/groupPower'
import { getProbabilityMap } from '../../helpers/deadstones'

import { endGame } from './end'
import { initGame } from './summary'
import { BOARD_SIZE } from '../../config'
import { move } from './action'

export type Color = -1 | 0 | 1

export type LeelaHint = {
  type: 'single' | 'heatmap'
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
  showProbabilityMap: boolean
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
    future: null,
    showProbabilityMap: true,
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
    let leelaHints = state.leelaHints
    const lastHint = leelaHints.slice(-1)[0]
    if (lastHint && lastHint.type === 'single') {
      const hint = lastHint.coords[0]
      if (hint.x === place.x && hint.y === place.y) {
        leelaHints = leelaHints.slice(0, -1)
      }
    }
    return {
      ...state,
      cells,
      leelaHints,
      lastPlace: place,
      powers: calculatePowers(cells),
    }
  },
  pushLeelaHint: (state, hint: LeelaHint) => ({
    ...state,
    leelaHints: [...state.leelaHints, hint],
  }),
  clearLeelaHints: state => ({ ...state, leelaHints: [] }),
  toggleShowProbabilityMap: state => ({
    ...state,
    showProbabilityMap: !state.showProbabilityMap,
  }),
  makeMove: (_, coord: Coord) => {
    move(coord)
  },
  useHint: state => {
    const lastHint = state.leelaHints.slice(-1)[0]
    if (lastHint && lastHint.type === 'single') {
      const hint = lastHint.coords[0]
      boardApi.makeMove(hint)
    }
  },
})
