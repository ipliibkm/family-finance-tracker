import React from 'react';

interface AmountDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  showCurrency?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({ 
  amount, 
  className = '', 
  showSign = true,
  showCurrency = true,
  size = 'md'
}) => {
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Format number with German locale
  const formattedAmount = absoluteAmount.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  let textColorClass = '';
  if (isPositive) {
    textColorClass = 'text-success-400';
  } else if (isNegative) {
    textColorClass = 'text-error-400';
  }

  let textSizeClass = '';
  switch (size) {
    case 'sm':
      textSizeClass = 'text-sm';
      break;
    case 'lg':
      textSizeClass = 'text-lg md:text-xl font-semibold';
      break;
    default:
      textSizeClass = 'text-base';
  }
  
  return (
    <span className={`${textColorClass} ${textSizeClass} ${className}`}>
      {showSign && isPositive && '+'}
      {formattedAmount}
      {showCurrency && ' €'}
    </span>
  );
};

export default AmountDisplay;