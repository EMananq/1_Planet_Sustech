import { useState } from 'react';
import { activityApi } from '../../services/api';
import { 
  Car, Zap, Utensils, Trash2, ShoppingBag, 
  Edit2, Trash, Plus, Calendar, MoreVertical 
} from 'lucide-react';
import ActivityForm from './ActivityForm';

const ActivityList = ({ activities, onRefresh, onAdd }) => {
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getCategoryIcon = (category) => {
    const icons = {
      transport: Car,
      energy: Zap,
      food: Utensils,
      waste: Trash2,
      consumption: ShoppingBag
    };
    return icons[category] || Car;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatActivityType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    setDeletingId(id);
    try {
      await activityApi.delete(id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingActivity(null);
    onRefresh();
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No activities logged yet</h3>
        <p>Start tracking your carbon footprint by logging your daily activities.</p>
        <button className="btn btn-primary" onClick={onAdd} style={{ marginTop: '1rem' }}>
          <Plus size={20} />
          Log Your First Activity
        </button>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="activity-list">
      <div className="activity-list-header">
        <h3>Recent Activities</h3>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          <Plus size={16} />
          Add New
        </button>
      </div>

      {Object.entries(groupedActivities).map(([dateStr, dayActivities]) => (
        <div key={dateStr} className="activity-day-group">
          <div className="activity-date-header">
            <Calendar size={16} />
            <span>{formatDate(dateStr)}</span>
            <span className="activity-day-total">
              {dayActivities.reduce((sum, a) => sum + (a.co2Emission || 0), 0).toFixed(2)} kg CO₂
            </span>
          </div>

          <div className="activity-items">
            {dayActivities.map(activity => {
              const Icon = getCategoryIcon(activity.category);
              return (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.category}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="activity-info">
                    <div className="activity-name">
                      {formatActivityType(activity.activityType)}
                    </div>
                    <div className="activity-details">
                      {activity.value} {activity.unit} • 
                      <span className={`badge badge-${activity.category}`}>
                        {activity.category}
                      </span>
                    </div>
                  </div>

                  <div className="activity-emission">
                    <span className="emission-value">{activity.co2Emission?.toFixed(2)}</span>
                    <span className="emission-unit">kg CO₂</span>
                  </div>

                  <div className="activity-actions">
                    <button 
                      className="action-btn" 
                      onClick={() => setEditingActivity(activity)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(activity.id)}
                      disabled={deletingId === activity.id}
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {editingActivity && (
        <ActivityForm 
          editActivity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      <style>{`
        .activity-list {
          animation: fadeIn 0.3s ease;
        }
        
        .activity-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .activity-list-header h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }
        
        .activity-day-group {
          margin-bottom: 1.5rem;
        }
        
        .activity-date-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.75rem;
        }
        
        .activity-day-total {
          margin-left: auto;
          color: var(--primary);
          font-weight: 600;
        }
        
        .activity-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          transition: all var(--transition-fast);
        }
        
        .activity-item:hover {
          border-color: var(--primary);
          transform: translateX(4px);
        }
        
        .activity-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .activity-icon.transport { background: rgba(139, 92, 246, 0.2); color: var(--transport); }
        .activity-icon.energy { background: rgba(245, 158, 11, 0.2); color: var(--energy); }
        .activity-icon.food { background: rgba(239, 68, 68, 0.2); color: var(--food); }
        .activity-icon.waste { background: rgba(107, 114, 128, 0.2); color: var(--waste); }
        .activity-icon.consumption { background: rgba(236, 72, 153, 0.2); color: var(--consumption); }
        
        .activity-info {
          flex: 1;
          min-width: 0;
        }
        
        .activity-name {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .activity-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .activity-emission {
          text-align: right;
        }
        
        .emission-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .emission-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .activity-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .action-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--text-muted);
        }
        
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          border-color: var(--error);
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 640px) {
          .activity-item {
            flex-wrap: wrap;
          }
          
          .activity-emission {
            order: -1;
            width: 100%;
            text-align: left;
            margin-bottom: 0.5rem;
            padding-left: 60px;
          }
          
          .activity-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ActivityList;
