import React from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title || 'Error'}</h3>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>
                <div className={styles.content}>
                    <p>{message}</p>
                </div>
                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.button}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
