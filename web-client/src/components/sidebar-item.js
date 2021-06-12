function SidebarItem({ text, onClick }) {
  return (
    <li class='sidebar-item'>
      <div class='sidebar-link' onClick={onClick}>
        <span># {text}</span>
      </div>
    </li>
  )
}

export default SidebarItem
