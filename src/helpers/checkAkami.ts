import type { Coord } from '../types/coord'

import { asGroups } from './groups'

type Color = -1 | 0 | 1

export function checkAkami(
  board: Color[][],
  move: Coord,
  color: 'white' | 'black',
): boolean {
  board = board.map(row => row.map(val => val)) // copy array
  board[move.y][move.x] = color === 'black' ? 1 : -1
  const groups = asGroups(board)
  return groups.groups[groups.board[move.y][move.x]].breathes.length <= 1
}
