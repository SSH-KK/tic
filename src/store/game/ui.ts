import { createStore } from 'effector'

import type { Coord } from '../../types/coord'

import { initGame } from './summary'
import { endGame } from './end'
import { createApi } from 'effector'
import { forward } from 'effector'

export const selectedCoords = createStore<Set<string>>(new Set())

export const selectedApi = createApi(selectedCoords, {
  clear: () => new Set(),
  toogle: (state, coord: Coord) => {
    const key = coord.toString()
    if (state.has(key)) state.delete(key)
    else state.add(key)
    return new Set(state)
  },
})

forward({
  from: [initGame, endGame],
  to: selectedApi.clear,
})
