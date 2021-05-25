import deadstones from 'deadstones'

deadstones.useFetch('deadstones_bg.wasm')

type Color = -1 | 0 | 1

export async function getProbabilityMap(
  board: Color[][],
  iterations = 100,
): Promise<number[][]> {
  return (await deadstones.getProbabilityMap(board, iterations)) as number[][]
}
