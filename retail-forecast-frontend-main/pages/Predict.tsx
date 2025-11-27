import React, { useState } from 'react';
import {
  Calendar, Thermometer, Briefcase, ShoppingBag,
  Percent, Fuel, Building2, Loader2, DollarSign, Sparkles,
  TrendingUp, ArrowRight
} from 'lucide-react';
import Papa from 'papaparse';
import PredictionChart from '../components/PredictionChart';

interface HistoryRow {
  Store: string;
  Dept: string;
  Date: string;
  Weekly_Sales: string;
}

interface ChartDataPoint {
  date: string;
  sales: number;
  isPrediction: boolean;
}

const Predict: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const [formData, setFormData] = useState({
    date: '2012-11-02', // Default to Nov 2012 as requested
    storeSize: 150000,
    isHoliday: false,
    temperature: 65,
    fuelPrice: 3.50,
    cpi: 211,
    unemployment: 7.5,
    dept: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const fetchHistoryData = async (store: number, dept: number): Promise<ChartDataPoint[]> => {
    return new Promise((resolve) => {
      Papa.parse('/history.csv', {
        download: true,
        header: true,
        complete: (results) => {
          const data = results.data as HistoryRow[];

          // Filter by Store and Dept, and remove invalid rows
          const filtered = data.filter(row =>
            row.Store && row.Dept && row.Date && row.Weekly_Sales &&
            Number(row.Store) === store &&
            Number(row.Dept) === dept &&
            Number(row.Weekly_Sales) > 0
          );

          // Sort by date descending to get most recent
          filtered.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
          // Take top 8 and reverse to chronological order
          const recent = filtered.slice(0, 8).reverse().map(row => ({
            date: row.Date,
            sales: Number(row.Weekly_Sales),
            isPrediction: false
          }));

          resolve(recent);
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
          resolve([]);
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setChartData([]);

    try {
      const payload = {
        Store: 1, // Default store
        Dept: Number(formData.dept),
        Date: formData.date,
        Weekly_Sales: 0, // Placeholder
        Temperature: Number(formData.temperature),
        Fuel_Price: Number(formData.fuelPrice),
        CPI: Number(formData.cpi),
        Unemployment: Number(formData.unemployment),
        IsHoliday: Boolean(formData.isHoliday),
        Type: "A", // Default type
        Size: Number(formData.storeSize)
      };

      // Fetch prediction
      const response = await fetch('http://localhost:3004/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        const predictionValue = data.prediction;
        setResult(predictionValue);

        // Fetch historical data
        const history = await fetchHistoryData(1, Number(formData.dept));

        // Combine history with prediction
        const combinedData = [
          ...history,
          {
            date: formData.date,
            sales: predictionValue,
            isPrediction: true
          }
        ];

        setChartData(combinedData);
        console.log("Data", combinedData)

      } else {
        console.error("Prediction failed:", data);
        alert("Prediction failed. See console for details.");
      }
    } catch (error) {
      console.error("Error calling prediction API:", error);
      alert("Error calling prediction API. Ensure backend is running on port 3004.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <div className="pt-12 pb-10 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/50 blur-[100px] rounded-full pointer-events-none"></div>
        <h1 className="text-5xl font-bold text-apple-text mb-4 relative z-10 tracking-tight">Prediction Engine</h1>
        <p className="text-apple-secondary max-w-xl mx-auto text-lg relative z-10">
          Simulate store scenarios using our Optuna-tuned XGBoost model.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-12">

        {/* Input Panel */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 animate-slide-up shadow-xl border border-white/60 backdrop-blur-xl bg-white/80" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-apple-text flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Sparkles size={20} />
              </div>
              Model Configuration
            </h2>
            <div className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-mono font-medium shadow-lg shadow-gray-200">v2.0 Tuned</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Main Sliders Group */}
            <div className="bg-gray-50/50 rounded-3xl p-8 space-y-8 border border-gray-100">

              {/* Store Size Slider */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Building2 size={18} className="text-blue-500" /> Store Size
                  </label>
                  <span className="text-sm font-mono bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-gray-700">
                    {Number(formData.storeSize).toLocaleString()} <span className="text-gray-400 text-xs">sq ft</span>
                  </span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input
                    type="range"
                    name="storeSize"
                    min="30000" max="220000" step="1000"
                    value={formData.storeSize}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                  <span>Small (30k)</span>
                  <span>Supercenter (220k)</span>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full"></div>

              {/* Department Selection */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-purple-500" /> Department ID
                  </label>
                  <span className="text-xs text-gray-400 font-medium">Range: 1 - 99</span>
                </div>
                <input
                  type="number" name="dept" min="1" max="99"
                  value={formData.dept} onChange={handleChange}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-medium text-gray-700"
                />
              </div>
            </div>

            {/* Grid Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
                <div className="relative group">
                  <Calendar size={16} className="absolute left-4 top-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <input
                    type="date" name="date"
                    value={formData.date} onChange={handleChange}
                    className="w-full pl-11 p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Temp (°F)</label>
                <div className="relative group">
                  <Thermometer size={16} className="absolute left-4 top-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  <input
                    type="number" name="temperature"
                    value={formData.temperature} onChange={handleChange}
                    className="w-full pl-11 p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Fuel ($)</label>
                <div className="relative group">
                  <Fuel size={16} className="absolute left-4 top-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  <input
                    type="number" name="fuelPrice" step="0.01"
                    value={formData.fuelPrice} onChange={handleChange}
                    className="w-full pl-11 p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-yellow-100 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">CPI</label>
                <div className="relative group">
                  <Percent size={16} className="absolute left-4 top-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                  <input
                    type="number" name="cpi" step="0.1"
                    value={formData.cpi} onChange={handleChange}
                    className="w-full pl-11 p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-green-100 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Holiday Toggle */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFormData({ ...formData, isHoliday: !formData.isHoliday })}>
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">Holiday Week</div>
                  <div className="text-sm text-gray-500 font-medium">Super Bowl, Labor Day, Thanksgiving, Christmas</div>
                </div>
              </div>
              <div className={`w-14 h-8 rounded-full transition-colors relative ${formData.isHoliday ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${formData.isHoliday ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gray-900 hover:bg-black text-white font-bold text-lg rounded-2xl transition-all shadow-xl hover:shadow-2xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></div>
              <div className="relative flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing Model...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-yellow-300" /> Generate Sales Forecast <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Result Panel - Full Width Below */}
        {(result || loading) && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden border border-white/60 backdrop-blur-xl bg-white/80">

              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 blur-[120px] rounded-full pointer-events-none -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/40 blur-[100px] rounded-full pointer-events-none -ml-16 -mb-16"></div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                  <div>
                    <h3 className="text-gray-500 font-medium uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                      <TrendingUp size={14} className="text-green-500" /> AI Analysis Result
                    </h3>
                    <h2 className="text-3xl font-bold text-gray-900">Weekly Sales Forecast</h2>
                  </div>

                  {result && (
                    <div className="flex items-center gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 rounded-2xl border border-blue-100">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Predicted Revenue</div>
                        <div className="text-4xl font-bold text-gray-900 tracking-tight">
                          ${Math.floor(result).toLocaleString()}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-gray-200"></div>

                    </div>
                  )}
                </div>

                <div className="min-h-[400px] w-full bg-gray-50/50 rounded-3xl border border-gray-100 p-6">
                  {loading ? (
                    <div className="w-full h-[350px] flex flex-col items-center justify-center space-y-6">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="text-blue-600 font-medium animate-pulse">Running XGBoost Inference...</div>
                    </div>
                  ) : result ? (
                    <div className="w-full animate-fade-in">
                      <PredictionChart data={chartData} />
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Predict;