import { createApi, createStore } from 'effector'
import type { Coord } from '../../types/coord'

import { endGame } from './end'
import { initGame } from './summary'

export type Place = -1 | 0 | 1

export type Board = {
  cells: Place[][]
  lastPlace: Coord | null
}

type NewMove = {
  cells: Place[][]
  place: Coord
}

function _generateCells(size: number): Place[][] {
  return new Array(13).fill(0).map(() => new Array(13).fill(0))
}

export const board = createStore<Board | null>(null)
  .on(initGame, () => ({
    cells: _generateCells(13),
    lastPlace: null,
  }))
  .on(endGame, () => null)

export const boardApi = createApi(board, {
  setCells: (state, cells) => ({ ...state, cells }),
  newMove: (state, { cells, place }: NewMove) => ({
    ...state,
    cells,
    lastPlace: place,
  }),
})
