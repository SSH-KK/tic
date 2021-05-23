import { get } from 'svelte/store'
import { createEvent, createStore } from 'effector'

import type { Coord } from '../../types/coord'

import { endGame } from './end'
import { initGame } from './summary'

export type Place = -1 | 0 | 1

export type Board = {
  cells: Place[][]
}

function _generateCells(size: number): Place[][] {
  return new Array(13).fill(0).map(() => new Array(13).fill(0))
}

export const setCells = createEvent<Place[][]>()

export const board = createStore<Board | null>(null)
  .on(initGame, () => ({
    cells: _generateCells(13),
  }))
  .on(endGame, () => null)
  .on(setCells, (state, cells) => ({ ...state, cells }))
