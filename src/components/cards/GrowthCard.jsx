import React from 'react';
import { useStockData } from '../../hooks/useStockData';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart
} from 'recharts';
import styles from './GrowthCard.module.css';

const GrowthCard = () => {
    const { stockData, loading } = useStockData();

    if (loading) return <div className={styles.loading}></div>;
    if (!stockData) return null;

    const { growth } = stockData;

    // Prepare data for charts
    const prepareChartData = () => {
        if (!growth.tables) return [];

        const revenue = growth.tables.total_revenue || [];
        const netIncome = growth.tables.net_income || [];
        const opIncome = growth.tables.operating_income || [];
        const ocf = growth.tables.operating_cash_flow || [];

        // Merge by date
        const merged = revenue.map(r => {
            const ni = netIncome.find(n => n.date === r.date);
            const oi = opIncome.find(o => o.date === r.date);
            const o = ocf.find(c => c.date === r.date);
            return {
                date: r.date,
                revenue: r.value,
                netIncome: ni ? ni.value : 0,
                opIncome: oi ? oi.value : 0,
                ocf: o ? o.value : 0
            };
        }).reverse(); // Oldest to newest

        return merged;
    };

    const prepareMarginData = () => {
        if (!growth.tables) return [];

        const gross = growth.tables.gross_margin || [];
        const net = growth.tables.net_margin || [];

        const merged = gross.map(g => {
            const n = net.find(nm => nm.date === g.date);
            return {
                date: g.date,
                grossMargin: g.value,
                netMargin: n ? n.value : 0
            };
        }).reverse();

        return merged;
    };

    let financialData = prepareChartData();
    let marginData = prepareMarginData();

    // MOCK DATA FALLBACK (DEBUGGING)
    if (financialData.length === 0) {
        console.warn("Using Mock Data for Financial Chart");
        financialData = [
            { date: '2021', revenue: 168000000000, netIncome: 61000000000, ocf: 76000000000 },
            { date: '2022', revenue: 198000000000, netIncome: 72000000000, ocf: 89000000000 },
            { date: '2023', revenue: 211000000000, netIncome: 72000000000, ocf: 87000000000 },
            { date: '2024', revenue: 245000000000, netIncome: 88000000000, ocf: 110000000000 },
        ];
    }
    if (marginData.length === 0) {
        marginData = [
            { date: '2021', grossMargin: 68, netMargin: 36 },
            { date: '2022', grossMargin: 68, netMargin: 36 },
            { date: '2023', grossMargin: 69, netMargin: 34 },
            { date: '2024', grossMargin: 70, netMargin: 35 },
        ];
    }

    console.log("GrowthCard - financialData:", financialData);
    console.log("GrowthCard - marginData:", marginData);
    console.log("GrowthCard - growth.tables:", growth.tables);

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>Growth Analysis</h3>

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h4 className={styles.metricLabel}>Median Annual Revenue Growth</h4>
                    <p className={`${styles.metricValue} ${growth.revenueGrowth > 0 ? styles.positive : styles.negative}`}>
                        {(growth.revenueGrowth * 100).toFixed(2)}%
                    </p>
                </div>

            </div>

            {/* Chart 1: Revenue, Net Income, OCF */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Financial Performance (Revenue vs Income vs Cash Flow)</h4>
                {financialData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                formatter={(val) => [`$${(val / 1e9).toFixed(2)}B`, '']}
                            />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" barSize={20} />
                            <Bar dataKey="opIncome" name="Operating Income" fill="#8B5CF6" barSize={20} />
                            <Bar dataKey="netIncome" name="Net Income" fill="#F59E0B" barSize={20} />
                            <Bar dataKey="ocf" name="Operating Cash Flow" fill="#10B981" barSize={20} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.noData}>
                        No financial data available for chart
                    </div>
                )}
            </div>

            {/* Chart 2: Margins */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Margin Trends</h4>
                {marginData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={marginData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                                formatter={(val) => [`${val.toFixed(2)}%`, '']}
                            />
                            <Legend />
                            <Bar dataKey="grossMargin" name="Gross Margin" fill="#8B5CF6" barSize={20} />
                            <Bar dataKey="netMargin" name="Net Margin" fill="#EC4899" barSize={20} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={styles.noData}>
                        No margin data available for chart
                    </div>
                )}
            </div>

            {/* Growth Estimates Table */}
            {growth.estimates && growth.estimates.length > 0 && (
                <div>
                    <h4 className={styles.tableTitle}>5-Year Growth Estimates</h4>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.tableCell}>Period</th>
                                    <th className={styles.tableCell}>Growth Estimates</th>
                                </tr>
                            </thead>
                            <tbody>
                                {growth.estimates.map((row, idx) => (
                                    <tr key={idx} className={styles.tableRow}>
                                        <td className={styles.periodCell}>
                                            {row['Period'] || row['period'] || row['Growth Estimates'] || row['index'] || 'N/A'}
                                        </td>
                                        <td className={styles.valueCell}>
                                            {(row['stockTrend'] || row['stock'] || row[Object.keys(row).find(k => k !== 'period' && k !== 'Period' && k !== 'index')] || 'N/A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrowthCard;
