import { useState } from 'react'

function SidebarItem({ text, onClick }) {
  const [isHovering, setIsHovering] = useState(false)
  const trashToggle = (e) => {
    setIsHovering(!isHovering)
  }
  return (
    <li class='sidebar-item'>
      <div class='d-flex ml-4'>
        <div class='flex-grow-1'>
          <div class='sidebar-link' onClick={onClick} onMouseOver={trashToggle} onMouseLeave={trashToggle}>
            <span># {text}</span>
          </div>
        </div>
        {isHovering && (
          <div class='sidebar-item'>
            <span>
              <i class='bi bi-trash-fill sb-trash'></i>
            </span>
          </div>
        )}
      </div>
    </li>
  )
}

export default SidebarItem
