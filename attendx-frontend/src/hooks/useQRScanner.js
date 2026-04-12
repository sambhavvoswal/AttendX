import QrScanner from 'qr-scanner';
import { useRef, useEffect, useCallback } from 'react';
import { SCAN_DEBOUNCE_MS } from '../constants';

export function useQRScanner({ videoRef, onScan, active = true }) {
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({});  // { [raw_string]: timestamp }

  const handleResult = useCallback((rawData) => {
    // Debounce: ignore same value within SCAN_DEBOUNCE_MS window
    const now = Date.now();
    if (lastScannedRef.current[rawData] &&
        now - lastScannedRef.current[rawData] < SCAN_DEBOUNCE_MS) {
      return;
    }
    lastScannedRef.current[rawData] = now;
    onScan(rawData);
  }, [onScan]);

  useEffect(() => {
    if (!videoRef.current) return;
    
    // Make sure we have a video element
    const scanner = new QrScanner(
      videoRef.current,
      (result) => handleResult(result.data),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
      }
    );
    scannerRef.current = scanner;

    if (active) {
      scanner.start().catch((e) => console.error("Could not starting camera", e));
    }

    return () => {
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [videoRef, handleResult, active]);

  const pause = useCallback(() => {
    if (scannerRef.current) scannerRef.current.stop();
  }, []);

  const resume = useCallback(() => {
    if (scannerRef.current) scannerRef.current.start();
  }, []);

  return { pause, resume };
}
