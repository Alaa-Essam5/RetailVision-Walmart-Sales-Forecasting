import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Thermometer, Calendar } from 'lucide-react';

interface SalesData {
    Store: string;
    Dept: string;
    Date: string;
    Weekly_Sales: string; // CSV parses as string initially
    IsHoliday: string;
    Temperature: string;
    Fuel_Price: string;
    CPI: string;
    Unemployment: string;
    Type: string;
    Size: string;
}

interface ProcessedData {
    Store: number;
    Dept: number;
    Date: string;
    Weekly_Sales: number;
    IsHoliday: boolean;
    Temperature: number;
    Fuel_Price: number;
    CPI: number;
    Unemployment: number;
    Type: string;
    Size: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
    const [data, setData] = useState<ProcessedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStore, setSelectedStore] = useState<string>('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/history.csv');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const csvText = await response.text();

                Papa.parse<SalesData>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const processed = results.data
                            .map(row => ({
                                Store: parseInt(row.Store),
                                Dept: parseInt(row.Dept),
                                Date: row.Date,
                                Weekly_Sales: parseFloat(row.Weekly_Sales),
                                IsHoliday: row.IsHoliday === 'True',
                                Temperature: parseFloat(row.Temperature),
                                Fuel_Price: parseFloat(row.Fuel_Price),
                                CPI: parseFloat(row.CPI),
                                Unemployment: parseFloat(row.Unemployment),
                                Type: row.Type,
                                Size: parseInt(row.Size)
                            }))
                            .filter(row => !isNaN(row.Weekly_Sales)); // Filter out invalid rows

                        // Set initial date range
                        if (processed.length > 0) {
                            const dates = processed.map(d => new Date(d.Date).getTime());
                            const minTime = dates.reduce((min, time) => time < min ? time : min, dates[0]);
                            const maxTime = dates.reduce((max, time) => time > max ? time : max, dates[0]);
                            const minDate = new Date(minTime).toISOString().split('T')[0];
                            const maxDate = new Date(maxTime).toISOString().split('T')[0];
                            setDateRange({ start: minDate, end: maxDate });
                        }

                        setData(processed);
                        setLoading(false);
                    },
                    error: (err: Error) => {
                        setError(err.message);
                        setLoading(false);
                    }
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(d => {
            const storeMatch = selectedStore === 'All' || d.Store === parseInt(selectedStore);
            const dateMatch = (!dateRange.start || d.Date >= dateRange.start) &&
                (!dateRange.end || d.Date <= dateRange.end);
            return storeMatch && dateMatch;
        });
    }, [data, selectedStore, dateRange]);

    // KPIs
    const kpis = useMemo(() => {
        const totalSales = filteredData.reduce((sum, d) => sum + d.Weekly_Sales, 0);
        const avgSales = totalSales / (filteredData.length || 1);
        const totalRecords = filteredData.length;
        const avgTemp = filteredData.reduce((sum, d) => sum + d.Temperature, 0) / (filteredData.length || 1);

        return {
            totalSales,
            avgSales,
            totalRecords,
            avgTemp
        };
    }, [filteredData]);

    // Charts Data
    const weeklyTrend = useMemo(() => {
        const trend = filteredData.reduce((acc, curr) => {
            acc[curr.Date] = (acc[curr.Date] || 0) + curr.Weekly_Sales;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(trend)
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredData]);

    const salesByStore = useMemo(() => {
        if (selectedStore !== 'All') return [];

        const sales = filteredData.reduce((acc, curr) => {
            acc[curr.Store] = (acc[curr.Store] || 0) + curr.Weekly_Sales;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(sales)
            .map(([store, sales]) => ({ store: `Store ${store}`, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 20);
    }, [filteredData, selectedStore]);

    const salesByDept = useMemo(() => {
        const sales = filteredData.reduce((acc, curr) => {
            acc[curr.Dept] = (acc[curr.Dept] || 0) + curr.Weekly_Sales;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(sales)
            .map(([dept, sales]) => ({ dept: `Dept ${dept}`, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10); // Top 10 depts
    }, [filteredData]);

    const holidayImpact = useMemo(() => {
        const impact = filteredData.reduce((acc, curr) => {
            const key = curr.IsHoliday ? 'Holiday' : 'Non-Holiday';
            acc[key] = (acc[key] || 0) + curr.Weekly_Sales;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(impact).map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const economicIndicators = useMemo(() => {
        // Aggregate by date to reduce points and smooth lines
        interface AggData {
            date: string;
            sales: number;
            cpi: number;
            unemployment: number;
            count: number;
        }

        const agg = filteredData.reduce((acc, curr) => {
            if (!acc[curr.Date]) {
                acc[curr.Date] = {
                    date: curr.Date,
                    sales: 0,
                    cpi: 0,
                    unemployment: 0,
                    count: 0
                };
            }
            acc[curr.Date].sales += curr.Weekly_Sales;
            acc[curr.Date].cpi += curr.CPI;
            acc[curr.Date].unemployment += curr.Unemployment;
            acc[curr.Date].count += 1;
            return acc;
        }, {} as Record<string, AggData>);

        return Object.values(agg)
            .map((d: AggData) => ({
                date: d.date,
                sales: d.sales,
                cpi: d.cpi / d.count,
                unemployment: d.unemployment / d.count
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredData]);

    const scatterSample = useMemo(() => {
        // Sample data for scatter plot to avoid performance issues
        const sampleSize = 1000;
        const step = Math.ceil(filteredData.length / sampleSize);
        return filteredData.filter((_, i) => i % step === 0).map(d => ({
            temp: d.Temperature,
            sales: d.Weekly_Sales,
            fuel: d.Fuel_Price
        }));
    }, [filteredData]);

    const uniqueStores = useMemo(() => {
        const stores = new Set(data.map(d => d.Store));
        return Array.from(stores).sort((a, b) => a - b);
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-apple-blue" />
                    <p className="text-apple-secondary font-medium">Loading and processing dataset...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600">
                    <p className="font-semibold">Error loading data</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-apple-text tracking-tight">Sales Analytics</h1>
                    <p className="text-apple-secondary mt-2">Exploratory Data Analysis Dashboard</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 flex-1 md:flex-none">
                        <Calendar size={16} className="text-apple-secondary" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-sm font-medium text-apple-text outline-none"
                        />
                        <span className="text-apple-secondary">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-sm font-medium text-apple-text outline-none"
                        />
                    </div>

                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 flex-1 md:flex-none">
                        <span className="text-sm font-medium text-apple-secondary whitespace-nowrap">Filter by Store:</span>
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="bg-transparent font-semibold text-apple-text outline-none cursor-pointer w-full"
                        >
                            <option value="All">All Stores</option>
                            {uniqueStores.map(store => (
                                <option key={store} value={store}>Store {store}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-sm font-medium text-apple-secondary">Total Sales</span>
                    </div>
                    <p className="text-3xl font-bold text-apple-text">
                        ${(kpis.totalSales / 1000000).toFixed(2)}M
                    </p>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-sm font-medium text-apple-secondary">Avg Weekly Sales</span>
                    </div>
                    <p className="text-3xl font-bold text-apple-text">
                        ${kpis.avgSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-sm font-medium text-apple-secondary">Total Records</span>
                    </div>
                    <p className="text-3xl font-bold text-apple-text">
                        {kpis.totalRecords.toLocaleString()}
                    </p>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                            <Thermometer size={24} />
                        </div>
                        <span className="text-sm font-medium text-apple-secondary">Avg Temperature</span>
                    </div>
                    <p className="text-3xl font-bold text-apple-text">
                        {kpis.avgTemp.toFixed(1)}°F
                    </p>
                </div>
            </div>

            {/* Main Trends Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-6">Weekly Sales Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#2997FF"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#2997FF', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-6">Holiday Impact</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={holidayImpact}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {holidayImpact.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-6">Top Departments</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByDept} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="dept"
                                    type="category"
                                    width={80}
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                                />
                                <Bar dataKey="sales" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-6">Temperature vs Sales</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    type="number"
                                    dataKey="temp"
                                    name="Temperature"
                                    unit="°F"
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="sales"
                                    name="Sales"
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Sales" data={scatterSample} fill="#FF9F0A" fillOpacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Economic Indicators */}
            <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-lg font-semibold mb-6">Economic Indicators vs Sales</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={economicIndicators}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#86868B', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: '#86868B', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value / 1000000}M`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: '#86868B', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="sales" fill="#2997FF" stroke="#2997FF" fillOpacity={0.1} name="Total Sales" />
                            <Line yAxisId="right" type="monotone" dataKey="cpi" stroke="#FF8042" dot={false} name="CPI" />
                            <Line yAxisId="right" type="monotone" dataKey="unemployment" stroke="#82ca9d" dot={false} name="Unemployment Rate" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Store Performance (Conditional) */}
            {selectedStore === 'All' && (
                <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold mb-6">Top Performing Stores</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByStore}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="store"
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#86868B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value / 1000000}M`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Sales']}
                                />
                                <Bar dataKey="sales" fill="#30D158" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
