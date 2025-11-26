import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import styles from './HeroPage.module.css';
import { useStockData } from '../../hooks/useStockData';
import Modal from '../ui/Modal';
import WatchlistModal from '../ui/WatchlistModal'; // New component
import { Star } from 'lucide-react';

const HeroPage = () => {
    const [ticker, setTicker] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showWatchlist, setShowWatchlist] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { loadStockData } = useStockData();

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (ticker.trim()) {
            try {
                await loadStockData(ticker.trim().toUpperCase());
                navigate(`/analysis?ticker=${ticker.trim().toUpperCase()}`);
            } catch (error) {
                setErrorMessage(error.response?.data?.detail || error.message || "Could not find stock.");
                setShowErrorModal(true);
            }
        }
    };

    const handleCloseError = () => {
        setShowErrorModal(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundGradient}></div>

            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>Stock Analyser</h1>
                <button
                    className={styles.watchlistButton}
                    onClick={() => setShowWatchlist(true)}
                >
                    <Star size={20} className={styles.starIcon} />
                    Watchlist
                </button>
            </header>

            <div className={styles.content}>
                <h1 className={styles.title}>Stock Analyser</h1>
                <p className={styles.subtitle}>
                    Professional-grade financial analysis for the modern investor.
                    <br />
                    Enter a ticker to get started.
                </p>

                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        placeholder="Search ticker (e.g. MSFT)"
                        className={styles.searchInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e);
                            }
                        }}
                    />
                    <Search
                        className={styles.searchIcon}
                        size={24}
                        onClick={handleSearch}
                    />
                </div>
            </div>
            <Modal
                isOpen={showErrorModal}
                onClose={handleCloseError}
                title="Stock Not Found"
                message={errorMessage}
            />

            {showWatchlist && (
                <WatchlistModal
                    isOpen={showWatchlist}
                    onClose={() => setShowWatchlist(false)}
                />
            )}
        </div>
    );
};

export default HeroPage;
