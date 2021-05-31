import { asGroups } from './groups'

test('test asGroups works fine', () => {
  const board: (-1 | 0 | 1)[][] = [
    [1, 1, -1],
    [0, -1, 0],
    [0, -1, -1],
  ]
  const groups = asGroups(board)
  expect(groups.groups.length).toEqual(3)
  expect(groups.groups[0].stones.length).toEqual(2)
  expect(groups.groups[2].breathes.length).toEqual(1)
  expect(groups.groups[1].breathes.length).toEqual(3)
})
