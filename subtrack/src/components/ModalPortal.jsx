import { createPortal } from 'react-dom'

// Render overlays outside sidebar/page stacking contexts and clipping containers.
export default function ModalPortal({ children }) {
  return createPortal(
    <div
      data-subtrack-modal-root=""
      style={{ display: 'contents' }}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}
