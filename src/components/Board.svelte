<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import { alphabet, Coord } from '../types/coord'

  import { board, locking, gameSummary } from '../store/game'
  import { move } from '../store/game/action'
  import { notificationApi } from '../store/notification'
  import { selectedApi, selectedCoords } from '../store/game/ui'
  import { BOARD_SIZE } from '../config'
  import { checkAkami } from '../helpers/checkAkami'

  const size = 1500
  const WHITE_COLOR = '#F0F0F0'
  const BLACK_COLOR = '#212529'
  const DANGER_COLOR = '#ff0000'
  const ACCENT_COLOR = '#20E7C1'
  const cellSize = size / (BOARD_SIZE + 1)

  const selected = derived(selectedCoords, state =>
    Array.from(state).map(coord => Coord.parse(coord)),
  )
  const selfColor = derived(gameSummary, summary => summary.selfColor)

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  const mousePos = writable<{ x: number; y: number }>({
    x: -1,
    y: -1,
  })
  let subscriptions: (() => void)[] = []

  onMount(() => {
    ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    subscriptions = [
      board.watch(draw),

      mousePos.subscribe(draw),
      selected.subscribe(draw),
    ]

    notificationApi.clear()
  })

  onDestroy(() => subscriptions.forEach(fn => fn()))

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
    const groups = state.groups

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
          if (ridx === mpos.y && cidx === mpos.x) {
            const group = groups.groups[groups.board[ridx][cidx]]
            group.breathes.forEach(coord => {
              const x = (coord.x + 1) * cellSize
              const y = (coord.y + 1) * cellSize
              ctx.globalAlpha = 0.1
              ctx.beginPath()
              ctx.fillStyle = WHITE_COLOR
              ctx.arc(x, y, cellSize / 2.1, 0, 2 * Math.PI)
              ctx.fill()
              ctx.globalAlpha = 1
            })
          }
        } else if (ridx === mpos.y && cidx === mpos.x && !$locking) {
          if ($selfColor === 'white') {
            ctx.globalAlpha = 0.3
            ctx.fillStyle = WHITE_COLOR
          } else {
            ctx.globalAlpha = 0.7
            ctx.fillStyle = BLACK_COLOR
          }
          ctx.beginPath()
          ctx.arc(x, y, cellSize / 2.1, 0, 2 * Math.PI)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }),
    )

    if (state.showProbabilityMap) {
      ctx.globalAlpha = 0.7
      state.probabilityMap.forEach((row, ridx) =>
        row.forEach((val, cidx) => {
          if (val === 0 || state.cells[ridx][cidx] !== 0) return
          val *= 0.8
          const x = (cidx + 1) * cellSize
          const y = (ridx + 1) * cellSize
          ctx.fillStyle = val < 0 ? WHITE_COLOR : BLACK_COLOR
          ctx.strokeStyle = val > 0 ? WHITE_COLOR : BLACK_COLOR
          ctx.fillRect(
            x - (Math.abs(val) * cellSize) / 2,
            y - (Math.abs(val) * cellSize) / 2,
            Math.abs(val) * cellSize,
            Math.abs(val) * cellSize,
          )
          ctx.strokeRect(
            x - (Math.abs(val) * cellSize) / 2,
            y - (Math.abs(val) * cellSize) / 2,
            Math.abs(val) * cellSize,
            Math.abs(val) * cellSize,
          )
        }),
      )
      ctx.globalAlpha = 1
    }

    if (state.lastPlace) {
      const x = (state.lastPlace.x + 1) * cellSize
      const y = (state.lastPlace.y + 1) * cellSize
      ctx.fillStyle = ACCENT_COLOR
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.arc(x, y, cellSize / 4.5, 0, 2 * Math.PI)
      ctx.fill()
    }

    state.cells.forEach((row, ridx) =>
      row.forEach((col, cidx) => {
        if (col === 0) return
        const breathCount =
          groups.groups[groups.board[ridx][cidx]].breathes.length
        if (breathCount === 1) {
          const x = (cidx + 1) * cellSize
          const y = (ridx + 1) * cellSize
          ctx.fillStyle = DANGER_COLOR
          ctx.beginPath()
          ctx.moveTo(
            x - (Math.cos(Math.PI / 6) * cellSize) / 4.6,
            y + cellSize / 8,
          )
          ctx.lineTo(
            x + (Math.cos(Math.PI / 6) * cellSize) / 4.6,
            y + cellSize / 8,
          )
          ctx.lineTo(x, y - cellSize / 4.6)
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

  function mousemoveHandler(event: MouseEvent) {
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
    const isDanger = checkAkami($board.cells, coord, $selfColor)
    const isSelected = $selected.some(val => val.isEqual(coord))
    if (isDanger && !isSelected) {
      notificationApi.pushError('This move in akami. Are you sure?')
      selectedApi.toggle(coord)
      return
    } else if (isDanger && isSelected) {
      selectedApi.toggle(coord)
    }
    move(coord)
  }

  function contextmenuHandler(event: MouseEvent) {
    const mpos = event2xy(event)
    if (!mpos) return
    const coord = new Coord(mpos.x, mpos.y)
    selectedApi.toggle(coord)
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
