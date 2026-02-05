import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { activityApi, aiApi } from '../../services/api';
import { 
  Leaf, Car, Zap, Utensils, Trash2, 
  TrendingDown, TrendingUp, Plus, Calendar
} from 'lucide-react';
import EmissionChart from './EmissionChart';
import CategoryBreakdown from './CategoryBreakdown';
import ActivityList from '../Activities/ActivityList';
import ActivityForm from '../Activities/ActivityForm';
import QuickAdd from '../Activities/QuickAdd';
import Recommendations from '../AI/Recommendations';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [previousSummary, setPreviousSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, prevSummaryRes, trendsRes, activitiesRes] = await Promise.all([
        activityApi.getSummary('month'),
        activityApi.getSummary('month', true), // Previous period
        activityApi.getTrends(30),
        activityApi.getAll({ limit: 10 })
      ]);
      
      setSummary(summaryRes.data);
      setPreviousSummary(prevSummaryRes.data);
      setTrends(trendsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdded = () => {
    setShowActivityForm(false);
    fetchData();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      transport: Car,
      energy: Zap,
      food: Utensils,
      waste: Trash2
    };
    return icons[category] || Leaf;
  };

  // Calculate percentage change from previous period
  const getPercentChange = () => {
    if (!summary?.total || !previousSummary?.total) return null;
    const current = summary.total;
    const previous = previousSummary.total;
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            Welcome back{user?.name ? `, ${user.name}` : ''}! 🌱
          </h1>
          <p className="page-subtitle">
            Track your carbon footprint and make a difference
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowActivityForm(true)}
        >
          <Plus size={20} />
          Log Activity
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Leaf size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {summary?.total?.toFixed(1) || 0}
              <span className="stat-unit">kg</span>
            </div>
            <div className="stat-label">CO₂ This Month</div>
            {getPercentChange() !== null && (
              <div className={`stat-change ${parseFloat(getPercentChange()) <= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(getPercentChange()) <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                <span>{Math.abs(getPercentChange())}% vs last month</span>
              </div>
            )}
            {getPercentChange() === null && (
              <div className="stat-change neutral">
                <span>Log activities to compare</span>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon transport">
            <Car size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {summary?.byCategory?.transport?.toFixed(1) || 0}
              <span className="stat-unit">kg</span>
            </div>
            <div className="stat-label">Transport</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon energy">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {summary?.byCategory?.energy?.toFixed(1) || 0}
              <span className="stat-unit">kg</span>
            </div>
            <div className="stat-label">Energy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon food">
            <Utensils size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {summary?.byCategory?.food?.toFixed(1) || 0}
              <span className="stat-unit">kg</span>
            </div>
            <div className="stat-label">Food</div>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <QuickAdd onSuccess={fetchData} />

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Activities
        </button>
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Recommendations
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="chart-card card">
              <div className="card-header">
                <h3 className="card-title">Emissions Trend</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-dot" style={{ background: 'var(--primary)' }}></span>
                    Last 30 days
                  </span>
                </div>
              </div>
              <EmissionChart data={trends} />
            </div>

            <div className="breakdown-card card">
              <div className="card-header">
                <h3 className="card-title">Category Breakdown</h3>
              </div>
              <CategoryBreakdown data={summary?.byCategory || {}} />
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <ActivityList 
            activities={activities} 
            onRefresh={fetchData}
            onAdd={() => setShowActivityForm(true)}
          />
        )}

        {activeTab === 'recommendations' && (
          <Recommendations />
        )}
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <ActivityForm 
          onClose={() => setShowActivityForm(false)}
          onSuccess={handleActivityAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
