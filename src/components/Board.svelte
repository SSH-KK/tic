<script lang="ts">
  import { onMount } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import { alphabet, Coord } from '../types/coord'

  import { board, locking } from '../store/game'
  import { move } from '../store/game/action'
  import { notificationApi } from '../store/notification'

  const size = 1500
  const WHITE_COLOR = '#F0F0F0'
  const BLACK_COLOR = '#212529'
  const boardSize = 13
  const cellSize = size / (boardSize + 1)

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  const mousePos = writable<{ x: number; y: number }>({
    x: -1,
    y: -1,
  })

  locking.subscribe(console.log)

  onMount(() => {
    ctx = canvas.getContext('2d')
    board.watch(draw)
    notificationApi.clear()
  })

  function event2xy(event: MouseEvent): { x: number; y: number } | null {
    const rect = canvas.getBoundingClientRect()
    const dx = (event.clientX - rect.left) * (1500 / rect.width)
    const dy = (event.clientY - rect.top) * (1500 / rect.height)
    let mpos: [number, number]
    Array(13)
      .fill(0)
      .forEach((_, ridx) => {
        Array(13)
          .fill(0)
          .forEach((_, cidx) => {
            if (
              dx > (0.5 + cidx) * cellSize &&
              dx < (1.5 + cidx) * cellSize &&
              dy > (0.5 + ridx) * cellSize &&
              dy < (1.5 + ridx) * cellSize
            ) {
              mpos = [ridx, cidx]
            }
          })
      })
    if (mpos) {
      return {
        x: mpos[1],
        y: mpos[0],
      }
    } else return null
  }

  function drawTemplate() {
    ctx.fillStyle = '#212529'
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = '#F0F0F0'
    ctx.lineWidth = 1
    ctx.font = `${Math.round(cellSize / 1.8)}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.beginPath()
    for (let i = 1; i <= boardSize; i++) {
      ctx.moveTo(i * cellSize, cellSize)
      ctx.lineTo(i * cellSize, size - cellSize)
      ctx.moveTo(cellSize, i * cellSize)
      ctx.lineTo(size - cellSize, i * cellSize)
      ctx.fillStyle = '#F0F0F0'
      ctx.fillText(`${14 - i}`, 0.5 * cellSize, i * cellSize)
      ctx.fillText(`${14 - i}`, size - 0.5 * cellSize, i * cellSize)
      ctx.fillText(alphabet[i - 1], i * cellSize, 0.5 * cellSize)
      ctx.fillText(alphabet[i - 1], i * cellSize, size - 0.5 * cellSize)
    }
    ctx.stroke()

    ctx.fillStyle = '#F0F0F0'
    ctx.beginPath()
    ctx.arc(4 * cellSize, 4 * cellSize, cellSize / 8, 0, 2 * Math.PI)
    ctx.arc(
      Math.ceil(boardSize / 2) * cellSize,
      4 * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(size - 4 * cellSize, 4 * cellSize, cellSize / 8, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
      4 * cellSize,
      Math.ceil(boardSize / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(
      Math.ceil(boardSize / 2) * cellSize,
      Math.ceil(boardSize / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(
      size - 4 * cellSize,
      Math.ceil(boardSize / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(4 * cellSize, size - 4 * cellSize, cellSize / 8, 0, 2 * Math.PI)
    ctx.arc(
      Math.ceil(boardSize / 2) * cellSize,
      size - 4 * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(
      size - 4 * cellSize,
      size - 4 * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.fill()
  }

  function draw() {
    if (!ctx) return
    drawTemplate()
    const state = $board
    const mpos = $mousePos
    if (state === null) return
    state.cells.forEach((row, ridx) =>
      row.forEach((col, cidx) => {
        const x = (cidx + 1) * cellSize
        const y = (ridx + 1) * cellSize
        if (col !== 0) {
          ctx.beginPath()
          ctx.fillStyle = col === -1 ? WHITE_COLOR : BLACK_COLOR
          ctx.arc(x, y, cellSize / 2, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.strokeStyle = col === 1 ? WHITE_COLOR : BLACK_COLOR
          ctx.arc(x, y, cellSize / 2, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (ridx === mpos.y && cidx === mpos.x) {
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.fillStyle = BLACK_COLOR
          ctx.arc(x, y, cellSize / 2, 0, 2 * Math.PI)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }),
    )
  }

  mousePos.subscribe(draw)

  function mousemoveHandler(event: MouseEvent) {
    if ($locking) {
      if ($mousePos.x !== -1) mousePos.set({ x: -1, y: -1 })
      return
    }
    const mpos = event2xy(event)
    if (mpos) {
      if (mpos.x !== $mousePos.x || mpos.y !== $mousePos.y) mousePos.set(mpos)
    }
  }

  function mouseclickHandler(event: MouseEvent) {
    if ($locking) return
    const mpos = event2xy(event)
    if (mpos) {
      move(new Coord(mpos.x, mpos.y))
    }
  }
</script>

<canvas
  on:mousemove={mousemoveHandler}
  on:click={mouseclickHandler}
  bind:this={canvas}
  width={size}
  height={size}
/>

<style>
  canvas {
    box-sizing: border-box;
    padding: 1rem;
    width: min(90vh, 100vw);
    height: min(90vh, 100vw);
  }
</style>
