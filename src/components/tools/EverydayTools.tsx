import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { soundEffects } from '../../utils/audio';
import {
  QrCode,
  Dices,
  Palette,
  SunMedium,
  AlignJustify,
  Copy,
  Check,
  Download,
  Camera,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';

interface EverydayToolsProps {
  toolId: string;
  soundEnabled?: boolean;
}

export const EverydayTools: React.FC<EverydayToolsProps> = ({ toolId, soundEnabled = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (contentToCopy: string) => {
    if (!contentToCopy) return;
    soundEffects.playTap(soundEnabled);
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- QR CODE GENERATOR ---
  const [qrText, setQrText] = useState('https://toolbox.app');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (toolId === 'qr_generator' && qrText) {
      QRCode.toDataURL(qrText, { width: 300, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [toolId, qrText]);

  // --- QR CODE SCANNER (On-Demand Permission) ---
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showSettingsInfo, setShowSettingsInfo] = useState(false);
  const [fileScanError, setFileScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera when tool changes or unmounts
  const stopCameraStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [toolId]);

  const requestCameraPermissionAndStart = async () => {
    soundEffects.playTap(soundEnabled);
    setCameraStatus('requesting');
    setScanResult(null);
    setFileScanError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      mediaStreamRef.current = stream;
      setCameraStatus('active');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err) {
      console.warn('Camera access error or denied:', err);
      setCameraStatus('denied');
    }
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || cameraStatus !== 'active') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        soundEffects.playCompletionChime(soundEnabled);
        setScanResult(code.data);
        stopCameraStream();
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleFileUploadScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playTap(soundEnabled);
    setFileScanError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            soundEffects.playCompletionChime(soundEnabled);
            setScanResult(code.data);
          } else {
            setFileScanError('No QR code detected in the selected image. Try another photo.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- RANDOM & PASSWORD GENERATOR ---
  const [minNum, setMinNum] = useState('1');
  const [maxNum, setMaxNum] = useState('100');
  const [randomResult, setRandomResult] = useState<number | null>(null);

  const [passLength, setPassLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generatedPass, setGeneratedPass] = useState('');

  const generateRandomNum = () => {
    soundEffects.playTap(soundEnabled);
    const min = parseInt(minNum) || 1;
    const max = parseInt(maxNum) || 100;
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomResult(res);
  };

  const generatePassword = () => {
    soundEffects.playTap(soundEnabled);
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let pass = '';
    for (let i = 0; i < passLength; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPass(pass);
  };

  // --- COLOR PICKER ---
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  // --- FLASHLIGHT / SCREEN LIGHT ---
  const [flashlightOn, setFlashlightOn] = useState(false);

  const toggleFlashlight = () => {
    soundEffects.playTap(soundEnabled);
    setFlashlightOn(!flashlightOn);
  };

  // RENDER BASED ON TOOL ID
  if (toolId === 'qr_generator') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-center">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <QrCode size={18} /> QR Code Generator
        </h3>

        <input
          type="text"
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="Enter text or URL..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-hidden"
        />

        {qrDataUrl && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-2xl inline-block border border-slate-200 shadow-xs">
              <img src={qrDataUrl} alt="Generated QR" className="w-48 h-48 mx-auto" />
            </div>
            <div>
              <a
                href={qrDataUrl}
                download="qrcode.png"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
              >
                <Download size={16} /> Download QR PNG
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'qr_scanner') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 text-base">
            <Camera size={20} className="text-indigo-600 dark:text-indigo-400" /> QR Code Scanner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan QR codes using your device camera or upload an image file
          </p>
        </div>

        {/* Hidden Canvas for Live Video Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan Result Banner */}
        {scanResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Check size={16} /> QR Code Decoded!
              </span>
              <button
                onClick={() => setScanResult(null)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/50 break-all text-xs font-mono font-bold text-slate-900 dark:text-white">
              {scanResult}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleCopy(scanResult)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Result'}
              </button>
              {scanResult.startsWith('http://') || scanResult.startsWith('https://') ? (
                <a
                  href={scanResult}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={14} /> Open Link
                </a>
              ) : null}
            </div>
          </div>
        )}

        {/* Camera Feed / Controls Container */}
        <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-4 relative overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
          {/* Active Camera Feed */}
          {cameraStatus === 'active' && (
            <div className="w-full space-y-3 text-center">
              <div className="relative w-full max-w-xs mx-auto h-52 rounded-xl overflow-hidden bg-black border-2 border-indigo-500 shadow-md">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-indigo-400/70 rounded-xl m-4 pointer-events-none animate-pulse" />
              </div>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Align QR code within camera view...
              </p>
              <button
                onClick={stopCameraStream}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-700"
              >
                Stop Camera
              </button>
            </div>
          )}

          {/* Idle State - Explaining camera need */}
          {cameraStatus === 'idle' && (
            <div className="text-center space-y-3 py-2 max-w-sm">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl inline-block">
                <Camera size={36} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ready to Scan QR Code
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  QR Code Scanner requires camera permission to scan physical codes.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={requestCameraPermissionAndStart}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Camera size={16} /> Enable Camera & Scan
                </button>

                <label className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} /> Scan QR from Photo File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadScan}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Requesting Camera Permission */}
          {cameraStatus === 'requesting' && (
            <div className="text-center space-y-3 py-6">
              <RefreshCw size={32} className="mx-auto text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Requesting Camera Access...
              </p>
              <p className="text-[11px] text-slate-400">
                Please confirm the prompt to enable video scanning.
              </p>
            </div>
          )}

          {/* Denied Camera Permission */}
          {cameraStatus === 'denied' && (
            <div className="text-center space-y-3 py-2 max-w-sm">
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl inline-block">
                <ShieldAlert size={36} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                  Camera access is required to scan QR codes.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Permission was denied or blocked by your browser/device settings.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={requestCameraPermissionAndStart}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Try Requesting Permission Again
                </button>

                <button
                  onClick={() => setShowSettingsInfo(!showSettingsInfo)}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  {showSettingsInfo ? 'Hide Settings Instructions' : 'How to Enable in App Settings'}
                </button>

                <label className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={14} /> Scan Photo File Instead
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadScan}
                    className="hidden"
                  />
                </label>
              </div>

              {showSettingsInfo && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Android / Browser Settings Guide:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 opacity-90">
                    <li>Open device <strong>Settings → Apps → ToolBox</strong>.</li>
                    <li>Tap <strong>Permissions → Camera</strong>.</li>
                    <li>Select <strong>Allow only while using the app</strong>.</li>
                    <li>Return here and tap "Try Requesting Permission Again".</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* File Scan Error Message */}
          {fileScanError && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{fileScanError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (toolId === 'random_generator') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Dices size={18} /> Random Number & Password
        </h3>

        {/* Random Number */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Random Number</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Min</label>
              <input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(e.target.value)}
                className="w-full mt-1 p-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Max</label>
              <input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(e.target.value)}
                className="w-full mt-1 p-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            onClick={generateRandomNum}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Generate Random Number
          </button>

          {randomResult !== null && (
            <div className="text-center text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {randomResult}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Password Generator</span>
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Length</span>
              <span>{passLength} chars</span>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              value={passLength}
              onChange={(e) => setPassLength(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="flex gap-3 text-xs font-semibold">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
              />
              ABC
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
              />
              123
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
              />
              !@#
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
          >
            Generate Password
          </button>

          {generatedPass && (
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-mono font-bold">
              <span className="truncate max-w-[200px] text-purple-600 dark:text-purple-400">
                {generatedPass}
              </span>
              <button
                onClick={() => handleCopy(generatedPass)}
                className="p-1 text-slate-500 hover:text-purple-600"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (toolId === 'color_picker') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette size={18} /> Color Picker
        </h3>

        <div className="flex items-center gap-4">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent"
          />
          <div className="space-y-1">
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase">
              {selectedColor}
            </div>
            <button
              onClick={() => handleCopy(selectedColor)}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} Copy HEX Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'screen_flashlight') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-center">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <SunMedium size={18} /> Flashlight & Screen Torch
        </h3>

        <button
          onClick={toggleFlashlight}
          className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            flashlightOn
              ? 'bg-amber-400 text-slate-900 shadow-amber-400/40 ring-8 ring-amber-200'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
        >
          <SunMedium size={48} />
        </button>

        <p className="text-xs font-semibold text-slate-500">
          {flashlightOn ? 'Screen & Torch Light ACTIVE' : 'Tap button to activate torch'}
        </p>

        {flashlightOn && (
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <button
              onClick={toggleFlashlight}
              className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-xs"
            >
              Tap Anywhere to Turn Off Screen Light
            </button>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'ruler') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlignJustify size={18} /> On-Screen Ruler (Scale)
        </h3>

        <div className="w-full bg-amber-100 border border-amber-300 rounded-xl p-3 h-32 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-800">
            {Array.from({ length: 15 }).map((_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
          <div className="flex justify-between items-end h-8">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={i}
                className={`bg-slate-800 w-[1px] ${i % 3 === 0 ? 'h-full' : 'h-1/2'}`}
              />
            ))}
          </div>
          <div className="text-[10px] font-bold text-slate-600 text-center uppercase tracking-wider">
            Centimeters (cm)
          </div>
        </div>
      </div>
    );
  }

  return null;
};

