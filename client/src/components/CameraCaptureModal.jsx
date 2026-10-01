import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * CameraCaptureModal — Live webcam capture component for profile photos.
 * Features:
 * - Live webcam stream with user facing camera
 * - Natural mirrored selfie preview
 * - Off-screen canvas square cropping & compression
 * - Instant snapshot review (Retake vs Confirm)
 * - Safe track cleanup on close/unmount
 */
const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop video stream safely
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start webcam video stream
  const startCamera = useCallback(async () => {
    setCameraError('');
    setIsInitializing(true);
    setCapturedPhoto(null);

    // Stop existing stream if any
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support webcam access. Please use the file upload option.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser settings to take a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam or camera device was detected on your system.');
      } else {
        setCameraError(err.message || 'Unable to access your camera. You can upload a photo from your files instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedPhoto(null);
      setCameraError('');
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Capture frame from video feed
  const handleSnap = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = 400; // 400x400 square avatar
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate center-cropped square from video feed
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    // Mirror horizontally so selfie feels natural
    ctx.translate(size, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, size, size);

    const base64Data = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(base64Data);

    // Stop live stream while reviewing photo
    stopStream();
  };

  // Retake photo: restart camera
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Confirm photo: pass to caller and close
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  const handleClose = () => {
    stopStream();
    setCapturedPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0C101B] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-40 h-24 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-sm shadow-md">
              📷
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Camera Capture</h3>
              <p className="text-[11px] text-slate-400">Position your face inside the viewfinder</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            title="Close Camera"
          >
            ✕
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-[#07090E] border-2 border-white/15 shadow-inner flex items-center justify-center mb-5">
          {cameraError ? (
            <div className="p-5 text-center text-rose-300 text-xs">
              <span className="text-2xl block mb-2">⚠️</span>
              <p className="font-semibold mb-1">Camera Unavailable</p>
              <p className="text-[11px] text-slate-400 mb-3">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : capturedPhoto ? (
            /* Snapshot Preview */
            <div className="relative w-full h-full">
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-emerald-400 font-bold border border-emerald-500/30">
                ✓ Photo Ready
              </div>
            </div>
          ) : (
            /* Live Stream Video */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {/* Circular Portrait Target Guide */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-400/40 pointer-events-none animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
              </div>

              {isInitializing && (
                <div className="absolute inset-0 bg-[#07090E]/90 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  <span>Starting camera...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-center gap-3">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>🔄</span>
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <span>✓</span>
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSnap}
                disabled={isInitializing || !!cameraError}
                className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
              >
                <span className="text-sm">📸</span>
                <span>Take Photo</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
