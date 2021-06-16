function SidebarItem({ text, onClick, onClickDelete }) {
  return (
    <li class='sidebar-item'>
      <div class='d-flex ml-4'>
        <div class='flex-grow-1'>
          <div class='sidebar-link' onClick={onClick}>
            <span># {text}</span>
          </div>
        </div>
        <div class='sidebar-link'>
          <span>
            <i class='bi bi-trash-fill' onClick={onClickDelete}></i>
          </span>
        </div>
      </div>
    </li>
  )
}

export default SidebarItem
