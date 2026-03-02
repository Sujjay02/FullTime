import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
  showNumber?: boolean;
}

export default function StarRating({ value, onChange, readonly = false, size = 16, showNumber = false }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = display >= n;
        const half = !filled && display >= n - 0.5;
        return (
          <Star
            key={n}
            size={size}
            fill={filled || half ? 'var(--star)' : 'none'}
            color={filled || half ? 'var(--star)' : 'var(--border-light)'}
            style={{ cursor: readonly ? 'default' : 'pointer', flexShrink: 0 }}
            onMouseEnter={() => !readonly && setHover(n)}
            onMouseLeave={() => !readonly && setHover(0)}
            onClick={() => !readonly && onChange?.(n)}
          />
        );
      })}
      {showNumber && value > 0 && (
        <span style={{ fontSize: 13, color: 'var(--star)', marginLeft: 4, fontWeight: 600 }}>
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

export function HalfStarRating({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, n: number) => {
    if (!onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX < rect.left + rect.width / 2;
    setHover(half ? n - 0.5 : n);
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = display >= n;
        const half = !filled && display >= n - 0.5;
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-flex' }}>
            {half ? (
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Star size={size} fill="none" color="var(--border-light)" />
                <span style={{
                  position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden', display: 'inline-flex'
                }}>
                  <Star size={size} fill="var(--star)" color="var(--star)" />
                </span>
              </span>
            ) : (
              <Star
                size={size}
                fill={filled ? 'var(--star)' : 'none'}
                color={filled ? 'var(--star)' : 'var(--border-light)'}
              />
            )}
            <span
              style={{ position: 'absolute', inset: 0, cursor: onChange ? 'pointer' : 'default' }}
              onMouseMove={e => handleMouseMove(e as unknown as React.MouseEvent<SVGElement>, n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange?.(hover)}
            />
          </span>
        );
      })}
    </span>
  );
}
