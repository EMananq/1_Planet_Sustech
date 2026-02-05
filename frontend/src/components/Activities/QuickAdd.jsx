import { useState } from 'react';
import { activityApi } from '../../services/api';
import { Car, Zap, Utensils, Bike, Bus, Train, Beef, Salad, Lightbulb, Tv, Shirt, Check } from 'lucide-react';

const QuickAdd = ({ onSuccess }) => {
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(null);

  const quickActions = [
    // Transport
    { id: 'car_commute', label: 'Car Commute', icon: Car, category: 'transport', activityType: 'car_petrol', value: 20, unit: 'km', color: '#6b8e23' },
    { id: 'bus_trip', label: 'Bus Trip', icon: Bus, category: 'transport', activityType: 'bus', value: 10, unit: 'km', color: '#6b8e23' },
    { id: 'train_trip', label: 'Train Trip', icon: Train, category: 'transport', activityType: 'train', value: 25, unit: 'km', color: '#6b8e23' },
    { id: 'bike_ride', label: 'Bike Ride', icon: Bike, category: 'transport', activityType: 'bicycle', value: 5, unit: 'km', color: '#6b8e23' },
    
    // Food (using valid backend types)
    { id: 'beef_meal', label: 'Beef Meal', icon: Beef, category: 'food', activityType: 'beef', value: 1, unit: 'meal', color: '#c62828' },
    { id: 'veg_meal', label: 'Veg Meal', icon: Salad, category: 'food', activityType: 'vegetarian', value: 1, unit: 'meal', color: '#c62828' },
    { id: 'chicken_meal', label: 'Chicken Meal', icon: Utensils, category: 'food', activityType: 'chicken', value: 1, unit: 'meal', color: '#c62828' },
    
    // Energy
    { id: 'lights', label: '4hr Lights', icon: Lightbulb, category: 'energy', activityType: 'electricity', value: 0.4, unit: 'kWh', color: '#d4a017' },
    { id: 'tv_time', label: '2hr TV', icon: Tv, category: 'energy', activityType: 'electricity', value: 0.3, unit: 'kWh', color: '#d4a017' },
    
    // Shopping
    { id: 'new_clothes', label: 'New Clothes', icon: Shirt, category: 'consumption', activityType: 'clothing', value: 1, unit: 'item', color: '#8b4513' },
  ];

  const handleQuickAdd = async (action) => {
    setLoading(action.id);
    setSuccess(null);
    
    try {
      await activityApi.create({
        category: action.category,
        activityType: action.activityType,
        value: action.value,
        unit: action.unit,
        date: new Date().toISOString().split('T')[0],
        notes: `Quick add: ${action.label}`
      });
      
      setSuccess(action.id);
      setTimeout(() => setSuccess(null), 2000);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Quick add failed:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="quick-add-section">
      <div className="quick-add-header">
        <h3>⚡ Quick Add</h3>
        <span className="quick-add-subtitle">One-click logging for common activities</span>
      </div>
      
      <div className="quick-add-grid">
        {quickActions.map(action => {
          const Icon = action.icon;
          const isLoading = loading === action.id;
          const isSuccess = success === action.id;
          
          return (
            <button
              key={action.id}
              className={`quick-add-btn ${isSuccess ? 'success' : ''}`}
              onClick={() => handleQuickAdd(action)}
              disabled={isLoading}
              style={{ '--action-color': action.color }}
            >
              {isSuccess ? (
                <Check size={20} />
              ) : isLoading ? (
                <div className="mini-spinner" />
              ) : (
                <Icon size={20} />
              )}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .quick-add-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .quick-add-header {
          margin-bottom: 1rem;
        }
        
        .quick-add-header h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        
        .quick-add-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .quick-add-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .quick-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-page);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }
        
        .quick-add-btn:hover {
          border-color: var(--action-color);
          color: var(--action-color);
          background: color-mix(in srgb, var(--action-color) 10%, white);
        }
        
        .quick-add-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        
        .quick-add-btn.success {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        
        .mini-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .quick-add-grid {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default QuickAdd;
