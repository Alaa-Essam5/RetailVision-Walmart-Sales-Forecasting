import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import {
  ArrowRight, CheckCircle2, Cpu, Database,
  GitBranch, Layers, TrendingUp, Zap, Search, Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';

const METRICS_DATA = [
  { name: 'Linear Reg.', value: 3855, display: '3,855', fill: '#94a3b8' },
  { name: 'XGBoost', value: 1991, display: '1,991', fill: '#60a5fa' },
  { name: 'Optuna Tuned', value: 1819, display: '1,819', fill: '#2997FF' },
];

const FEATURE_IMPORTANCE_DATA = [
  { name: 'Rolling Mean (4w)', value: 100 },
  { name: 'Store Size', value: 85 },
  { name: 'Department Sales', value: 72 },
  { name: 'Rolling Mean (12w)', value: 65 },
  { name: 'Week of Year', value: 45 },
  { name: 'CPI', value: 20 },
];

const Home: React.FC = () => {
  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100/50 to-purple-100/50 blur-[100px] rounded-full opacity-60 -z-10"></div>

        <div className="max-w-4xl mx-auto text-center animate-slide-up">


          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-apple-text mb-8 leading-tight">
            Forecasting Retail<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-apple-blue to-purple-600">
              with Precision.
            </span>
          </h1>

          <p className="text-xl text-apple-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            An end-to-end data science pipeline transforming 420k+ raw sales records into actionable insights using Optuna-optimized XGBoost.
          </p>

          <div className="flex justify-center gap-6">
            <Link
              to="/predict"
              className="px-8 py-4 bg-apple-text hover:bg-black text-white rounded-full font-medium transition-all hover:scale-105 shadow-xl flex items-center gap-2"
            >
              Launch Demo <Zap size={18} />
            </Link>
            <button onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 glass-card hover:bg-white text-apple-text rounded-full font-medium transition-all hover:scale-105 shadow-sm flex items-center gap-2">
              View Analysis
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid - Glass Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Rows of Data', val: '421,570' },
            { label: 'Stores Analyzed', val: '45' },
            { label: 'Departments', val: '99' },
            { label: 'R² Score', val: '0.99' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl font-bold text-apple-text mb-1">{stat.val}</div>
              <div className="text-xs font-medium text-apple-secondary uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Methodology - Detailed based on PDF */}
      <section id="methodology" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-apple-text mb-4">The Pipeline</h2>
            <p className="text-lg text-apple-secondary max-w-2xl">
              From chaotic raw CSVs to a refined machine learning model.
            </p>
          </div>

          <div className="space-y-24">

            {/* Step 1: Preprocessing */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-12 h-12 bg-blue-50 text-apple-blue rounded-xl flex items-center justify-center mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">1. Data Cleaning & Integration</h3>
                <ul className="space-y-4 text-apple-secondary">
                  <li className="flex gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    <span>Merged <code>train.csv</code>, <code>features.csv</code>, and <code>stores.csv</code>.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    <span>Handled Missing Values: Filled <code>MarkDown</code> columns with 0.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    <span>Imputed <code>CPI</code> and <code>Unemployment</code> using median values to preserve distribution.</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    <span>Converted <code>IsHoliday</code> booleans to integers.</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2 glass-card p-2 rounded-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-50 rounded-xl p-6 h-full font-mono text-xs text-gray-600 leading-relaxed overflow-hidden">
                  <div className="text-green-600"># Fill NA in MarkDowns</div>
                  <div>md_cols = [c for c in features if "MarkDown" in c]</div>
                  <div>features[md_cols] = features[md_cols].fillna(0)</div>
                  <br />
                  <div className="text-green-600"># Fill economic missing with median</div>
                  <div>features["CPI"].fillna(features["CPI"].median())</div>
                  <div>features["Unemployment"].fillna(median())</div>
                </div>
              </div>
            </div>

            {/* Step 2: Feature Engineering */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="glass-card p-2 rounded-2xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-50 rounded-xl p-6 h-full font-mono text-xs text-gray-600 leading-relaxed">
                  <div className="text-purple-600"># Create Lag Features</div>
                  <div>lag_periods = [1, 4, 8, 12]</div>
                  <div>for lag in lag_periods:</div>
                  <div className="pl-4">df[f'Weekly_Sales_lag_{'{lag}'}'] = ...</div>
                  <br />
                  <div className="text-purple-600"># Rolling Statistics</div>
                  <div>window_sizes = [4, 8, 12]</div>
                  <div>lambda x: x.rolling(window=w).mean()</div>
                </div>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">2. Advanced Feature Engineering</h3>
                <p className="text-apple-secondary mb-6">
                  We engineered temporal features to capture seasonal trends and past performance, crucial for time-series forecasting.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Lag Features</div>
                    <div className="text-sm text-gray-500">1, 4, 8, & 12 Weeks lookback</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Rolling Stats</div>
                    <div className="text-sm text-gray-500">Rolling Mean & Std Dev</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Cyclical Time</div>
                    <div className="text-sm text-gray-500">Sin/Cos transform for Month/Week</div>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="font-semibold text-gray-900 mb-1">Aggregations</div>
                    <div className="text-sm text-gray-500">Store & Dept Level Summaries</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Model & Optuna */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <Sliders size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">3. Optimization with Optuna</h3>
                <p className="text-apple-secondary mb-6 leading-relaxed">
                  We didn't settle for default parameters. We used the Optuna framework to run 20 trials, finding the perfect hyperparameters to minimize RMSE.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-medium border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Learning Rate</span>
                    <span className="text-gray-900 font-mono">0.083</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Max Depth</span>
                    <span className="text-gray-900 font-mono">8</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium border-b border-gray-200 pb-2">
                    <span className="text-gray-500">N Estimators</span>
                    <span className="text-gray-900 font-mono">324</span>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="glass-card p-6 rounded-3xl">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">RMSE Reduction (Lower is Better)</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={METRICS_DATA} layout="vertical" margin={{ left: 0, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e5e5" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={40}>
                          {METRICS_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Importance */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">What Drives Sales?</h2>
            <p className="text-apple-secondary">The XGBoost model identified these features as the most predictive.</p>
          </div>

          <div className="space-y-4">
            {FEATURE_IMPORTANCE_DATA.map((item, index) => (
              <div key={index} className="group">
                <div className="flex justify-between text-sm mb-2 px-1">
                  <span className="font-semibold text-gray-700">{item.name}</span>
                  <span className="text-apple-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity">Importance: {item.value}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-apple-blue to-cyan-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-apple-text">Ready to test the model?</h2>
        <p className="text-apple-secondary mb-10 text-lg">Use our interactive dashboard to simulate sales predictions.</p>
        <Link
          to="/predict"
          className="inline-flex items-center gap-2 px-8 py-4 bg-apple-text text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
        >
          Go to Predict Dashboard <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default Home;