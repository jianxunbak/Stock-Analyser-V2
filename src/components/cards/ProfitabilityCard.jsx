import React from 'react';
import { useStockData } from '../../hooks/useStockData';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar
} from 'recharts';
import styles from './ProfitabilityCard.module.css';

const ProfitabilityCard = () => {
    const { stockData, loading } = useStockData();

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { profitability, growth } = stockData;

    // Prepare data
    const prepareChartData = () => {
        if (!profitability.tables || !growth.tables) return [];

        const receivables = profitability.tables.accounts_receivable || [];
        const revenue = growth.tables.total_revenue || [];

        // Merge by date
        const merged = revenue.map(r => {
            const rec = receivables.find(a => a.date === r.date);
            return {
                date: r.date,
                revenue: r.value,
                receivables: rec ? rec.value : 0
            };
        }).reverse();

        return merged;
    };

    const chartData = prepareChartData();

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Profitability & Efficiency</h3>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Return on Equity</h4>
                    <p className={`${styles.metricValue} ${profitability.roe > 0.12 ? styles.positive : styles.warning}`}>
                        {(profitability.roe * 100).toFixed(2)}%
                    </p>
                    <p className={styles.metricTarget}>Target: 12% - 15%</p>
                </div>

                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Return on Invested Capital</h4>
                    <p className={`${styles.metricValue} ${profitability.roic > 0.12 ? styles.positive : styles.warning}`}>
                        {(profitability.roic * 100).toFixed(2)}%
                    </p>
                    <p className={styles.metricTarget}>Target: 12% - 15%</p>
                </div>
            </div>

            {/* Chart: Receivables vs Revenue */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Receivables vs Revenue</h4>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                formatter={(val) => [`$${(val / 1e9).toFixed(2)}B`, '']}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Total Revenue" fill="#3B82F6" barSize={20} />
                            <Bar dataKey="receivables" name="Accounts Receivable" fill="#EF4444" barSize={20} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.noData}>
                        No efficiency data available for chart
                    </div>
                )}
            </div>

            {/* Chart: Cash Conversion Cycle */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Cash Conversion Cycle (Past 4-5 Years)</h4>
                {profitability.ccc_history && profitability.ccc_history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={[...profitability.ccc_history].reverse()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                formatter={(val) => [`${val.toFixed(0)} days`, 'CCC']}
                            />
                            <Legend />
                            <Bar dataKey="value" name="Cash Conversion Cycle" fill="#10B981" barSize={20} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.noData}>
                        {profitability.ccc_not_applicable_reason ? (
                            <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                                Not applicable: {profitability.ccc_not_applicable_reason}
                            </span>
                        ) : (
                            "No CCC data available for chart"
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitabilityCard;
