import { useState, useEffect } from 'react';
import { activityApi } from '../../services/api';
import { X, Car, Zap, Utensils, Trash2, ShoppingBag, Calendar, FileText } from 'lucide-react';

const ActivityForm = ({ onClose, onSuccess, editActivity = null }) => {
  const [category, setCategory] = useState(editActivity?.category || '');
  const [activityType, setActivityType] = useState(editActivity?.activityType || '');
  const [value, setValue] = useState(editActivity?.value || '');
  const [date, setDate] = useState(
    editActivity?.date 
      ? new Date(editActivity.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(editActivity?.notes || '');
  const [activityTypes, setActivityTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'transport', name: 'Transport', icon: Car, color: 'var(--transport)' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'var(--energy)' },
    { id: 'food', name: 'Food', icon: Utensils, color: 'var(--food)' },
    { id: 'waste', name: 'Waste', icon: Trash2, color: 'var(--waste)' },
    { id: 'consumption', name: 'Shopping', icon: ShoppingBag, color: 'var(--consumption)' }
  ];

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      const response = await activityApi.getTypes();
      setActivityTypes(response.data);
    } catch (error) {
      console.error('Error fetching activity types:', error);
    }
  };

  const getUnit = () => {
    if (!category || !activityType) return '';
    const types = activityTypes[category];
    const type = types?.find(t => t.type === activityType);
    return type?.unit || '';
  };

  const getEmissionFactor = () => {
    if (!category || !activityType) return null;
    const types = activityTypes[category];
    const type = types?.find(t => t.type === activityType);
    return type?.factor || null;
  };

  const calculateEmission = () => {
    const factor = getEmissionFactor();
    if (factor && value) {
      return (parseFloat(value) * factor).toFixed(2);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!category || !activityType || !value) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const data = {
        category,
        activityType,
        value: parseFloat(value),
        unit: getUnit(),
        date,
        notes
      };

      if (editActivity) {
        await activityApi.update(editActivity.id, data);
      } else {
        await activityApi.create(data);
      }

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editActivity ? 'Edit Activity' : 'Log Activity'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          {/* Category Selection */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div className="category-grid">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-btn ${category === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(cat.id);
                      setActivityType('');
                    }}
                    style={{ '--cat-color': cat.color }}
                  >
                    <Icon size={24} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Type Selection */}
          {category && activityTypes[category] && (
            <div className="form-group">
              <label className="form-label">Activity Type *</label>
              <select
                className="form-select"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                required
              >
                <option value="">Select activity type</option>
                {activityTypes[category].map(type => (
                  <option key={type.type} value={type.type}>
                    {type.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    ({type.factor} kg CO₂/{type.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Value Input */}
          {activityType && (
            <div className="form-group">
              <label className="form-label">
                Amount ({getUnit()}) *
              </label>
              <input
                type="number"
                className="form-input"
                placeholder={`Enter ${getUnit()}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
                step="0.01"
                required
              />
              {calculateEmission() && (
                <div className="emission-preview">
                  Estimated emission: <strong>{calculateEmission()} kg CO₂</strong>
                </div>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} style={{ marginRight: '0.5rem' }} />
              Date
            </label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={16} style={{ marginRight: '0.5rem' }} />
              Notes (optional)
            </label>
            <textarea
              className="form-input"
              placeholder="Add any notes about this activity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editActivity ? 'Update' : 'Log Activity')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }
        
        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          background: var(--bg-glass);
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--text-secondary);
        }
        
        .category-btn:hover {
          background: var(--bg-card-hover);
          color: var(--cat-color);
        }
        
        .category-btn.active {
          border-color: var(--cat-color);
          color: var(--cat-color);
          background: color-mix(in srgb, var(--cat-color) 10%, transparent);
        }
        
        .category-btn span {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .emission-preview {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          color: var(--primary);
          font-size: 0.9rem;
        }
        
        .modal-footer {
          border-top: none;
          padding-top: 1rem;
        }
        
        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }
        
        @media (max-width: 640px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 400px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityForm;
