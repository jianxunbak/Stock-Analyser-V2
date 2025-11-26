import React, { useState, useEffect } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './WatchlistModal.module.css';

const WatchlistModal = ({ isOpen, onClose }) => {
    const [watchlist, setWatchlist] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
            setWatchlist(savedWatchlist);
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const removeFromWatchlist = (ticker) => {
        const updated = watchlist.filter(item => item.ticker !== ticker);
        setWatchlist(updated);
        localStorage.setItem('watchlist', JSON.stringify(updated));
        window.dispatchEvent(new Event('watchlist-updated'));
    };

    const handleNavigate = (ticker) => {
        navigate(`/analysis?ticker=${ticker}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>My Watchlist</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {watchlist.length === 0 ? (
                        <p className={styles.emptyText}>Your watchlist is empty.</p>
                    ) : (
                        <div className={styles.list}>
                            {/* Header Row */}
                            <div className={styles.headerRow}>
                                <span>Ticker</span>
                                <span>Health</span>
                                <span>Price</span>
                                <span>Signal</span>
                                <span>Intrinsic Val</span>
                                <span>Support</span>
                                <span className={styles.actionsHeader}>Actions</span>
                            </div>

                            {watchlist.map((item) => (
                                <div key={item.ticker} className={styles.row}>
                                    <div className={styles.tickerCol}>
                                        <span
                                            className={styles.tickerLink}
                                            onClick={() => handleNavigate(item.ticker)}
                                        >
                                            {item.ticker}
                                        </span>
                                    </div>

                                    <div className={styles.scoreCol}>
                                        <div className={styles.scoreBadge} style={{
                                            backgroundColor: item.score >= 70 ? 'rgba(16, 185, 129, 0.2)' :
                                                item.score >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: item.score >= 70 ? '#10B981' :
                                                item.score >= 40 ? '#F59E0B' : '#EF4444'
                                        }}>
                                            {item.score}%
                                        </div>
                                    </div>

                                    <div className={styles.priceCol}>
                                        ${item.price?.toFixed(2)}
                                    </div>

                                    <div className={styles.signalCol}>
                                        <span className={`${styles.signalBadge} ${item.signal === 'Buy' ? styles.signalBuy :
                                            item.signal === 'Sell' ? styles.signalSell :
                                                styles.signalHold
                                            }`}>
                                            {item.signal || 'Hold'}
                                        </span>
                                    </div>

                                    <div className={styles.valCol}>
                                        ${item.intrinsicValue ? item.intrinsicValue.toFixed(2) : 'N/A'}
                                    </div>

                                    <div className={styles.valCol}>
                                        {item.supportLevel ? `$${item.supportLevel.toFixed(2)}` : 'N/A'}
                                    </div>

                                    <div className={styles.actionsCol}>
                                        <button
                                            onClick={() => removeFromWatchlist(item.ticker)}
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            title="Remove"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WatchlistModal;
