export function rotateAntiClockwise<T>(mat: T[][]): T[][] {
  const size = mat.length
  const result = new Array(size).fill(0).map(() => new Array(size))
  mat.forEach((row, y) =>
    row.forEach((elem, x) => {
      result[size - x - 1][y] = elem
    }),
  )
  return result
}
