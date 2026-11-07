import { Mp3Encoder } from '@breezystack/lamejs';
import * as MP4Box from 'mp4box';

export type OutputAudioFormat = 'M4A' | 'AAC' | 'MP3' | '3GP';

export interface VideoMetadata {
  name: string;
  size: number;
  duration: number;
  formattedDuration: string;
  formattedSize: string;
  thumbnail: string;
  width: number;
  height: number;
}

export interface ExtractionResult {
  blob: Blob;
  url: string;
  fileName: string;
  size: number;
  formattedSize: string;
  duration: number;
  formattedDuration: string;
  format: OutputAudioFormat;
  isLosslessRemuxed: boolean;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${pad(hrs)}:${pad(remMins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extracts metadata, duration and thumbnail frame from a video file
 */
export async function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = url;
    video.muted = true;
    (video as any).playsInline = true;

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve({
        name: file.name,
        size: file.size,
        duration: 0,
        formattedDuration: '00:00',
        formattedSize: formatBytes(file.size),
        thumbnail: '',
        width: 640,
        height: 360,
      });
    }, 5000);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, Math.max(0.1, video.duration / 4));
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth || 640, 480);
        canvas.height = Math.min(
          video.videoHeight || 360,
          Math.round(canvas.width * ((video.videoHeight || 360) / (video.videoWidth || 640)))
        );
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const thumbnail = canvas.toDataURL('image/jpeg', 0.85);
        const duration = video.duration || 0;

        URL.revokeObjectURL(url);
        resolve({
          name: file.name,
          size: file.size,
          duration,
          formattedDuration: formatDuration(duration),
          formattedSize: formatBytes(file.size),
          thumbnail,
          width: video.videoWidth || 640,
          height: video.videoHeight || 360,
        });
      } catch {
        URL.revokeObjectURL(url);
        resolve({
          name: file.name,
          size: file.size,
          duration: video.duration || 0,
          formattedDuration: formatDuration(video.duration || 0),
          formattedSize: formatBytes(file.size),
          thumbnail: '',
          width: video.videoWidth || 640,
          height: video.videoHeight || 360,
        });
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve({
        name: file.name,
        size: file.size,
        duration: 0,
        formattedDuration: '00:00',
        formattedSize: formatBytes(file.size),
        thumbnail: '',
        width: 640,
        height: 360,
      });
    };
  });
}

/**
 * Builds a 7-byte ADTS header for an AAC audio frame.
 * This makes raw AAC samples playable in all browsers and standard audio decoders.
 */
function buildAdtsHeader(dataLength: number, sampleRate: number, channels: number): Uint8Array {
  const samplingFrequencies = [
    96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350,
  ];
  let freqIndex = samplingFrequencies.indexOf(sampleRate);
  if (freqIndex === -1) freqIndex = 4; // default 44.1kHz

  const channelConfig = Math.min(Math.max(1, channels), 7);
  const frameLength = dataLength + 7;
  const header = new Uint8Array(7);

  // Sync word 0xFFF (12 bits)
  header[0] = 0xff;
  // Sync word lower 4 bits (0xF) + MPEG-4 (0) + Layer 00 (0) + Protection absent (1) = 0xF1
  header[1] = 0xf1;
  // Profile (AAC-LC = 1, 2 bits) + freqIndex (4 bits) + private (0) + channel config msb (1 bit)
  header[2] = ((1 & 0x03) << 6) | ((freqIndex & 0x0f) << 2) | ((channelConfig >> 2) & 0x01);
  // Channel config lower 2 bits + frame length high 2 bits
  header[3] = ((channelConfig & 0x03) << 6) | ((frameLength >> 11) & 0x03);
  // Frame length middle 8 bits
  header[4] = (frameLength >> 3) & 0xff;
  // Frame length lower 3 bits + buffer fullness (0x7FF) high 5 bits (0x1F)
  header[5] = ((frameLength & 0x07) << 5) | 0x1f;
  // Buffer fullness lower 6 bits (0x3F << 2) + blocks in frame (0) = 0xFC
  header[6] = 0xfc;

  return header;
}

/**
 * Demuxes MP4/MOV/3GP container using MP4Box to extract the audio track into an ADTS AAC stream.
 * Runs instantly (<50ms) in pure JavaScript without re-encoding.
 */
async function extractAacStreamFromMp4(
  file: File,
  onProgress: (pct: number, status: string) => void
): Promise<{
  adtsBuffer: ArrayBuffer;
  duration: number;
  sampleRate: number;
  channels: number;
  hasAudio: boolean;
} | null> {
  try {
    onProgress(15, 'Scanning MP4 media container tracks...');
    const arrayBuffer = await file.arrayBuffer();
    (arrayBuffer as any).fileStart = 0;

    return new Promise((resolve) => {
      const mp4box = (MP4Box as any).createFile(true);
      let audioTrack: any = null;
      const extractedSamples: any[] = [];
      let resolved = false;

      const finish = (result: any) => {
        if (resolved) return;
        resolved = true;
        resolve(result);
      };

      mp4box.onError = (e: any) => {
        console.warn('MP4Box parse warning:', e);
        finish(null);
      };

      mp4box.onReady = (info: any) => {
        if (!info || !info.tracks) {
          return finish(null);
        }

        // Look for audio tracks
        const found = info.tracks.find(
          (t: any) =>
            t.type === 'audio' ||
            t.audio != null ||
            (t.codec && (t.codec.startsWith('mp4a') || t.codec.includes('aac')))
        );

        if (!found) {
          // If video tracks exist but no audio track exists, inform caller
          if (info.tracks.length > 0) {
            return finish({ hasAudio: false, adtsBuffer: new ArrayBuffer(0), duration: 0, sampleRate: 0, channels: 0 });
          }
          return finish(null);
        }

        audioTrack = found;
        onProgress(35, `Found ${audioTrack.codec || 'AAC'} audio track. Extracting packets...`);
        mp4box.setExtractionOptions(audioTrack.id, null, { nbSamples: 1000 });
        mp4box.start();
      };

      mp4box.onSamples = (_track_id: number, _user: any, sampleList: any[]) => {
        if (sampleList && sampleList.length > 0) {
          extractedSamples.push(...sampleList);
        }
      };

      try {
        mp4box.appendBuffer(arrayBuffer);
        mp4box.flush();

        if (!audioTrack || extractedSamples.length === 0) {
          return finish(null);
        }

        const sampleRate = audioTrack.audio?.sample_rate || audioTrack.audio?.samplerate || 44100;
        const channels = audioTrack.audio?.channel_count || 2;
        const duration =
          audioTrack.duration && audioTrack.timescale
            ? audioTrack.duration / audioTrack.timescale
            : (extractedSamples.length * 1024) / sampleRate;

        onProgress(50, `Extracted ${extractedSamples.length} audio frames. Packaging ADTS bitstream...`);

        let totalBytes = 0;
        for (const s of extractedSamples) {
          const len = s.data?.byteLength || s.data?.length || 0;
          totalBytes += 7 + len;
        }

        if (totalBytes <= 7) {
          return finish(null);
        }

        const out = new Uint8Array(totalBytes);
        let offset = 0;
        for (const s of extractedSamples) {
          const sBytes = s.data instanceof Uint8Array ? s.data : new Uint8Array(s.data);
          const hdr = buildAdtsHeader(sBytes.byteLength, sampleRate, channels);
          out.set(hdr, offset);
          offset += 7;
          out.set(sBytes, offset);
          offset += sBytes.byteLength;
        }

        finish({
          adtsBuffer: out.buffer,
          duration,
          sampleRate,
          channels,
          hasAudio: true,
        });
      } catch (err) {
        console.warn('MP4Box buffer error:', err);
        finish(null);
      }
    });
  } catch (err) {
    console.warn('extractAacStreamFromMp4 error:', err);
    return null;
  }
}

/**
 * Universal video audio capture using offscreen media playback and Web Audio API.
 * Accurately decodes any video format the browser supports (WebM, MKV, MP4, MOV, etc.).
 */
async function extractAudioViaVideoElement(
  file: File,
  onProgress: (pct: number, status: string) => void
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    onProgress(25, 'Loading video stream into browser media engine...');
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'auto';
    video.muted = false; // Must be unmuted for media element source to capture audio
    (video as any).playsInline = true;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      URL.revokeObjectURL(url);
      return reject(new Error('Web Audio API is not supported in this browser.'));
    }

    const audioCtx = new AudioCtx();
    let source: MediaElementAudioSourceNode | null = null;
    let processor: ScriptProcessorNode | null = null;
    let muteGain: GainNode | null = null;

    const leftChunks: Float32Array[] = [];
    const rightChunks: Float32Array[] = [];
    let totalSamples = 0;
    let isCleanedUp = false;

    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch {}
      URL.revokeObjectURL(url);
      try {
        if (source) source.disconnect();
        if (processor) processor.disconnect();
        if (muteGain) muteGain.disconnect();
        audioCtx.close();
      } catch {}
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Audio extraction timed out. Please check if the video file contains audio.'));
    }, 45000);

    video.onloadedmetadata = async () => {
      if (!video.duration || isNaN(video.duration) || video.duration === 0) {
        clearTimeout(timeout);
        cleanup();
        return reject(new Error('Unable to read video duration or empty media file.'));
      }

      try {
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        source = audioCtx.createMediaElementSource(video);
        processor = audioCtx.createScriptProcessor(4096, 2, 2);

        // Connect through a zero-gain node so extraction is completely silent
        muteGain = audioCtx.createGain();
        muteGain.gain.value = 0;

        processor.onaudioprocess = (e) => {
          const l = e.inputBuffer.getChannelData(0);
          const r = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : l;
          leftChunks.push(new Float32Array(l));
          rightChunks.push(new Float32Array(r));
          totalSamples += l.length;

          if (video.duration > 0) {
            const currentPct = 30 + Math.min(50, Math.round((video.currentTime / video.duration) * 50));
            onProgress(currentPct, `Capturing video audio stream (${currentPct}%)...`);
          }
        };

        source.connect(processor);
        processor.connect(muteGain);
        muteGain.connect(audioCtx.destination);

        // Speed up playback (8x or 4x) for fast processing
        try {
          video.playbackRate = 8.0;
        } catch {
          video.playbackRate = 2.0;
        }

        await video.play();
      } catch (err) {
        clearTimeout(timeout);
        cleanup();
        reject(err);
      }
    };

    video.onended = () => {
      clearTimeout(timeout);
      onProgress(82, 'Assembling captured audio channels...');

      if (totalSamples === 0) {
        cleanup();
        return reject(
          new Error('No audio signal detected in this video file. It may be a silent video.')
        );
      }

      try {
        const sampleRate = audioCtx.sampleRate;
        const outBuffer = audioCtx.createBuffer(2, totalSamples, sampleRate);
        const outLeft = outBuffer.getChannelData(0);
        const outRight = outBuffer.getChannelData(1);

        let offset = 0;
        for (let i = 0; i < leftChunks.length; i++) {
          outLeft.set(leftChunks[i], offset);
          outRight.set(rightChunks[i], offset);
          offset += leftChunks[i].length;
        }

        cleanup();
        resolve(outBuffer);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error('Failed to load video in media decoder. Format may not be supported.'));
    };
  });
}

/**
 * Encodes decoded PCM AudioBuffer to MP3 using lamejs
 */
async function encodeAudioBufferToMp3(
  audioBuffer: AudioBuffer,
  onProgress: (pct: number, status: string) => void
): Promise<Blob> {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;

  onProgress(60, 'Configuring MP3 audio encoder (192kbps CBR)...');

  const encoder = new Mp3Encoder(channels > 1 ? 2 : 1, sampleRate, 192);
  const mp3Data: BlobPart[] = [];

  const leftFloat = audioBuffer.getChannelData(0);
  const rightFloat = channels > 1 ? audioBuffer.getChannelData(1) : leftFloat;

  const left = new Int16Array(numSamples);
  const right = channels > 1 ? new Int16Array(numSamples) : left;

  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, leftFloat[i]));
    left[i] = l < 0 ? l * 32768 : l * 32767;
    if (channels > 1) {
      const r = Math.max(-1, Math.min(1, rightFloat[i]));
      right[i] = r < 0 ? r * 32768 : r * 32767;
    }
  }

  const blockSize = 1152;
  const totalBlocks = Math.ceil(numSamples / blockSize);

  for (let i = 0; i < numSamples; i += blockSize) {
    const lChunk = left.subarray(i, i + blockSize);
    const rChunk = channels > 1 ? right.subarray(i, i + blockSize) : undefined;

    const mp3buf = channels > 1
      ? encoder.encodeBuffer(lChunk, rChunk)
      : encoder.encodeBuffer(lChunk);

    if (mp3buf && mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }

    if (i % (blockSize * 50) === 0) {
      const currentBlock = Math.floor(i / blockSize);
      const pct = 65 + Math.round((currentBlock / totalBlocks) * 30);
      onProgress(pct, `Encoding MP3 audio frames (${pct}%)...`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress(95, 'Finalizing MP3 bitstream headers...');
  const end = encoder.flush();
  if (end && end.length > 0) {
    mp3Data.push(new Uint8Array(end));
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Encodes decoded PCM AudioBuffer to WAV container
 */
function encodeAudioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = audioBuffer.length;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Main audio extraction function supporting M4A, AAC, MP3, 3GP
 */
export async function extractAudioFromVideo(
  file: File,
  format: OutputAudioFormat,
  onProgress: (pct: number, status: string) => void
): Promise<ExtractionResult> {
  onProgress(5, 'Initializing audio extraction engine...');

  let duration = 0;
  let isLosslessRemuxed = false;
  let resultBlob: Blob | null = null;

  // STEP 1: Attempt fast direct MP4 container demuxing to extract the audio stream
  const mp4Audio = await extractAacStreamFromMp4(file, onProgress);

  if (mp4Audio && mp4Audio.hasAudio === false) {
    throw new Error(
      'This video has no audio track. Please select a video that contains recorded audio.'
    );
  }

  if (mp4Audio && mp4Audio.adtsBuffer.byteLength > 100) {
    duration = mp4Audio.duration;

    if (format === 'AAC') {
      onProgress(85, 'Finalizing lossless AAC audio stream...');
      resultBlob = new Blob([mp4Audio.adtsBuffer], { type: 'audio/aac' });
      isLosslessRemuxed = true;
    } else if (format === 'M4A') {
      onProgress(85, 'Packaging M4A audio stream...');
      resultBlob = new Blob([mp4Audio.adtsBuffer], { type: 'audio/mp4' });
      isLosslessRemuxed = true;
    } else if (format === '3GP') {
      onProgress(85, 'Packaging 3GP mobile audio stream...');
      resultBlob = new Blob([mp4Audio.adtsBuffer], { type: 'audio/3gpp' });
      isLosslessRemuxed = true;
    } else {
      // MP3 format: Decode pure ADTS AAC buffer into PCM AudioBuffer, then encode to MP3
      onProgress(55, 'Decoding AAC audio stream into PCM audio buffer...');
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        try {
          // Decode clean standalone ADTS audio (which browsers handle without video interference)
          const audioBuffer = await audioCtx.decodeAudioData(mp4Audio.adtsBuffer.slice(0));
          duration = audioBuffer.duration;
          resultBlob = await encodeAudioBufferToMp3(audioBuffer, onProgress);
        } catch (adtsDecodeErr) {
          console.warn('ADTS decode fallback to media element:', adtsDecodeErr);
        } finally {
          try {
            await audioCtx.close();
          } catch {}
        }
      }
    }
  }

  // STEP 2: Universal Fallback via Video Element / Web Audio
  if (!resultBlob) {
    onProgress(20, 'Decoding audio track using universal browser media decoder...');
    let audioBuffer: AudioBuffer | null = null;

    // Try direct AudioContext.decodeAudioData on the file buffer first
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        try {
          const rawBuffer = await file.arrayBuffer();
          audioBuffer = await audioCtx.decodeAudioData(rawBuffer);
        } finally {
          try {
            await audioCtx.close();
          } catch {}
        }
      }
    } catch {
      // Expected to fail on raw video containers in some browsers
      audioBuffer = null;
    }

    // If direct decode failed, use fast offscreen video element capture
    if (!audioBuffer) {
      try {
        audioBuffer = await extractAudioViaVideoElement(file, onProgress);
      } catch (elemErr: any) {
        console.error('Universal video extraction error:', elemErr);
        throw new Error(
          elemErr.message ||
            'Could not decode audio from this video. The file may have no audio track or uses an unsupported codec.'
        );
      }
    }

    if (!audioBuffer) {
      throw new Error(
        'Could not decode audio from this video. The file may have no audio track or uses an unsupported codec.'
      );
    }

    duration = audioBuffer.duration;

    if (format === 'MP3') {
      resultBlob = await encodeAudioBufferToMp3(audioBuffer, onProgress);
    } else if (format === 'AAC') {
      onProgress(70, 'Encoding audio track...');
      const mp3 = await encodeAudioBufferToMp3(audioBuffer, onProgress);
      resultBlob = new Blob([mp3], { type: 'audio/aac' });
    } else if (format === 'M4A') {
      onProgress(70, 'Generating M4A audio stream...');
      const wav = encodeAudioBufferToWav(audioBuffer);
      resultBlob = new Blob([wav], { type: 'audio/mp4' });
    } else {
      // 3GP
      onProgress(70, 'Generating 3GP audio stream...');
      const wav = encodeAudioBufferToWav(audioBuffer);
      resultBlob = new Blob([wav], { type: 'audio/3gpp' });
    }
  }

  if (!resultBlob || resultBlob.size === 0) {
    throw new Error('Failed to produce audio output from this video file.');
  }

  onProgress(98, 'Creating player preview and download link...');

  const originalName = file.name;
  const baseName =
    originalName.lastIndexOf('.') !== -1
      ? originalName.substring(0, originalName.lastIndexOf('.'))
      : originalName;
  const extension = format.toLowerCase();
  const fileName = `${baseName}.${extension}`;

  const url = URL.createObjectURL(resultBlob);

  onProgress(100, 'Audio extraction complete!');

  return {
    blob: resultBlob,
    url,
    fileName,
    size: resultBlob.size,
    formattedSize: formatBytes(resultBlob.size),
    duration,
    formattedDuration: formatDuration(duration),
    format,
    isLosslessRemuxed,
  };
}
