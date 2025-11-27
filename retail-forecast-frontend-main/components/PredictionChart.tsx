import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea
} from 'recharts';

interface ChartDataPoint {
  date: string;
  sales: number;
  isPrediction: boolean;
}

interface PredictionChartProps {
  data: ChartDataPoint[];
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data }) => {
  // Find the prediction point and the point before it
  const predictionIndex = data.findIndex(d => d.isPrediction);
  const predictionPoint = data[predictionIndex];
  const beforePrediction = predictionIndex > 0 ? data[predictionIndex - 1] : null;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            {/* Blue gradient for historical data */}
            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>

            {/* Green gradient for prediction */}
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>

            {/* Line gradient transitioning from blue to green */}
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="85%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Radial gradient for prediction highlight glow */}
            <radialGradient id="predictionGlow">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </radialGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" vertical={false} />

          {/* Highlight area for prediction week */}
          {predictionPoint && beforePrediction && (
            <ReferenceArea
              x1={beforePrediction.date}
              x2={predictionPoint.date}
              fill="url(#predictionGlow)"
              fillOpacity={0.6}
              stroke="#10b981"
              strokeWidth={2}
              strokeOpacity={0.3}
              strokeDasharray="4 4"
            />
          )}

          <XAxis
            dataKey="date"
            stroke="rgba(0,0,0,0.3)"
            tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.5)' }}
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="rgba(0,0,0,0.3)"
            tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.5)' }}
            tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            width={40}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '12px'
            }}
            itemStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 500 }}
            labelStyle={{ color: 'rgba(0,0,0,0.5)', fontSize: '10px', marginBottom: '4px' }}
            formatter={(value: number, name: string, props: any) => {
              const isPred = props.payload?.isPrediction;
              return [
                `$${value.toLocaleString()}`,
                isPred ? '🎯 Predicted Sales' : 'Historical Sales'
              ];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            cursor={{ stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* Main area chart with gradient fill */}
          <Area
            type="monotone"
            dataKey="sales"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            fill="url(#colorHistorical)"
            animationDuration={1500}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isPrediction) {
                return (
                  <g>
                    {/* Outer glow ring */}
                    <circle cx={cx} cy={cy} r={12} fill="#10b981" opacity={0.2}>
                      <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Middle ring */}
                    <circle cx={cx} cy={cy} r={8} fill="#10b981" opacity={0.4} />
                    {/* Inner dot */}
                    <circle cx={cx} cy={cy} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />
                  </g>
                );
              }
              return <circle cx={cx} cy={cy} r={3} fill="#3b82f6" opacity={0.6} />;
            }}
          />

          {/* Vertical reference line at prediction */}
          {predictionPoint && (
            <ReferenceLine
              x={predictionPoint.date}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
              strokeWidth={2}
              label={{
                value: '📊 Prediction',
                position: 'top',
                fill: '#10b981',
                fontSize: 11,
                fontWeight: 600
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;
