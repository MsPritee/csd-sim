import React from 'react';


export interface LogoProps {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  neonBorder?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  src,
  alt,
  title,
  subtitle,
  size = 'md',
  className = '',
  neonBorder = false
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5 sm:h-6 sm:w-6',
    md: 'h-7 w-7 sm:h-8 sm:w-8',
    lg: 'h-9 w-9 sm:h-10 sm:w-10'
  };

  const sizeDimensions = {
    sm: { width: 20, height: 20 },
    md: { width: 28, height: 28 },
    lg: { width: 36, height: 36 }
  };

  const textSizeClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl'
  };

  const subtitleSizeClasses = {
    sm: 'text-[10px] sm:text-xs',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs sm:text-sm'
  };

  return (
    <div className={`flex items-center space-x-2 sm:space-x-3 group ${className}`}>
      <div className="relative shrink-0">
        {neonBorder ? (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary animate-spin-slow blur-sm scale-110"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60 animate-spin-reverse scale-105"></div>
            <div className="relative rounded-full bg-black p-0.5">
              <img
                src={src}
                alt={alt}
                width={sizeDimensions[size].width}
                height={sizeDimensions[size].height}
                loading="lazy"
                className={`${sizeClasses[size]} rounded-full object-cover transition-transform group-hover:scale-110`}
              />
            </div>
          </>
        ) : (
          <>
            <img
              src={src}
              alt={alt}
              width={sizeDimensions[size].width}
              height={sizeDimensions[size].height}
              loading="lazy"
              className={`${sizeClasses[size]} rounded-full transition-transform group-hover:scale-110`}
            />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`font-bold ${textSizeClasses[size]} group-hover:opacity-80 transition-opacity truncate`} style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        {subtitle && (
          <span className={`${subtitleSizeClasses[size]} truncate`} style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
