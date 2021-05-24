import { createApi, createStore } from 'effector'
import type { Coord } from '../../types/coord'

import { calculatePowers } from '../../helpers/groupPower'

import { endGame } from './end'
import { initGame } from './summary'
import { BOARD_SIZE } from '../../config'

export type Place = -1 | 0 | 1

export type LeelaHint = {
  type: 'single' | 'heatmap' | 'sequence'
  heatmap: number[][] | null
  coords: Coord[]
  price: number
}

export type Board = {
  cells: Place[][]
  lastPlace: Coord | null
  powers: number[][]
  leelaHints: LeelaHint[]
}

type NewMove = {
  cells: Place[][]
  place: Coord
}

function _generateCells(): Place[][] {
  return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(0))
}

export const board = createStore<Board | null>(null)
  .on(initGame, () => ({
    cells: _generateCells(),
    lastPlace: null,
    powers: _generateCells(),
    leelaHints: [],
  }))
  .on(endGame, () => null)

export const boardApi = createApi(board, {
  setCells: (state, cells) => ({
    ...state,
    cells,
    powers: calculatePowers(cells),
  }),
  newMove: (state, { cells, place }: NewMove) => ({
    ...state,
    cells,
    lastPlace: place,
    powers: calculatePowers(cells),
  }),
  pushLeelaHint: (state, hint: LeelaHint) => ({
    ...state,
    leelaHints: [...state.leelaHints, hint],
  }),
  clearLeelaHints: state => ({ ...state, leelaHints: [] }),
})
