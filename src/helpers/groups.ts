import { Coord } from '../types/coord'

type Color = 0 | -1 | 1

export type Group = {
  breathes: Coord[]
  stones: Coord[]
}

export type Groups = {
  board: number[][]
  groups: Group[]
}

function dfs(
  coord: Coord,
  board: Color[][],
  mask: Set<string>,
  stones: Coord[],
  color: Color,
) {
  if (board[coord.y][coord.x] !== color) return
  const key = coord.toString()
  if (mask.has(key)) return
  mask.add(key)
  if (color !== 0) stones.push(coord)
  const x = coord.x
  const y = coord.y
  if (x > 0) {
    dfs(new Coord(x - 1, y), board, mask, stones, color)
  }
  if (x < board.length - 1) {
    dfs(new Coord(x + 1, y), board, mask, stones, color)
  }
  if (y > 0) {
    dfs(new Coord(x, y - 1), board, mask, stones, color)
  }
  if (y < board.length - 1) {
    dfs(new Coord(x, y + 1), board, mask, stones, color)
  }
}

function findBreathes(stones: Coord[], board: Color[][]): Coord[] {
  const size = board.length
  const mask = new Set<string>()
  for (const coord of stones) {
    const x = coord.x
    const y = coord.y
    if (x > 0 && board[y][x - 1] === 0) mask.add(new Coord(x - 1, y).toString())
    if (x < size - 1 && board[y][x + 1] === 0)
      mask.add(new Coord(x + 1, y).toString())
    if (y > 0 && board[y - 1][x] === 0) mask.add(new Coord(x, y - 1).toString())
    if (y < size - 1 && board[y + 1][x] === 0)
      mask.add(new Coord(x, y + 1).toString())
  }
  return Array.from(mask).map(Coord.parse)
}

export function asGroups(board: Color[][]): Groups {
  const size = board.length
  const groups: Group[] = []
  const mask = new Set<string>()
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const coord = new Coord(x, y)
      const stones: Coord[] = []
      dfs(coord, board, mask, stones, board[y][x])
      if (stones.length) {
        groups.push({
          stones,
          breathes: findBreathes(stones, board),
        })
      }
    }
  }
  const groupsBoard = new Array(size).fill(0).map(_ => new Array(size).fill(0))
  groups.forEach((group, idx) =>
    group.stones.forEach(coord => (groupsBoard[coord.y][coord.x] = idx)),
  )
  return {
    board: groupsBoard,
    groups,
  }
}
