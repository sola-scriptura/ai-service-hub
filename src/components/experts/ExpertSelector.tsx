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
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Select Your Expert</h2>
          <p className="text-primary-600">
            Choose from our vetted professionals. Expert selection does not affect pricing.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-primary-600">Loading experts...</p>
        </div>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-600">No experts available for this service yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Select Your Expert</h2>
        <p className="text-primary-600">
          Choose from our vetted professionals. Expert selection does not affect pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
