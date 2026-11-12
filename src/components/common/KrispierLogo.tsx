import React from 'react';

interface KrispierLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const KrispierLogo: React.FC<KrispierLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  // Height configurations
  const heightMap = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 380 96"
        className={`${heightMap[size]} w-auto shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="KRISPIER - Delight In Every Sauce"
      >
        {/* Pizza Slice / Sauce Drip Icon */}
        <g transform="translate(10, 8)">
          {/* Crust back */}
          <path
            d="M 6 14 C 20 6, 44 6, 58 14 L 32 64 Z"
            fill="#FFC400"
            stroke="#FFB800"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Crust top border */}
          <path
            d="M 4 14 C 20 4, 44 4, 60 14 C 62 17, 58 20, 54 18 C 42 12, 22 12, 10 18 C 6 20, 2 17, 4 14 Z"
            fill="#FFA000"
          />
          {/* Sizzling toppings */}
          <circle cx="32" cy="26" r="4.5" fill="#EF4444" />
          <circle cx="23" cy="38" r="4" fill="#EF4444" />
          <circle cx="41" cy="38" r="3.5" fill="#EF4444" />
          {/* Golden Sauce Drip */}
          <path
            d="M 32 64 C 32 72, 35 76, 36 80 C 37 82, 33 83, 32 81 C 30 78, 30 72, 31 64 Z"
            fill="#FFC400"
          />
          <circle cx="36" cy="85" r="2.2" fill="#FFC400" />
        </g>

        {/* KRISPIER Typography */}
        <g transform="translate(78, 52)">
          <text
            x="0"
            y="0"
            fontFamily="'Impact', 'Arial Black', 'Outfit', sans-serif"
            fontSize="48"
            fontWeight="900"
            letterSpacing="2.5"
            fill="#FFC400"
          >
            KRISPIER
          </text>
        </g>

        {/* Tagline */}
        {showTagline && (
          <g transform="translate(80, 74)">
            <rect
              x="0"
              y="0"
              width="210"
              height="18"
              rx="4"
              fill="#222222"
              stroke="#353535"
              strokeWidth="1"
            />
            <circle cx="10" cy="9" r="3" fill="#FFC400" />
            <text
              x="20"
              y="13"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontSize="9.5"
              fontWeight="800"
              letterSpacing="2"
              fill="#FFFFFF"
            >
              DELIGHT IN EVERY SAUCE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
