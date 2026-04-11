import React from 'react';
import CountUp from 'react-countup';
import { FiPieChart } from 'react-icons/fi'; // Fallback icon

const StatCard = ({
  icon: Icon = FiPieChart,
  label,
  title, // Support both label and title prop
  value,
  color,
  onClick,
  isPercentage,
  isCurrency,
  prefix = "",
}) => {
  // Automatically handle shorthand colour names like "indigo" -> "border-indigo-500"
  let borderClass = color || "border-blue-500";
  if (color && !color.startsWith("border-") && !color.includes("-")) {
    borderClass = `border-${color}-500`;
  } else if (color && !color.startsWith("border-")) {
    borderClass = color;
  }

  const displayLabel = label || title || "Stat";
  
  // Decide how to display the value
  const isStringValue = typeof value === 'string' && isNaN(parseFloat(value));
  const parsedValue = parseFloat(value) || 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border-t-4 ${borderClass} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'hover:shadow-md'
      } transition-all duration-300 flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-gray-400 text-base flex-shrink-0" />}
        <div className="text-sm font-medium text-gray-700">{displayLabel}</div>
      </div>
      <div className="text-sm font-bold text-gray-800">
        {prefix}
        {isCurrency ? "₹" : ""}
        {isStringValue ? (
          value
        ) : (
          <CountUp
            end={parsedValue}
            duration={2}
            decimals={(isPercentage || isCurrency) && parsedValue % 1 !== 0 ? 2 : 0}
            separator=","
          />
        )}
        {isPercentage ? "%" : ""}
      </div>
    </div>
  );
};

export default StatCard;