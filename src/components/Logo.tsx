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
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const sizeDimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 }
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-xs',
  };

  const subtitleSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-xs'
  };

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
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
              className={`${sizeClasses[size]} rounded-full transition-transform group-hover:scale-110`}
            />
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>
      <div className="flex flex-col">
        <span className={`font-bold ${textSizeClasses[size]} group-hover:opacity-80 transition-opacity`} style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        {subtitle && (
          <span className={`${subtitleSizeClasses[size]}`} style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
