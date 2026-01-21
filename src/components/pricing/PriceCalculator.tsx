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
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Configure Your Project</h2>
          <p className="text-primary-600">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  if (!pricingRule) {
    return <div className="text-primary-600">Pricing not available for this service.</div>;
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
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Configure Your Project</h2>
        <p className="text-primary-600">
          Adjust the options below to see your custom quote
        </p>
      </div>

      {/* Quantity Input */}
      {pricingRule.quantityBased && (
        <div className="space-y-3">
          <Label htmlFor="quantity" className="text-base font-semibold">
            {quantityConfig.label}
          </Label>
          <div className="flex items-center gap-4">
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
              className="max-w-[200px]"
            />
            {pricingRule.unit === '1000 words' && (
              <span className="text-sm text-primary-600">
                ≈ {Math.ceil((localCriteria.quantity || 1) / 1000)} unit{Math.ceil((localCriteria.quantity || 1) / 1000) > 1 ? 's' : ''} @ ${pricingRule.basePrice}/1000 words
              </span>
            )}
            {pricingRule.unit !== '1000 words' && (
              <span className="text-sm text-primary-600">
                @ ${pricingRule.basePrice}/{pricingRule.unit}
              </span>
            )}
          </div>
          {pricingRule.unit === '1000 words' && (
            <p className="text-xs text-primary-500">
              Pricing is calculated per 1,000 words (rounded up)
            </p>
          )}
        </div>
      )}

      {/* Urgency Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Delivery Speed</Label>
        <RadioGroup
          value={localCriteria.urgency}
          onValueChange={(value) =>
            setLocalCriteria({
              ...localCriteria,
              urgency: value as 'standard' | 'rush' | 'express',
            })
          }
        >
          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="standard" id="urgency-standard" />
            <Label htmlFor="urgency-standard" className="flex-1 cursor-pointer">
              <div className="font-semibold">Standard</div>
              <div className="text-sm text-primary-600">
                {getTurnaroundTime(service.id, 'standard')}
              </div>
            </Label>
            <span className="text-sm text-primary-600">Base price</span>
          </div>

          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="rush" id="urgency-rush" />
            <Label htmlFor="urgency-rush" className="flex-1 cursor-pointer">
              <div className="font-semibold">Rush</div>
              <div className="text-sm text-primary-600">
                {getTurnaroundTime(service.id, 'rush')}
              </div>
            </Label>
            <span className="text-sm font-semibold text-accent">
              +{((pricingRule.urgencyMultipliers.rush - 1) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="express" id="urgency-express" />
            <Label htmlFor="urgency-express" className="flex-1 cursor-pointer">
              <div className="font-semibold">Express</div>
              <div className="text-sm text-primary-600">
                {getTurnaroundTime(service.id, 'express')}
              </div>
            </Label>
            <span className="text-sm font-semibold text-accent">
              +{((pricingRule.urgencyMultipliers.express - 1) * 100).toFixed(0)}%
            </span>
          </div>
        </RadioGroup>
      </div>

      {/* Complexity Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Project Complexity</Label>
        <RadioGroup
          value={localCriteria.complexity}
          onValueChange={(value) =>
            setLocalCriteria({
              ...localCriteria,
              complexity: value as 'basic' | 'standard' | 'complex',
            })
          }
        >
          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="basic" id="complexity-basic" />
            <Label htmlFor="complexity-basic" className="flex-1 cursor-pointer">
              <div className="font-semibold">Basic</div>
              <div className="text-sm text-primary-600">Simple, straightforward work</div>
            </Label>
            <span className="text-sm text-primary-600">Base price</span>
          </div>

          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="standard" id="complexity-standard" />
            <Label htmlFor="complexity-standard" className="flex-1 cursor-pointer">
              <div className="font-semibold">Standard</div>
              <div className="text-sm text-primary-600">Moderate complexity</div>
            </Label>
            <span className="text-sm font-semibold text-accent">
              +{((pricingRule.complexityMultipliers.standard - 1) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
            <RadioGroupItem value="complex" id="complexity-complex" />
            <Label htmlFor="complexity-complex" className="flex-1 cursor-pointer">
              <div className="font-semibold">Complex</div>
              <div className="text-sm text-primary-600">Advanced, detailed work</div>
            </Label>
            <span className="text-sm font-semibold text-accent">
              +{((pricingRule.complexityMultipliers.complex - 1) * 100).toFixed(0)}%
            </span>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default PriceCalculator;
