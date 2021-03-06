import { BOARD_SIZE } from '../config'

export const alphabet = 'abcdefghjklmnopqrst'.toUpperCase()

export class Coord {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  toString(): string {
    return `${alphabet[this.x]}${BOARD_SIZE - this.y}`
  }

  isEqual(other: Coord): boolean {
    return other.x === this.x && other.y === this.y
  }

  static parse(coord: string): Coord {
    const x = alphabet.indexOf(coord[0].toUpperCase())
    const y = parseInt(coord.slice(1))
    if (x === -1 || y === NaN) {
      throw new Error(`Invalid coord ${coord}`)
    }
    return new Coord(x, BOARD_SIZE - y)
  }
}
