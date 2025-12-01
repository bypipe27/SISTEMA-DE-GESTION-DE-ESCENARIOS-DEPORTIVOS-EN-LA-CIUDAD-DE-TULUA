import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function RatingWidget({ value = 0, onChange, readOnly = false, size = 16 }) {
  const [hover, setHover] = React.useState(0);
  const stars = [1,2,3,4,5];

  const renderIcon = (star) => {
    const v = hover || value || 0;
    if (readOnly) {
      // support half stars when readOnly and value is fractional
      if (v >= star) return <FaStar className="text-amber-400" size={size} />;
      if (v >= star - 0.5) return <FaStarHalfAlt className="text-amber-400" size={size} />;
      return <FaRegStar className="text-gray-300" size={size} />;
    }
    // interactive: show hover state or filled/empty
    if ((hover || value) >= star) return <FaStar className="text-amber-400" size={size} />;
    return <FaRegStar className="text-gray-300" size={size} />;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`p-1 rounded-md transition-transform transform ${!readOnly ? 'hover:scale-110' : ''}`}
          >
            {renderIcon(s)}
          </button>
        ))}
      </div>
      <div className="text-sm text-slate-600">{value ? `${Number(value).toFixed(1)}/5` : 'Sin calificación'}</div>
    </div>
  );
}