import { Expert } from '@/types';
import { Check, Clock, Star } from 'lucide-react';

interface ExpertCardProps {
  expert: Expert;
  isSelected: boolean;
  onSelect: (expert: Expert) => void;
}

const ExpertCard = ({ expert, isSelected, onSelect }: ExpertCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(expert);
  };

  return (
    <div
      onClick={handleClick}
      className={`expert-select-card${isSelected ? ' selected' : ''}`}
    >
      {isSelected && (
        <div className="expert-select-check">
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      <div className="expert-header">
        <div className="expert-avatar">
          {expert.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="expert-name">{expert.name}</div>
          <div className="expert-meta">
            <span className="expert-rating">
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <span>{expert.rating}</span>
            </span>
            <span className="expert-projects">
              {expert.completedProjects} projects
            </span>
          </div>
        </div>
      </div>

      <div className="expert-bio">{expert.bio}</div>

      <div className="expert-skills">
        {expert.expertise.slice(0, 3).map((skill) => (
          <span key={skill} className="expert-skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="expert-footer">
        <Clock size={16} />
        <span className="expert-response">Responds in {expert.responseTime}</span>
        <span
          className={`expert-availability ${
            expert.availability === 'available' ? 'available' : 'busy'
          }`}
        >
          {expert.availability === 'available' ? 'Available' : 'Busy'}
        </span>
      </div>
    </div>
  );
};

export default ExpertCard;
