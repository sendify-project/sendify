function SidebarItem({ text }) {
  const click = (e) => {
    console.log(e)
  }
  return (
    <li class='sidebar-item'>
      <div class='sidebar-link' onClick={click}>
        <span># {text}</span>
      </div>
    </li>
  )
}

export default SidebarItem
