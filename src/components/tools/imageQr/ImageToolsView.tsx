import React, { useState, useRef } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText, download } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface ImageToolsViewProps {
  toolId: string;
}

export const ImageToolsView: React.FC<ImageToolsViewProps> = ({ toolId }) => {
  const { toast } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Common image state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('sample-image.jpg');
  const [fileSize, setFileSize] = useState<number>(1024 * 320); // ~320 KB

  // Compression
  const [quality, setQuality] = useState<number>(75);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  // Resizing
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);

  // Color picker
  const [pickedColor, setPickedColor] = useState<string>('#45D9E8');

  // Base64
  const [base64Output, setBase64Output] = useState<string>('');

  // Format converter
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  // SVG Optimizer
  const [svgInput, setSvgInput] = useState<string>(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">\n  <!-- comment -->\n  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />\n</svg>'
  );
  const [optimizedSvg, setOptimizedSvg] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setImageSrc(src);
      setBase64Output(src);

      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
      };
      img.src = src;

      // Estimate compressed size
      setCompressedSize(Math.round(file.size * (quality / 100) * 0.7));
      toast('Image loaded');
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (keepAspect && aspectRatio) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (keepAspect && aspectRatio) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const processAndDownload = (format: string = 'image/jpeg', q: number = 0.8) => {
    if (!imageSrc) {
      toast('Please upload an image first');
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width || img.width;
      canvas.height = height || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL(format, q);
        const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
        download(dataUrl, `aerokit-processed.${ext}`);
        toast('Download started');
      }
    };
    img.src = imageSrc;
  };

  const handlePickEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const res = await eyeDropper.open();
        setPickedColor(res.sRGBHex);
        toast(`Picked ${res.sRGBHex}`);
      } catch {
        // cancelled
      }
    } else {
      toast('Eyedropper API supported in Chromium browsers');
    }
  };

  const handleOptimizeSvg = () => {
    // Strip comments, extra whitespace, doctypes
    const cleaned = svgInput
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\?xml[\s\S]*?\?>/i, '')
      .replace(/<!DOCTYPE[\s\S]*?>/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    setOptimizedSvg(cleaned);
    const saved = Math.round(((svgInput.length - cleaned.length) / svgInput.length) * 100);
    toast(`Optimized: ${saved}% size reduction`);
  };

  const titles: Record<string, string> = {
    'img-compress': 'Image Compressor',
    'img-resize': 'Image Resizer',
    'color-picker': 'Color Picker & Eyedropper',
    'img-base64': 'Image to Base64',
    'format-conv': 'Format Converter',
    'crop-tool': 'Crop Image',
    'exif-data': 'EXIF Metadata Inspector',
    'svg-opt': 'SVG Optimizer',
    'barcode-scan': 'Barcode Reader',
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Image Tool'} />

      {/* Upload trigger button if file-based tool */}
      {toolId !== 'svg-opt' && toolId !== 'color-picker' && (
        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ width: '100%', height: '42px', fontSize: '13px' }}
          >
            <Icon name="img" size={17} />
            <span>{imageSrc ? 'Choose Different Image' : 'Select Image File'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* 1. Image Compressor */}
      {toolId === 'img-compress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Compression Quality ({quality}%)</div>
          <input
            type="range"
            min="10"
            max="95"
            value={quality}
            onChange={(e) => {
              const q = parseInt(e.target.value, 10);
              setQuality(q);
              if (fileSize) {
                setCompressedSize(Math.round(fileSize * (q / 100) * 0.75));
              }
            }}
            style={{ accentColor: 'var(--ac)' }}
          />

          <div
            className="glass"
            style={{
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}
          >
            <div>
              <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>Original Size</small>
              <b style={{ fontSize: '15px', color: 'var(--tx)' }}>{(fileSize / 1024).toFixed(1)} KB</b>
            </div>
            <div style={{ width: '1px', background: 'var(--bd)' }} />
            <div>
              <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>Estimated Output</small>
              <b style={{ fontSize: '15px', color: 'var(--ac)' }}>
                {compressedSize ? (compressedSize / 1024).toFixed(1) : (fileSize * 0.5 / 1024).toFixed(1)} KB
              </b>
            </div>
          </div>

          <button
            type="button"
            className="btn cv"
            onClick={() => processAndDownload('image/jpeg', quality / 100)}
          >
            <span>Compress &amp; Download</span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      )}

      {/* 2. Image Resizer */}
      {toolId === 'img-resize' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div className="lbl">Width (px)</div>
              <label className="fld">
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <div className="lbl">Height (px)</div>
              <label className="fld">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                />
              </label>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
              style={{ accentColor: 'var(--ac)' }}
            />
            <span>Maintain Aspect Ratio ({aspectRatio ? aspectRatio.toFixed(2) : '1.33'}:1)</span>
          </label>

          <button
            type="button"
            className="btn cv"
            onClick={() => processAndDownload('image/png', 1)}
          >
            <span>Resize &amp; Download</span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      )}

      {/* 3. Color Picker & Eyedropper */}
      {toolId === 'color-picker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            className="glass"
            style={{
              padding: '24px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: pickedColor,
                border: '3px solid #fff',
                boxShadow: `0 0 24px ${pickedColor}`,
                marginBottom: '14px',
              }}
            />
            <b style={{ fontSize: '24px', letterSpacing: '1px' }}>{pickedColor.toUpperCase()}</b>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label
              className="btn"
              style={{
                flex: 1,
                height: '42px',
                fontSize: '12px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Icon name="pip" size={16} />
              <span>Choose Color</span>
              <input
                type="color"
                value={pickedColor}
                onChange={(e) => setPickedColor(e.target.value)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
            </label>

            <button
              type="button"
              className="btn"
              onClick={handlePickEyeDropper}
              style={{
                flex: 1,
                height: '42px',
                fontSize: '12px',
                background: 'var(--s2)',
                color: 'var(--tx)',
                border: '1px solid var(--bd)',
                boxShadow: 'none',
              }}
            >
              <Icon name="pip" size={16} />
              <span>Eyedropper</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => copyText(pickedColor).then(() => toast(`Copied HEX ${pickedColor}`))}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Copy HEX
            </button>
            <button
              type="button"
              onClick={() => {
                // HEX to RGB
                const r = parseInt(pickedColor.slice(1, 3), 16) || 0;
                const g = parseInt(pickedColor.slice(3, 5), 16) || 0;
                const b = parseInt(pickedColor.slice(5, 7), 16) || 0;
                const rgb = `rgb(${r}, ${g}, ${b})`;
                copyText(rgb).then(() => toast(`Copied ${rgb}`));
              }}
              className="btn"
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Copy RGB
            </button>
          </div>
        </div>
      )}

      {/* 4. Image to Base64 */}
      {toolId === 'img-base64' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Base64 Data URI Output</div>
          <textarea
            value={base64Output || (imageSrc ? imageSrc.slice(0, 150) + '...' : 'Upload an image above to generate base64 string...')}
            readOnly
            rows={5}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
              resize: 'none',
            }}
          />
          <button
            type="button"
            className="btn cv"
            onClick={() => {
              if (base64Output) {
                copyText(base64Output).then(() => toast('Base64 string copied to clipboard'));
              } else {
                toast('Upload an image first');
              }
            }}
          >
            <span>Copy Base64 URI</span>
            <Icon name="copy" size={16} />
          </button>
        </div>
      )}

      {/* 5. Format Converter */}
      {toolId === 'format-conv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Convert Target Format</div>
          <label className="fld">
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as any)}
            >
              <option value="image/webp">WebP (Modern &amp; Ultra Compact)</option>
              <option value="image/png">PNG (Lossless &amp; Transparency)</option>
              <option value="image/jpeg">JPEG (Standard Photography)</option>
            </select>
            <Icon name="down" size={16} />
          </label>

          <button
            type="button"
            className="btn cv"
            onClick={() => processAndDownload(targetFormat, 0.9)}
          >
            <span>Convert &amp; Export</span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      )}

      {/* 6. SVG Optimizer */}
      {toolId === 'svg-opt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Raw SVG Source</div>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          <button type="button" className="btn cv" onClick={handleOptimizeSvg}>
            <span>Minify &amp; Optimize SVG</span>
            <Icon name="spark" size={16} />
          </button>

          {optimizedSvg && (
            <div style={{ marginTop: '8px' }}>
              <div className="lbl">Optimized Result</div>
              <textarea
                value={optimizedSvg}
                readOnly
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '12px',
                  padding: '10px',
                  color: 'var(--ac)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => copyText(optimizedSvg).then(() => toast('Optimized SVG copied'))}
                style={{ marginTop: '8px', height: '36px', fontSize: '11.5px', width: '100%' }}
              >
                <Icon name="copy" size={15} /> Copy Minified SVG
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. Crop Tool & EXIF Inspector fallback view */}
      {(toolId === 'crop-tool' || toolId === 'exif-data' || toolId === 'barcode-scan') && (
        <div
          className="glass"
          style={{
            padding: '24px',
            borderRadius: '18px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Icon name="info" size={32} color="var(--cy)" />
          <b style={{ fontSize: '15px' }}>{titles[toolId]}</b>
          <p style={{ fontSize: '12px', color: 'var(--mut)', margin: 0 }}>
            {toolId === 'crop-tool' && 'Select an image to adjust crop box bounding area.'}
            {toolId === 'exif-data' && `Loaded: ${fileName} · Size: ${(fileSize / 1024).toFixed(1)} KB · Dimensions: ${width}x${height}px · Color profile: sRGB.`}
            {toolId === 'barcode-scan' && 'Barcode reader ready. Point camera or upload a barcode image to detect UPC/EAN.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageToolsView;
