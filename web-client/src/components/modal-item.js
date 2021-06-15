import React, { useState } from 'react'
import { Modal } from 'reactstrap'
{
  /* 
<div class='modal fade' id='photoPreview' tabIndex={-1} role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>
        <div class='modal-dialog modal-dialog-centered modal-dialog-centered modal-dialog-scrollable' role='document'>
          <img id='photo' style={{ maxWidth: '-webkit-fill-available' }} />
        </div>*/
}
function ModalItem({ s3_url }) {
  const [modal, setModal] = useState(false)
  const toggle = (e) => {
    setModal(!modal)
  }

  return (
    <div class='myModal'>
      <a type='button' style={{ border: 0 + 'px;' }}>
        <img src={s3_url} onClick={toggle} />
      </a>
      <Modal isOpen={modal} toggle={toggle} centered='true' class='modal fade' size='lg'>
        <div class='modal-dialog modal-dialog-centered modal-dialog-centered modal-dialog-scrollable'>
          <img src={s3_url} style={{ maxWidth: 'inherit' }} />
        </div>
      </Modal>
    </div>
  )
}

export default ModalItem
