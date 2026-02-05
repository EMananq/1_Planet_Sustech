import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Car, Zap, Utensils, Trash2, ShoppingBag } from 'lucide-react';

const CategoryBreakdown = ({ data }) => {
  const categories = [
    { key: 'transport', name: 'Transport', color: '#8b5cf6', icon: Car },
    { key: 'energy', name: 'Energy', color: '#f59e0b', icon: Zap },
    { key: 'food', name: 'Food', color: '#ef4444', icon: Utensils },
    { key: 'waste', name: 'Waste', color: '#6b7280', icon: Trash2 },
    { key: 'consumption', name: 'Consumption', color: '#ec4899', icon: ShoppingBag }
  ];

  const chartData = categories
    .filter(cat => data[cat.key] && data[cat.key] > 0)
    .map(cat => ({
      name: cat.name,
      value: parseFloat(data[cat.key]?.toFixed(2)) || 0,
      color: cat.color,
      icon: cat.icon
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <div className="empty-breakdown">
        <p>No emissions data yet. Log some activities to see your breakdown!</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="pie-tooltip">
          <p className="tooltip-name">{data.name}</p>
          <p className="tooltip-value">{data.value} kg CO₂</p>
          <p className="tooltip-percent">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="category-breakdown">
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center">
          <span className="pie-total">{total.toFixed(1)}</span>
          <span className="pie-unit">kg CO₂</span>
        </div>
      </div>

      <div className="breakdown-list">
        {chartData.map((item, index) => {
          const Icon = item.icon;
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="breakdown-item">
              <div className="breakdown-icon" style={{ background: `${item.color}20`, color: item.color }}>
                <Icon size={16} />
              </div>
              <div className="breakdown-info">
                <span className="breakdown-name">{item.name}</span>
                <span className="breakdown-value">{item.value} kg</span>
              </div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{ width: `${percentage}%`, background: item.color }}
                />
              </div>
              <span className="breakdown-percent">{percentage}%</span>
            </div>
          );
        })}
      </div>

      <style>{`
        .category-breakdown {
          padding: 1rem 0;
        }
        
        .empty-breakdown {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary);
          text-align: center;
          padding: 2rem;
        }
        
        .pie-chart-container {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .pie-total {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Poppins', sans-serif;
        }
        
        .pie-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .pie-tooltip {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }
        
        .pie-tooltip .tooltip-name {
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .pie-tooltip .tooltip-value {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        .pie-tooltip .tooltip-percent {
          color: var(--primary);
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }
        
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .breakdown-item {
          display: grid;
          grid-template-columns: 32px 1fr 80px 50px;
          align-items: center;
          gap: 0.75rem;
        }
        
        .breakdown-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .breakdown-info {
          display: flex;
          flex-direction: column;
        }
        
        .breakdown-name {
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        
        .breakdown-value {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .breakdown-bar {
          height: 6px;
          background: var(--bg-glass);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .breakdown-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        
        .breakdown-percent {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default CategoryBreakdown;
