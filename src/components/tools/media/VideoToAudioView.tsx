import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';
import { download } from '../../../utils/storage';
import {
  OutputAudioFormat,
  VideoMetadata,
  ExtractionResult,
  getVideoMetadata,
  extractAudioFromVideo,
} from '../../../utils/audioExtractor';

export const VideoToAudioView: React.FC = () => {
  const { toast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // Selection states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<OutputAudioFormat>('M4A');

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result states
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Audio preview playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Cleanup object URLs on unmount or reset
  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('video/') && !/\.(mp4|mkv|mov|avi|webm|3gp|flv|wmv)$/i.test(file.name)) {
        toast('Please select a valid video file');
        return;
      }

      // Check max limit (1GB)
      if (file.size > 1024 * 1024 * 1024) {
        toast('Selected file exceeds 1GB limit');
        return;
      }

      setSelectedFile(file);
      setResult(null);
      setErrorMessage(null);
      setIsLoadingMeta(true);

      try {
        const meta = await getVideoMetadata(file);
        setVideoMeta(meta);
        toast(`Loaded ${file.name}`);
      } catch (err) {
        console.warn('Metadata inspection fallback:', err);
      } finally {
        setIsLoadingMeta(false);
      }
    }
  };

  const handleStartExtraction = async () => {
    if (!selectedFile) {
      toast('Please select a video file first');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Preparing video for audio extraction...');
    setErrorMessage(null);

    try {
      const extraction = await extractAudioFromVideo(
        selectedFile,
        selectedFormat,
        (pct, status) => {
          setProgress(pct);
          setStatusMessage(status);
        }
      );

      setResult(extraction);
      setIsProcessing(false);
      toast('Audio extracted successfully!');
    } catch (err: any) {
      console.error('Audio extraction error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to extract audio from this video file.');
      toast('Extraction failed');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    download(result.url, result.fileName);
    toast(`Downloading ${result.fileName}`);
  };

  const handleReset = () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setSelectedFile(null);
    setVideoMeta(null);
    setResult(null);
    setIsProcessing(false);
    setErrorMessage(null);
    setIsPlaying(false);
    setCurrentTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAudioPlay = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  const formatPlaybackTime = (time: number) => {
    if (isNaN(time) || time < 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormatRecommendation = (format: OutputAudioFormat): string => {
    switch (format) {
      case 'M4A':
        return 'Recommended - best compatibility';
      case 'AAC':
        return 'High quality - pure audio stream';
      case 'MP3':
        return 'Universal compatibility - plays on all devices';
      case '3GP':
        return 'Compact mobile format - low file size';
      default:
        return 'Recommended - best compatibility';
    }
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Video to Audio" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mkv,.mov,.avi,.webm,.3gp,.flv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. Select Video Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '26px',
              border: '1.5px solid var(--bd)',
              background: 'var(--s2)',
              color: 'var(--tx)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ color: 'var(--ac)', display: 'flex', alignItems: 'center' }}>
              <Icon name="video" size={20} />
            </div>
            <span>Select Video</span>
          </button>

          {/* Selected Video Details Card */}
          {selectedFile && (
            <div
              className="glass"
              style={{
                padding: '14px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid var(--bd)',
              }}
            >
              {videoMeta?.thumbnail ? (
                <img
                  src={videoMeta.thumbnail}
                  alt="Video thumbnail"
                  style={{
                    width: '64px',
                    height: '48px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '1px solid var(--bd)',
                    background: '#000',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '54px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--s2)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--ac)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="video" size={24} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: 'var(--tx)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {selectedFile.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--mut)', fontWeight: 600 }}>
                    {videoMeta?.formattedSize || `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                  {videoMeta?.formattedDuration && videoMeta.formattedDuration !== '00:00' && (
                    <>
                      <span style={{ fontSize: '10px', color: 'var(--dim)' }}>•</span>
                      <span style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: 700 }}>
                        {videoMeta.formattedDuration}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mut)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Remove video"
              >
                <Icon name="trash" size={17} />
              </button>
            </div>
          )}

          {/* 2. Output Format Card */}
          <div
            className="glass"
            style={{
              padding: '18px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tx)' }}>
              Output Format
            </span>

            {/* 4 Format Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {(['M4A', 'AAC', 'MP3', '3GP'] as OutputAudioFormat[]).map((fmt) => {
                const isSelected = selectedFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    style={{
                      height: '42px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid var(--ac)' : '1px solid var(--bd)',
                      background: isSelected ? 'rgba(198, 255, 61, 0.16)' : 'var(--s2)',
                      color: isSelected ? 'var(--ac)' : 'var(--tx)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(198, 255, 61, 0.2)' : 'none',
                    }}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>

            {/* Recommendation Caption */}
            <span style={{ fontSize: '11.5px', color: 'var(--mut)', fontWeight: 500 }}>
              {getFormatRecommendation(selectedFormat)}
            </span>
          </div>

          {/* Conversion Progress Bar (when active) */}
          {isProcessing && (
            <div
              className="glass"
              style={{
                padding: '16px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid rgba(198, 255, 61, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ color: 'var(--tx)' }}>{statusMessage}</span>
                <span style={{ color: 'var(--ac)' }}>{progress}%</span>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'var(--s2)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    borderRadius: '4px',
                    background: 'linear-gradient(90deg, var(--ac), var(--cy))',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* 3. Primary Extract Audio Button */}
          <button
            type="button"
            className="btn"
            onClick={handleStartExtraction}
            disabled={!selectedFile || isProcessing || isLoadingMeta}
            style={{
              height: '50px',
              borderRadius: '25px',
              fontSize: '15px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: !selectedFile || isProcessing || isLoadingMeta ? 0.5 : 1,
              cursor: !selectedFile || isProcessing || isLoadingMeta ? 'not-allowed' : 'pointer',
            }}
          >
            <Icon name="music" size={18} />
            <span>{isProcessing ? `Extracting Audio (${progress}%)...` : 'Extract Audio'}</span>
          </button>

          {/* 4. Note Card (matching reference screenshot) */}
          <div
            className="glass"
            style={{
              padding: '18px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--tx)' }}>
              Note
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--mut)',
                lineHeight: 1.5,
              }}
            >
              <div>• Audio is extracted directly without re-encoding</div>
              <div>• Output quality depends on source video audio</div>
              <div>• M4A/AAC work best with most videos</div>
            </div>
          </div>
        </div>
      ) : (
        /* Success Screen */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hidden HTML5 Audio Element for preview playback */}
          <audio
            ref={audioPlayerRef}
            src={result.url}
            onTimeUpdate={() => {
              if (audioPlayerRef.current) {
                setCurrentTime(audioPlayerRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioPlayerRef.current) {
                setAudioDuration(audioPlayerRef.current.duration || result.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
          />

          {/* Success Banner Card */}
          <div
            className="glass"
            style={{
              padding: '24px 18px',
              borderRadius: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              border: '1.5px solid var(--ac)',
              boxShadow: '0 8px 32px rgba(198, 255, 61, 0.16)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(198, 255, 61, 0.18)',
                color: 'var(--ac)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 20px rgba(198, 255, 61, 0.3)',
              }}
            >
              <Icon name="check" size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--tx)', margin: 0 }}>
              Audio Extracted Successfully
            </h3>

            <p style={{ fontSize: '12px', color: 'var(--mut)', margin: 0 }}>
              {result.isLosslessRemuxed
                ? `Losslessly extracted native audio stream without re-encoding.`
                : `Transcoded high-fidelity audio stream to ${result.format}.`}
            </p>

            {/* Audio Details Pill */}
            <div
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '16px',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '6px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(198, 255, 61, 0.12)',
                  color: 'var(--ac)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="music" size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'var(--tx)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {result.fileName}
                </span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--mut)', marginTop: '2px' }}>
                  <span>{result.formattedSize}</span>
                  <span>•</span>
                  <span>{result.formattedDuration}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--ac)', fontWeight: 700 }}>{result.format}</span>
                </div>
              </div>
            </div>

            {/* Audio Preview Player */}
            <div
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={toggleAudioPlay}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--ac)',
                    color: 'var(--onac, #111)',
                    border: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(198, 255, 61, 0.4)',
                    flexShrink: 0,
                  }}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <Icon name={isPlaying ? 'pause' : 'play'} size={18} color="#111" />
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 1}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCurrentTime(val);
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.currentTime = val;
                      }
                    }}
                    style={{ width: '100%', accentColor: 'var(--ac)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--mut)' }}>
                    <span>{formatPlaybackTime(currentTime)}</span>
                    <span>{formatPlaybackTime(audioDuration || result.duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action 1: Download Audio Button */}
          <button
            type="button"
            className="btn"
            onClick={handleDownload}
            style={{
              height: '50px',
              borderRadius: '25px',
              fontSize: '15px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Icon name="download" size={18} />
            <span>Download Audio ({result.format})</span>
          </button>

          {/* Action 2: Convert Another Video Button */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              height: '48px',
              borderRadius: '24px',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              color: 'var(--tx)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Icon name="reset" size={16} />
            <span>Convert Another Video</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoToAudioView;
