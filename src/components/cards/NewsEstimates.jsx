import React from 'react';
import { useStockData } from '../../hooks/useStockData';
import styles from './NewsEstimates.module.css';

const NewsEstimates = () => {
    const { stockData, loading } = useStockData();

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { news, financials, sharesOutstanding } = stockData;
    const growthEstimates = financials?.growth_estimates;

    return (
        <div className={styles.container}>
            {/* News Section */}
            <div className={styles.card}>
                <h3 className={styles.title}>Recent News</h3>
                <div className={styles.newsList}>
                    {news && news.length > 0 ? (
                        news.slice(0, 5).map((item, index) => (
                            <div key={index} className={styles.newsItem}>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.newsTitle}>
                                    {item.title}
                                </a>
                                <div className={styles.newsMeta}>
                                    <span>{item.publisher}</span>
                                    <span>{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noDataText}>No news available.</p>
                    )}
                </div>
            </div>

            {/* Estimates & Shares Section */}
            <div className={styles.rightColumn}>
                <div className={styles.card}>
                    <h3 className={styles.title}>Growth Estimates</h3>
                    {growthEstimates && typeof growthEstimates === 'object' ? (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th className={styles.th}>Period</th>
                                        {Object.keys(Object.values(growthEstimates)[0] || {}).map(key => (
                                            <th key={key} className={styles.th}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(growthEstimates).map(([period, values]) => (
                                        <tr key={period} className={styles.tableRow}>
                                            <td className={styles.periodCell}>{period}</td>
                                            {Object.values(values).map((val, idx) => (
                                                <td key={idx} className={styles.td}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className={styles.noDataText}>Estimates not available.</p>
                    )}
                </div>

                <div className={styles.card}>
                    <h3 className={styles.title}>Shares Outstanding</h3>
                    <p className={styles.sharesValue}>
                        {sharesOutstanding ? (sharesOutstanding / 1e9).toFixed(3) : 'N/A'} B
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsEstimates;
