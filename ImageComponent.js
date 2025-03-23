import React from 'react';

export default function ImageComponent({ src, alt, width = 150, height = 150 }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div 
      className="relative" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        overflow: 'hidden'
      }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Error
        </div>
      )}
      
      <img 
        src={src} 
        alt={alt}
        width={width}
        height={height}
        className="object-cover"
        style={{ 
          display: loaded ? 'block' : 'none',
          width: `${width}px`, 
          height: `${height}px` 
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}
