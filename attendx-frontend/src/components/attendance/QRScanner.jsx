import { useRef, useEffect } from 'react';
import { useQRScanner } from '../../hooks/useQRScanner';

// Overlay can be passed as children
export function QRScanner({ onScan, active = true, children }) {
  const videoRef = useRef(null);
  
  // Custom hook that binds qr-scanner to our video element
  useQRScanner({ videoRef, onScan, active });

  return (
    <div className="relative h-full w-full overflow-hidden bg-black rounded-2xl border border-border">
      <video 
        ref={videoRef} 
        className="h-full w-full object-cover" 
        disablePictureInPicture
        playsInline 
        muted 
      />
      {/* Overlay contents, e.g., corners, toasts */}
      {children}
      
      {/* Simple viewfinder corners */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-2 border-white/20 rounded-3xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
        </div>
      </div>
    </div>
  );
}
