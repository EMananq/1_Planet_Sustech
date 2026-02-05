import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const EmissionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart">
        <p>No data available yet. Start logging activities to see trends!</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          <p className="tooltip-value">
            <span className="tooltip-dot"></span>
            {payload[0].value.toFixed(2)} kg CO₂
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="emission-chart">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7ccc8" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#2d5a27" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEmission)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      <style>{`
        .emission-chart {
          padding: 1rem 0;
        }
        
        .empty-chart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          text-align: center;
          padding: 2rem;
        }
        
        .chart-tooltip {
          background: #faf8f3;
          border: 1px solid #d7ccc8;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          box-shadow: 0 4px 12px rgba(93, 64, 55, 0.15);
        }
        
        .tooltip-date {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }
        
        .tooltip-value {
          color: var(--text-primary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .tooltip-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default EmissionChart;
