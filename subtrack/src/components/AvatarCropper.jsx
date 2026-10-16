import ModalPortal from './ModalPortal'
import { useEffect, useRef, useState } from 'react'
import LoadingWave from './LoadingWave'
import styles from './AvatarCropper.module.css'

const clamp = (value) => Math.max(-1, Math.min(1, value))
const cropRect = (image, zoom, position) => {
  const size = Math.min(image.naturalWidth, image.naturalHeight) / zoom
  return {
    size,
    x: (image.naturalWidth - size) * (position.x + 1) / 2,
    y: (image.naturalHeight - size) * (position.y + 1) / 2,
  }
}
const drawCrop = (canvas, image, zoom, position) => {
  const { x, y, size } = cropRect(image, zoom, position)
  const context = canvas.getContext('2d')
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, x, y, size, size, 0, 0, canvas.width, canvas.height)
}

export default function AvatarCropper({ file, onSave, onCancel }) {
  const [image, setImage] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef(null)
  const modalRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    modalRef.current?.focus()
    const url = URL.createObjectURL(file)
    const photo = new Image()
    let alive = true
    photo.onload = () => { if (alive) setImage(photo) }
    photo.onerror = () => { if (alive) setError('This photo could not be opened. Try another JPG, PNG, or WebP image.') }
    photo.src = url
    return () => {
      alive = false
      URL.revokeObjectURL(url)
      previousFocus?.focus()
    }
  }, [file])

  useEffect(() => {
    if (image && canvasRef.current) drawCrop(canvasRef.current, image, zoom, position)
  }, [image, zoom, position])

  const movePhoto = (e) => {
    const drag = dragRef.current
    if (!drag || saving) return
    const size = cropRect(image, zoom, position).size
    const width = e.currentTarget.getBoundingClientRect().width
    const maxX = (image.naturalWidth - size) / 2
    const maxY = (image.naturalHeight - size) / 2
    setPosition({
      x: maxX ? clamp(drag.x - (e.clientX - drag.clientX) * size / width / maxX) : 0,
      y: maxY ? clamp(drag.y - (e.clientY - drag.clientY) * size / width / maxY) : 0,
    })
  }

  const save = async () => {
    if (!image || saving) return
    setSaving(true)
    setError('')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      drawCrop(canvas, image, zoom, position)
      await onSave(canvas.toDataURL('image/jpeg', 0.85))
    } catch {
      setError('Your photo could not be saved. Please check browser storage and try again.')
      setSaving(false)
    }
  }

  const handleKeys = (e) => {
    e.stopPropagation()
    if (e.key === 'Escape') { e.preventDefault(); if (!saving) onCancel() }
    if (e.key !== 'Tab') return
    const controls = [...modalRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), canvas[tabindex]')]
    const first = controls[0], last = controls[controls.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) {
      e.preventDefault(); last?.focus()
    } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) {
      e.preventDefault(); first?.focus()
    }
  }

  return (
    <ModalPortal>
      <div className={styles.overlay} onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget && !saving) onCancel() }}>
        <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title" aria-describedby="avatar-crop-hint" tabIndex={-1} onKeyDown={handleKeys}>
          <h2 id="avatar-crop-title" className={styles.title}>Crop your photo</h2>
          <p id="avatar-crop-hint" className={styles.hint}>Drag to reposition, or focus the photo and use arrow keys. Zoom to adjust the crop.</p>
          {!image && !error && <LoadingWave label="Opening your photo…" />}
          {image && <>
            <div className={styles.cropArea}>
              <canvas ref={canvasRef} width={280} height={280} tabIndex={saving ? -1 : 0} aria-label="Photo crop preview" aria-disabled={saving}
                onPointerDown={e => {
                  if (saving || e.button !== 0) return
                  e.currentTarget.focus()
                  e.currentTarget.setPointerCapture(e.pointerId)
                  dragRef.current = { clientX: e.clientX, clientY: e.clientY, ...position }
                }}
                onPointerMove={movePhoto}
                onPointerUp={() => { dragRef.current = null }}
                onPointerCancel={() => { dragRef.current = null }}
                onLostPointerCapture={() => { dragRef.current = null }}
                onKeyDown={e => {
                  if (saving || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
                  e.preventDefault()
                  const axis = ['ArrowLeft', 'ArrowRight'].includes(e.key) ? 'x' : 'y'
                  const delta = ['ArrowLeft', 'ArrowUp'].includes(e.key) ? 0.08 : -0.08
                  setPosition(p => ({ ...p, [axis]: clamp(p[axis] + delta) }))
                }} />
              <div className={styles.cropMask} aria-hidden="true" />
            </div>
            <label className={styles.zoomLabel} htmlFor="avatar-zoom">Zoom <span>{Math.round(zoom * 100)}%</span></label>
            <input id="avatar-zoom" className={styles.slider} type="range" min="1" max="3" step="0.01" value={zoom} disabled={saving} onChange={e => setZoom(Number(e.target.value))} />
          </>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} disabled={saving} onClick={onCancel}>Cancel</button>
            <button className={styles.saveBtn} disabled={!image || saving} onClick={save}>{saving ? <LoadingWave compact label="Saving photo…" /> : 'Save photo'}</button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
