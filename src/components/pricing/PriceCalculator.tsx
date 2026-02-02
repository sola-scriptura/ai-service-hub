import { useEffect, useState } from 'react';
import { Service, Quote, PricingRule } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { pricingApi } from '@/services/pricingApi';
import { getTurnaroundTime } from '@/data/pricing';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface PriceCalculatorProps {
  service: Service;
}

const PriceCalculator = ({ service }: PriceCalculatorProps) => {
  const { pricingCriteria, setPricingCriteria, setCurrentQuote } = useAppContext();
  const [localCriteria, setLocalCriteria] = useState(pricingCriteria);
  const [pricingRule, setPricingRule] = useState<PricingRule | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch pricing rule for this service
  useEffect(() => {
    const fetchPricingRule = async () => {
      try {
        console.log('[PriceCalculator] Fetching pricing rule for service:', service.id);
        const rules = await pricingApi.getAll();
        const rule = rules.find((r) => r.serviceId === service.id);
        console.log('[PriceCalculator] Pricing rule:', rule);
        setPricingRule(rule || null);
      } catch (error) {
        console.error('[PriceCalculator] Error fetching pricing rule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingRule();
  }, [service.id]);

  // Calculate quote when criteria changes
  useEffect(() => {
    if (!pricingRule) return;

    console.log('[PriceCalculator] Calculating price with criteria:', localCriteria);
    const { finalPrice, breakdown } = pricingApi.calculatePrice(
      service.id,
      localCriteria.urgency,
      localCriteria.complexity,
      localCriteria.quantity || 1
    );

    const turnaroundTime = getTurnaroundTime(service.id, localCriteria.urgency);

    const quote: Quote = {
      serviceId: service.id,
      serviceName: service.title,
      basePrice: pricingRule.basePrice,
      finalPrice,
      turnaroundTime,
      breakdown,
      criteria: localCriteria,
    };

    console.log('[PriceCalculator] Generated quote:', quote);
    setCurrentQuote(quote);
    setPricingCriteria(localCriteria);
  }, [service.id, localCriteria, pricingRule, setCurrentQuote, service.title, setPricingCriteria]);

  if (loading) {
    return (
      <div className="config-block">
        <h2>Configure Your Project</h2>
        <p>Loading pricing information...</p>
      </div>
    );
  }

  if (!pricingRule) {
    return <div style={{ color: 'var(--text-secondary)' }}>Pricing not available for this service.</div>;
  }

  // Determine quantity input label and placeholder based on service type
  const getQuantityConfig = () => {
    switch (pricingRule.unit) {
      case 'document':
        return { label: 'Number of Documents', placeholder: 'e.g., 3', min: 1, step: 1 };
      case '1000 words':
        return { label: 'Word Count', placeholder: 'e.g., 2500', min: 100, step: 100 };
      case 'video':
        return { label: 'Number of Videos', placeholder: 'e.g., 2', min: 1, step: 1 };
      case 'design':
        return { label: 'Number of Designs', placeholder: 'e.g., 5', min: 1, step: 1 };
      case 'paper':
        return { label: 'Number of Papers', placeholder: 'e.g., 1', min: 1, step: 1 };
      default:
        return { label: 'Quantity', placeholder: 'e.g., 1', min: 1, step: 1 };
    }
  };

  const quantityConfig = getQuantityConfig();

  return (
    <div className="config-block">
      <h2>Configure Your Project</h2>
      <p>Adjust the options below to see your custom quote</p>

      <div className="config-group">
        {/* Quantity Input */}
        {pricingRule.quantityBased && (
          <div>
            <label className="config-label">{quantityConfig.label}</label>
            <div className="config-quantity">
              <Input
                id="quantity"
                type="number"
                min={quantityConfig.min}
                step={quantityConfig.step}
                value={localCriteria.quantity || 1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || quantityConfig.min;
                  setLocalCriteria({
                    ...localCriteria,
                    quantity: Math.max(quantityConfig.min, value),
                  });
                }}
                placeholder={quantityConfig.placeholder}
                style={{ maxWidth: '200px' }}
              />
              {pricingRule.unit === '1000 words' ? (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  &asymp; {Math.ceil((localCriteria.quantity || 1) / 1000)} unit{Math.ceil((localCriteria.quantity || 1) / 1000) > 1 ? 's' : ''} @ ${pricingRule.basePrice}/1000 words
                </span>
              ) : (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  @ ${pricingRule.basePrice}/{pricingRule.unit}
                </span>
              )}
            </div>
            {pricingRule.unit === '1000 words' && (
              <div className="config-quantity-hint">
                Pricing is calculated per 1,000 words (rounded up)
              </div>
            )}
          </div>
        )}

        {/* Urgency Selection */}
        <div>
          <label className="config-label">Delivery Speed</label>
          <RadioGroup
            value={localCriteria.urgency}
            onValueChange={(value) =>
              setLocalCriteria({
                ...localCriteria,
                urgency: value as 'standard' | 'rush' | 'express',
              })
            }
          >
            <div className="config-option">
              <RadioGroupItem value="standard" id="urgency-standard" />
              <Label htmlFor="urgency-standard" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Standard</div>
                <div className="desc">{getTurnaroundTime(service.id, 'standard')}</div>
              </Label>
              <span className="config-option-extra">Base price</span>
            </div>

            <div className="config-option">
              <RadioGroupItem value="rush" id="urgency-rush" />
              <Label htmlFor="urgency-rush" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Rush</div>
                <div className="desc">{getTurnaroundTime(service.id, 'rush')}</div>
              </Label>
              <span className="config-option-extra accent">
                +{((pricingRule.urgencyMultipliers.rush - 1) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="config-option">
              <RadioGroupItem value="express" id="urgency-express" />
              <Label htmlFor="urgency-express" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Express</div>
                <div className="desc">{getTurnaroundTime(service.id, 'express')}</div>
              </Label>
              <span className="config-option-extra accent">
                +{((pricingRule.urgencyMultipliers.express - 1) * 100).toFixed(0)}%
              </span>
            </div>
          </RadioGroup>
        </div>

        {/* Complexity Selection */}
        <div>
          <label className="config-label">Project Complexity</label>
          <RadioGroup
            value={localCriteria.complexity}
            onValueChange={(value) =>
              setLocalCriteria({
                ...localCriteria,
                complexity: value as 'basic' | 'standard' | 'complex',
              })
            }
          >
            <div className="config-option">
              <RadioGroupItem value="basic" id="complexity-basic" />
              <Label htmlFor="complexity-basic" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Basic</div>
                <div className="desc">Simple, straightforward work</div>
              </Label>
              <span className="config-option-extra">Base price</span>
            </div>

            <div className="config-option">
              <RadioGroupItem value="standard" id="complexity-standard" />
              <Label htmlFor="complexity-standard" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Standard</div>
                <div className="desc">Moderate complexity</div>
              </Label>
              <span className="config-option-extra accent">
                +{((pricingRule.complexityMultipliers.standard - 1) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="config-option">
              <RadioGroupItem value="complex" id="complexity-complex" />
              <Label htmlFor="complexity-complex" className="config-option-info" style={{ cursor: 'pointer' }}>
                <div className="name">Complex</div>
                <div className="desc">Advanced, detailed work</div>
              </Label>
              <span className="config-option-extra accent">
                +{((pricingRule.complexityMultipliers.complex - 1) * 100).toFixed(0)}%
              </span>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
