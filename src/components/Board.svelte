<script lang="ts">
  import { onMount } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import { alphabet, Coord } from '../types/coord'

  import { board, locking } from '../store/game'
  import { move } from '../store/game/action'
  import { notificationApi } from '../store/notification'
  import { selectedApi, selectedCoords } from '../store/game/ui'
  import { BOARD_SIZE } from '../config'

  const size = 1500
  const WHITE_COLOR = '#F0F0F0'
  const BLACK_COLOR = '#212529'
  const DANGER_COLOR = '#ff0000'
  const ACCENT_COLOR = '#20E7C1'
  const cellSize = size / (BOARD_SIZE + 1)

  const selected = derived(selectedCoords, state =>
    Array.from(state).map(coord => Coord.parse(coord)),
  )

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  const mousePos = writable<{ x: number; y: number }>({
    x: -1,
    y: -1,
  })

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
    Array(BOARD_SIZE)
      .fill(0)
      .forEach((_, ridx) => {
        Array(BOARD_SIZE)
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
    for (let i = 1; i <= BOARD_SIZE; i++) {
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
      Math.ceil(BOARD_SIZE / 2) * cellSize,
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
      Math.ceil(BOARD_SIZE / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(
      Math.ceil(BOARD_SIZE / 2) * cellSize,
      Math.ceil(BOARD_SIZE / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.arc(
      size - 4 * cellSize,
      Math.ceil(BOARD_SIZE / 2) * cellSize,
      cellSize / 8,
      0,
      2 * Math.PI,
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(4 * cellSize, size - 4 * cellSize, cellSize / 8, 0, 2 * Math.PI)
    ctx.arc(
      Math.ceil(BOARD_SIZE / 2) * cellSize,
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
          ctx.arc(x, y, cellSize / 2.1, 0, 2 * Math.PI)
          ctx.fill()
          ctx.beginPath()
          ctx.strokeStyle = col === 1 ? WHITE_COLOR : BLACK_COLOR
          ctx.arc(x, y, cellSize / 2.1, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (ridx === mpos.y && cidx === mpos.x) {
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.fillStyle = BLACK_COLOR
          ctx.arc(x, y, cellSize / 2.1, 0, 2 * Math.PI)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }),
    )

    if (state.lastPlace) {
      const x = (state.lastPlace.x + 1) * cellSize
      const y = (state.lastPlace.y + 1) * cellSize
      ctx.fillStyle = ACCENT_COLOR
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(x, y, cellSize / 4.5, 0, 2 * Math.PI)
      ctx.fill()
    }

    state.powers.forEach((row, ridx) =>
      row.forEach((col, cidx) => {
        if (col === 0) return
        if (col === 1) {
          const x = (cidx + 1) * cellSize
          const y = (ridx + 1) * cellSize
          ctx.fillStyle = DANGER_COLOR
          ctx.beginPath()
          ctx.moveTo(
            x - (Math.cos(Math.PI / 6) * cellSize) / 2.3,
            y + cellSize / 4,
          )
          ctx.lineTo(
            x + (Math.cos(Math.PI / 6) * cellSize) / 2.3,
            y + cellSize / 4,
          )
          ctx.lineTo(x, y - cellSize / 2.3)
          ctx.fill()
        }
      }),
    )

    state.leelaHints.forEach(hint => {
      switch (hint.type) {
        case 'single':
          const coord = hint.coords[0]
          const x = (coord.x + 1) * cellSize
          const y = (coord.y + 1) * cellSize
          ctx.strokeStyle = ACCENT_COLOR
          ctx.lineWidth = 6
          ctx.beginPath()
          ctx.arc(x, y, cellSize / 2.8, 0, 2 * Math.PI)
          ctx.stroke()
          break
        case 'heatmap':
          const k = Math.log(
            hint.heatmap.reduce((prev, row) => {
              const rowk = row.reduce(
                (prev, val) => (val > prev ? val : prev),
                0,
              )
              return rowk > prev ? rowk : prev
            }, 0),
          )
          hint.heatmap.forEach((row, ridx) =>
            row.forEach((val, cidx) => {
              if (val === 0) return
              val = Math.log(val) / k
              const x = (cidx + 1) * cellSize
              const y = (ridx + 1) * cellSize
              ctx.globalAlpha = 0.7
              const gradient = ctx.createRadialGradient(
                x,
                y,
                (cellSize / 4) * val,
                x,
                y,
                (cellSize / 2) * val,
              )
              gradient.addColorStop(1, '#20E7C1')
              gradient.addColorStop(0, '#9FE7DA')
              ctx.fillStyle = gradient
              ctx.beginPath()
              ctx.arc(x, y, (cellSize / 2) * val, 0, 2 * Math.PI)
              ctx.fill()
              ctx.globalAlpha = 1
            }),
          )
        default:
          break
      }
    })

    $selected.forEach(coord => {
      const x = (coord.x + 1) * cellSize
      const y = (coord.y + 1) * cellSize
      ctx.strokeStyle = ACCENT_COLOR
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, cellSize / 2.5, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, cellSize / 3, 0, 2 * Math.PI)
      ctx.stroke()
    })
  }

  mousePos.subscribe(draw)
  selected.subscribe(draw)

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
    if (!mpos) return
    const coord = new Coord(mpos.x, mpos.y)
    move(coord)
  }

  function contextmenuHandler(event: MouseEvent) {
    const mpos = event2xy(event)
    if (!mpos) return
    const coord = new Coord(mpos.x, mpos.y)
    selectedApi.toogle(coord)
  }
</script>

<canvas
  on:mousemove={mousemoveHandler}
  on:click={mouseclickHandler}
  on:contextmenu|preventDefault={contextmenuHandler}
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
