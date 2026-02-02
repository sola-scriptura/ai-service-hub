import { useState, useEffect } from 'react';
import { Expert } from '@/types';
import { expertsApi } from '@/services/expertsApi';
import ExpertCard from './ExpertCard';
import { useAppContext } from '@/context/AppContext';

interface ExpertSelectorProps {
  serviceId: string;
}

const ExpertSelector = ({ serviceId }: ExpertSelectorProps) => {
  const { selectedExpert, setSelectedExpert } = useAppContext();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        console.log('[ExpertSelector] Fetching experts for service:', serviceId);
        const data = await expertsApi.getByService(serviceId);
        console.log('[ExpertSelector] Fetched experts:', data.length, 'experts');
        setExperts(data);
      } catch (error) {
        console.error('[ExpertSelector] Error fetching experts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="detail-block">
        <h2>Select Your Expert</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Choose from our vetted professionals. Expert selection does not affect pricing.
        </p>
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading experts...</p>
        </div>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No experts available for this service yet.</p>
      </div>
    );
  }

  return (
    <div className="detail-block">
      <h2>Select Your Expert</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Choose from our vetted professionals. Expert selection does not affect pricing.
      </p>

      <div className="experts-select-grid">
        {experts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            isSelected={selectedExpert?.id === expert.id}
            onSelect={setSelectedExpert}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpertSelector;
