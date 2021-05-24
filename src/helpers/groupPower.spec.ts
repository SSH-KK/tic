import { calculatePowers } from './groupPower'

test('calculate powers', () => {
  const board: (0 | -1 | 1)[][] = [
    [1, 1, -1],
    [0, -1, 0],
    [0, -1, -1],
  ]
  const powers = calculatePowers(board)
  expect(powers[0][0]).toEqual(1)
  expect(powers[0][1]).toEqual(1)
  expect(powers[0][2]).toEqual(1)
  expect(powers[1][0]).toEqual(0)
  expect(powers[1][1]).toEqual(3)
  expect(powers[1][2]).toEqual(0)
  expect(powers[2][0]).toEqual(0)
  expect(powers[2][1]).toEqual(3)
  expect(powers[2][2]).toEqual(3)
})
