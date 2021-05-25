import { createApi, createStore, sample } from 'effector'

import { board, probabilityMapFx } from './board'

type Color = -1 | 0 | 1

type CalculateParam = {
  cells: Color[][]
  probabilityMap: number[][]
}

export const statusbar = createStore<number>(0.5)
const statusBarApi = createApi(statusbar, {
  calculate: (_, { cells, probabilityMap }: CalculateParam) => {
    let whiteSum = 0,
      blackSum = 0
    probabilityMap.forEach((row, ridx) =>
      row.forEach((val, cidx) => {
        if (val * cells[ridx][cidx] > 0.5) return
        if (val < 0) whiteSum -= val
        else blackSum += val
      }),
    )
    return whiteSum / (whiteSum + blackSum)
  },
})

sample({
  clock: probabilityMapFx.doneData,
  source: board,
  fn: (board, probabilityMap) => ({ cells: board.cells, probabilityMap }),
  target: statusBarApi.calculate,
})
