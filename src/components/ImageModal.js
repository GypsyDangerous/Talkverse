import React, { useState, useEffect, useRef } from 'react'
import ModalImage, {Lightbox} from "react-modal-image"
import {CSSTransition} from "react-transition-group"
import "./ImageModal.css"

const ImageModal = ({large, medium, small}) => {
    const [open, setOpen] = useState(false)

    return (
        <CSSTransition in={open} timeout={200} classNames="my-node">
            <div>
                <Lightbox
                    medium={medium}
                    large={large}
                    small={small}
                    alt="Hello World!"
                    onClose={() => setOpen(true)}
                />
            </div>
        </CSSTransition>
    );
}

export default ImageModal;

