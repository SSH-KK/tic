import { createApi, createStore } from 'effector'
import type { Coord } from '../../types/coord'

import { calculatePowers } from '../../helpers/groupPower'

import { endGame } from './end'
import { initGame } from './summary'

export type Place = -1 | 0 | 1

export type LeelaHint = {
  type: 'single' | 'heatmap' | 'sequence'
  heatmap: number[][] | null
  coords: Coord[]
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

function _generateCells(size: number): Place[][] {
  return new Array(13).fill(0).map(() => new Array(13).fill(0))
}

export const board = createStore<Board | null>(null)
  .on(initGame, () => ({
    cells: _generateCells(13),
    lastPlace: null,
    powers: _generateCells(13),
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
