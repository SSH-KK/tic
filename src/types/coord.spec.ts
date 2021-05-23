import { Coord } from './coord'

test('K4 == Coord.parse(K4).toString', () =>
  expect(Coord.parse('K4').toString()).toEqual('K4'))
