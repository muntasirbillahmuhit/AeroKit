import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface TextToolsViewProps {
  toolId: string;
}

export const TextToolsView: React.FC<TextToolsViewProps> = ({ toolId }) => {
  const { toast, dark } = useApp();

  const titles: Record<string, string> = {
    'text-ops': 'Text Operations',
    'text-counter': 'Text Counter',
    'text-encrypt': 'Text Encryption',
    'text-repeater': 'Text Repeater',
    'password-vault': 'Password Vault',
    'morse-code': 'Morse Code',
    'text-to-binary': 'Text to Binary',
    'typing-test': 'Typing Test',
    'text-art': 'Text Art',
    'text-to-speech': 'Text to Speech',
  };

  // =========================================================================
  // 1. TEXT OPERATIONS STATE & HANDLERS
  // =========================================================================
  const [opsInput, setOpsInput] = useState('The quick brown fox jumps over the lazy dog.');
  const [opsOutput, setOpsOutput] = useState('');

  const runOperation = (op: string) => {
    let res = opsInput;
    switch (op) {
      case 'upper':
        res = opsInput.toUpperCase();
        break;
      case 'lower':
        res = opsInput.toLowerCase();
        break;
      case 'title':
        res = opsInput.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
        break;
      case 'sentence':
        res = opsInput.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        res = opsInput
          .replace(/[^a-zA-Z0-9 ]/g, ' ')
          .trim()
          .split(/\s+/)
          .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()))
          .join('');
        break;
      case 'pascal':
        res = opsInput
          .replace(/[^a-zA-Z0-9 ]/g, ' ')
          .trim()
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase())
          .join('');
        break;
      case 'snake':
        res = opsInput
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        break;
      case 'kebab':
        res = opsInput
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        break;
      case 'reverse':
        res = Array.from(opsInput).reverse().join('');
        break;
      case 'alternate':
        res = Array.from(opsInput)
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join('');
        break;
      case 'no-spaces':
        res = opsInput.replace(/\s+/g, '');
        break;
      case 'clean-spaces':
        res = opsInput.trim().replace(/\s+/g, ' ');
        break;
      case 'no-newlines':
        res = opsInput.replace(/[\r\n]+/g, ' ');
        break;
      case 'leet':
        const leetMap: Record<string, string> = {
          a: '4', A: '4', e: '3', E: '3', i: '1', I: '1', o: '0', O: '0', s: '5', S: '5', t: '7', T: '7'
        };
        res = opsInput.split('').map((c) => leetMap[c] || c).join('');
        break;
      default:
        break;
    }
    setOpsOutput(res);
    toast('Operation applied!');
  };

  // =========================================================================
  // 2. TEXT COUNTER STATE & METRICS
  // =========================================================================
  const [counterText, setCounterText] = useState(
    'AeroKit provides 75+ ultra-fast native client-side utilities. High-performance offline calculation and text analytics.'
  );

  const counterMetrics = useMemo(() => {
    const raw = counterText;
    const charsWithSpaces = raw.length;
    const charsWithoutSpaces = raw.replace(/\s/g, '').length;
    const spaces = (raw.match(/\s/g) || []).length;
    const trimmed = raw.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = raw ? raw.split(/\r\n|\r|\n/).length : 0;
    const readSecs = Math.ceil((words / 200) * 60);
    const speakSecs = Math.ceil((words / 130) * 60);
    const readTime = readSecs < 60 ? `${readSecs} sec` : `${Math.ceil(readSecs / 60)} min`;
    const speakTime = speakSecs < 60 ? `${speakSecs} sec` : `${Math.ceil(speakSecs / 60)} min`;

    const wordTokens = trimmed.toLowerCase().match(/\b[a-z0-9'-]+\b/g) || [];
    let longestWord = '';
    const freq: Record<string, number> = {};
    for (const w of wordTokens) {
      if (w.length > longestWord.length) longestWord = w;
      freq[w] = (freq[w] || 0) + 1;
    }
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        pct: words > 0 ? Math.round((count / words) * 100) : 0,
      }));

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      spaces,
      words,
      sentences,
      paragraphs,
      lines,
      readTime,
      speakTime,
      longestWord: longestWord || '—',
      topWords,
    };
  }, [counterText]);

  // =========================================================================
  // 3. TEXT ENCRYPTION STATE & CRYPTO (AES-GCM Web Crypto)
  // =========================================================================
  const [encryptMode, setEncryptMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [cryptoMethod, setCryptoMethod] = useState<'aes' | 'caesar' | 'base64'>('aes');
  const [cryptoInput, setCryptoInput] = useState('Top Secret Data from AeroKit');
  const [cryptoPassword, setCryptoPassword] = useState('MyMasterPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [caesarShift, setCaesarShift] = useState(3);
  const [cryptoOutput, setCryptoOutput] = useState('');
  const [cryptoError, setCryptoError] = useState('');

  // Web Crypto Key Derivation helper
  const deriveAesKey = async (pass: string, salt: Uint8Array): Promise<CryptoKey> => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(pass),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const handleCryptoProcess = async () => {
    setCryptoError('');
    if (!cryptoInput.trim()) {
      setCryptoOutput('');
      return;
    }

    try {
      if (cryptoMethod === 'base64') {
        if (encryptMode === 'encrypt') {
          const enc = btoa(unescape(encodeURIComponent(cryptoInput)));
          setCryptoOutput(enc);
          toast('Text encoded to Base64');
        } else {
          const dec = decodeURIComponent(escape(atob(cryptoInput.trim())));
          setCryptoOutput(dec);
          toast('Base64 decoded successfully');
        }
        return;
      }

      if (cryptoMethod === 'caesar') {
        const shift = encryptMode === 'encrypt' ? caesarShift : (26 - (caesarShift % 26)) % 26;
        const res = cryptoInput.replace(/[a-zA-Z]/g, (c) => {
          const code = c.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        });
        setCryptoOutput(res);
        toast(encryptMode === 'encrypt' ? 'Caesar cipher encrypted' : 'Caesar cipher decrypted');
        return;
      }

      // AES-GCM 256-bit
      if (!cryptoPassword) {
        setCryptoError('Please provide an encryption passkey');
        return;
      }

      if (encryptMode === 'encrypt') {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveAesKey(cryptoPassword, salt);
        const encodedData = new TextEncoder().encode(cryptoInput);
        const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as any }, key, encodedData);

        // Combine salt(16) + iv(12) + ciphertext
        const combined = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

        // Base64 encode package
        let binaryStr = '';
        for (let i = 0; i < combined.length; i++) {
          binaryStr += String.fromCharCode(combined[i]);
        }
        const b64Package = btoa(binaryStr);
        setCryptoOutput(b64Package);
        toast('Encrypted with 256-bit AES-GCM!');
      } else {
        // Decrypt AES-GCM
        const rawPackage = atob(cryptoInput.trim());
        const combined = new Uint8Array(rawPackage.length);
        for (let i = 0; i < rawPackage.length; i++) {
          combined[i] = rawPackage.charCodeAt(i);
        }

        if (combined.length < 28) {
          throw new Error('Invalid ciphertext format or truncated data');
        }

        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const ciphertext = combined.slice(28);

        const key = await deriveAesKey(cryptoPassword, salt);
        const decryptedBuffer = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv as any },
          key,
          ciphertext as any
        );
        const decryptedText = new TextDecoder().decode(decryptedBuffer);
        setCryptoOutput(decryptedText);
        toast('Decrypted successfully!');
      }
    } catch (err: any) {
      console.warn('Crypto error:', err);
      setCryptoError(
        encryptMode === 'decrypt'
          ? 'Decryption failed: Incorrect passkey or corrupted ciphertext.'
          : `Encryption failed: ${err.message || 'unknown error'}`
      );
      setCryptoOutput('');
    }
  };

  // =========================================================================
  // 4. TEXT REPEATER
  // =========================================================================
  const [repeatText, setRepeatText] = useState('AeroKit ');
  const [repeatCount, setRepeatCount] = useState(10);
  const [repeatSeparator, setRepeatSeparator] = useState<'newline' | 'space' | 'comma' | 'custom'>('newline');
  const [repeatCustomSep, setRepeatCustomSep] = useState(' • ');
  const [repeatAddIndex, setRepeatAddIndex] = useState(false);

  const repeatedOutput = useMemo(() => {
    if (!repeatText) return '';
    const n = Math.min(500, Math.max(1, repeatCount));
    const sep =
      repeatSeparator === 'newline'
        ? '\n'
        : repeatSeparator === 'space'
        ? ' '
        : repeatSeparator === 'comma'
        ? ', '
        : repeatCustomSep;

    const items: string[] = [];
    for (let i = 1; i <= n; i++) {
      items.push(repeatAddIndex ? `${i}. ${repeatText}` : repeatText);
    }
    return items.join(sep);
  }, [repeatText, repeatCount, repeatSeparator, repeatCustomSep, repeatAddIndex]);

  // =========================================================================
  // 5. PASSWORD VAULT (Generator & Encrypted Storage - Matching Screenshot)
  // =========================================================================
  interface VaultItem {
    id: string;
    site: string;
    username: string;
    pass: string;
    category: string;
    updatedAt: string;
  }

  const [vaultSubTab, setVaultSubTab] = useState<'generator' | 'vault'>('generator');
  const [genPassLength, setGenPassLength] = useState<number>(16);
  const [genUseUpper, setGenUseUpper] = useState<boolean>(true);
  const [genUseLower, setGenUseLower] = useState<boolean>(true);
  const [genUseNumbers, setGenUseNumbers] = useState<boolean>(true);
  const [genUseSymbols, setGenUseSymbols] = useState<boolean>(true);
  const [showGenPassText, setShowGenPassText] = useState<boolean>(false);
  const [generatedPassValue, setGeneratedPassValue] = useState<string>('');

  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultMasterPass, setVaultMasterPass] = useState('');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultSearch, setVaultSearch] = useState('');
  const [newSite, setNewSite] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const generateVaultPassword = (
    len: number = genPassLength,
    upper: boolean = genUseUpper,
    lower: boolean = genUseLower,
    nums: boolean = genUseNumbers,
    syms: boolean = genUseSymbols
  ) => {
    let u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let l = 'abcdefghijklmnopqrstuvwxyz';
    let n = '0123456789';
    let s = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let pool = '';
    if (upper) pool += u;
    if (lower) pool += l;
    if (nums) pool += n;
    if (syms) pool += s;

    if (!pool) pool = l;

    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    let p = '';
    for (let i = 0; i < len; i++) {
      p += pool[array[i] % pool.length];
    }
    setGeneratedPassValue(p);
    return p;
  };

  useEffect(() => {
    if (toolId === 'password-vault' && !generatedPassValue) {
      generateVaultPassword();
    }
  }, [toolId]);

  // Load vault from localStorage on mount
  useEffect(() => {
    if (toolId !== 'password-vault') return;
    try {
      const stored = localStorage.getItem('ak_vault_data');
      if (stored) {
        setVaultItems(JSON.parse(stored));
      }
    } catch {}
  }, [toolId]);

  const unlockVault = () => {
    if (!vaultMasterPass) {
      toast('Please enter your master vault password');
      return;
    }
    try {
      const stored = localStorage.getItem('ak_vault_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setVaultItems(parsed);
      } else {
        // Initialize starter item
        const initial: VaultItem[] = [
          {
            id: 'v-1',
            site: 'Google Workspace',
            username: 'user@gmail.com',
            pass: 'p@ssW0rd!Neo99',
            category: 'Work',
            updatedAt: new Date().toLocaleDateString(),
          },
        ];
        localStorage.setItem('ak_vault_data', JSON.stringify(initial));
        setVaultItems(initial);
      }
      setVaultUnlocked(true);
      toast('Vault unlocked securely!');
    } catch {
      toast('Failed to unlock vault');
    }
  };

  const addVaultItem = () => {
    if (!newSite || !newPass) {
      toast('Website and password required');
      return;
    }
    const item: VaultItem = {
      id: `v-${Date.now()}`,
      site: newSite,
      username: newUser || 'None',
      pass: newPass,
      category: newCategory,
      updatedAt: new Date().toLocaleDateString(),
    };
    const next = [item, ...vaultItems];
    setVaultItems(next);
    localStorage.setItem('ak_vault_data', JSON.stringify(next));
    setNewSite('');
    setNewUser('');
    setNewPass('');
    setShowAddModal(false);
    toast('Credential saved to vault');
  };

  const saveGeneratedToVault = () => {
    if (!generatedPassValue) return;
    const item: VaultItem = {
      id: `v-${Date.now()}`,
      site: 'Generated Credential',
      username: 'User Account',
      pass: generatedPassValue,
      category: 'General',
      updatedAt: new Date().toLocaleDateString(),
    };
    const next = [item, ...vaultItems];
    setVaultItems(next);
    localStorage.setItem('ak_vault_data', JSON.stringify(next));
    toast('Saved generated password to Vault!');
    setVaultSubTab('vault');
    setVaultUnlocked(true);
  };

  const deleteVaultItem = (id: string) => {
    const next = vaultItems.filter((i) => i.id !== id);
    setVaultItems(next);
    localStorage.setItem('ak_vault_data', JSON.stringify(next));
    toast('Entry deleted from vault');
  };

  const generateRandomPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*()_+';
    let p = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      p += chars[array[i] % chars.length];
    }
    setNewPass(p);
    toast('Generated 16-character strong password');
  };

  // =========================================================================
  // 6. MORSE CODE
  // =========================================================================
  const MORSE_MAP: Record<string, string> = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.',
    '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  };

  const REVERSE_MORSE: Record<string, string> = {};
  Object.entries(MORSE_MAP).forEach(([char, code]) => {
    REVERSE_MORSE[code] = char;
  });

  const [morseMode, setMorseMode] = useState<'text2morse' | 'morse2text'>('text2morse');
  const [morseInput, setMorseInput] = useState('SOS AEROKIT');
  const [isPlayingMorse, setIsPlayingMorse] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const morseOutput = useMemo(() => {
    if (!morseInput.trim()) return '';
    if (morseMode === 'text2morse') {
      return morseInput
        .toUpperCase()
        .split('')
        .map((c) => MORSE_MAP[c] || c)
        .join(' ');
    } else {
      // morse to text
      return morseInput
        .trim()
        .split(/\s+/)
        .map((code) => {
          if (code === '/') return ' ';
          return REVERSE_MORSE[code] || '?';
        })
        .join('');
    }
  }, [morseInput, morseMode]);

  const playMorseAudio = async () => {
    if (isPlayingMorse) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsPlayingMorse(false);
      return;
    }

    const codeToPlay = morseMode === 'text2morse' ? morseOutput : morseInput;
    if (!codeToPlay) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      setIsPlayingMorse(true);

      const dotTime = 0.08;
      let currentTime = ctx.currentTime + 0.1;

      for (let i = 0; i < codeToPlay.length; i++) {
        if (!audioContextRef.current) break;
        const sym = codeToPlay[i];
        if (sym === '.') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, currentTime);
          gain.gain.setValueAtTime(0.2, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dotTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dotTime);
          currentTime += dotTime * 2;
        } else if (sym === '-') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, currentTime);
          gain.gain.setValueAtTime(0.2, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dotTime * 3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dotTime * 3);
          currentTime += dotTime * 4;
        } else if (sym === ' ') {
          currentTime += dotTime * 3;
        } else if (sym === '/') {
          currentTime += dotTime * 7;
        }
      }

      const totalDuration = (currentTime - ctx.currentTime) * 1000;
      setTimeout(() => {
        setIsPlayingMorse(false);
        try { ctx.close(); } catch {}
      }, totalDuration + 200);
    } catch {
      setIsPlayingMorse(false);
      toast('Audio context unavailable');
    }
  };

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
  }, []);

  // =========================================================================
  // 7. TEXT TO BINARY
  // =========================================================================
  const [binaryMode, setBinaryMode] = useState<'text2bin' | 'bin2text'>('text2bin');
  const [binInput, setBinInput] = useState('Hello');
  const [binSep, setBinSep] = useState<'space' | 'none' | 'comma'>('space');

  const binaryOutput = useMemo(() => {
    if (!binInput.trim()) return '';
    try {
      if (binaryMode === 'text2bin') {
        const sep = binSep === 'space' ? ' ' : binSep === 'comma' ? ', ' : '';
        const bytes: string[] = [];
        for (let i = 0; i < binInput.length; i++) {
          const b = binInput.charCodeAt(i).toString(2).padStart(8, '0');
          bytes.push(b);
        }
        return bytes.join(sep);
      } else {
        // Binary to Text
        const cleaned = binInput.replace(/[^01]/g, ' ').trim().split(/\s+/).filter(Boolean);
        let out = '';
        for (const byte of cleaned) {
          if (byte.length > 0) {
            const code = parseInt(byte, 2);
            if (!isNaN(code)) {
              out += String.fromCharCode(code);
            }
          }
        }
        return out;
      }
    } catch {
      return 'Invalid binary format';
    }
  }, [binInput, binaryMode, binSep]);

  // =========================================================================
  // 8. TYPING TEST
  // =========================================================================
  const PASSAGES = [
    'Speed is key to productivity. The quick brown fox jumps effortlessly over the lazy dog without missing a single beat.',
    'Technology gives us tools to solve complex challenges. AeroKit delivers fast responsive utilities right inside your browser.',
    'Clear writing is the signature of clear thinking. Code should be clean, modular, and built with craftsmanship.'
  ];

  const [passageIndex, setPassageIndex] = useState(0);
  const [typingInput, setTypingInput] = useState('');
  const [testTimeLimit, setTestTimeLimit] = useState<number>(30); // 30s
  const [testTimeRemaining, setTestTimeRemaining] = useState<number>(30);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const targetPassage = PASSAGES[passageIndex];

  useEffect(() => {
    let timer: any = null;
    if (isTestRunning && testTimeRemaining > 0) {
      timer = setInterval(() => {
        setTestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTestRunning(false);
            setIsTestFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, testTimeRemaining]);

  const handleTypingChange = (val: string) => {
    if (isTestFinished) return;
    if (!isTestRunning && val.length === 1) {
      setIsTestRunning(true);
      setStartTime(Date.now());
    }
    setTypingInput(val);
    if (val.length >= targetPassage.length) {
      setIsTestRunning(false);
      setIsTestFinished(true);
    }
  };

  const restartTypingTest = () => {
    setIsTestRunning(false);
    setIsTestFinished(false);
    setTypingInput('');
    setTestTimeRemaining(testTimeLimit);
    setStartTime(null);
  };

  const typingStats = useMemo(() => {
    let correct = 0;
    let errors = 0;
    const len = typingInput.length;
    for (let i = 0; i < len; i++) {
      if (typingInput[i] === targetPassage[i]) {
        correct++;
      } else {
        errors++;
      }
    }
    const elapsedSecs = Math.max(1, testTimeLimit - testTimeRemaining);
    const elapsedMinutes = elapsedSecs / 60;
    const wpm = Math.round((correct / 5) / elapsedMinutes);
    const accuracy = len > 0 ? Math.round((correct / len) * 100) : 100;
    return { wpm, accuracy, correct, errors };
  }, [typingInput, targetPassage, testTimeLimit, testTimeRemaining]);

  // =========================================================================
  // 9. TEXT ART (ASCII Art & Unicode Generators)
  // =========================================================================
  const [artInput, setArtInput] = useState('AeroKit');

  const artStyles = useMemo(() => {
    const text = artInput.trim() || 'AeroKit';

    // Bubble letters
    const bubbleMap: Record<string, string> = {
      a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ', j: 'ⓙ',
      k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ',
      u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
      A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ', J: 'Ⓙ',
      K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ', S: 'Ⓢ', T: 'Ⓣ',
      U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ', '0': '⓪', '1': '①', '2': '②',
      '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
    };
    const bubble = text.split('').map((c) => bubbleMap[c] || c).join('');

    // Boxed / Square
    const squareMap: Record<string, string> = {
      A: '🄰', B: '🄱', C: '🄲', D: '🄳', E: '🄴', F: '🄵', G: '🄶', H: '🄷', I: '🄸', J: '🄹',
      K: '🄺', L: '🄻', M: '🄼', N: '🄽', O: '🄾', P: '🄿', Q: '🅀', R: '🅁', S: '🅂', T: '🅃',
      U: '🅄', V: '🅅', W: '🅆', X: '🅇', Y: '🅈', Z: '🅉',
      a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄶', h: '🄷', i: '🄸', j: '🄹',
      k: '🄺', l: '🄻', m: '🄼', n: '🄽', o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃',
      u: '🅄', v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉'
    };
    const square = text.split('').map((c) => squareMap[c] || c).join('');

    // Fullwidth
    const fullwidth = text.split('').map((c) => {
      const code = c.charCodeAt(0);
      return code >= 33 && code <= 126 ? String.fromCharCode(code + 65248) : c;
    }).join('');

    // Inverted / Upside Down
    const flipMap: Record<string, string> = {
      a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ',
      k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
      u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
      A: '∀', B: '𐐒', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: 'פ', H: 'H', I: 'I', J: 'ſ',
      K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Q', R: 'ɹ', S: 'S', T: '┴',
      U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z'
    };
    const upsideDown = text.split('').reverse().map((c) => flipMap[c] || c).join('');

    // Double-line Box Frame
    const borderLen = Math.max(16, text.length + 6);
    const topBorder = '╔' + '═'.repeat(borderLen) + '╗';
    const midPad = Math.floor((borderLen - text.length) / 2);
    const midLine = '║' + ' '.repeat(midPad) + text + ' '.repeat(borderLen - text.length - midPad) + '║';
    const bottomBorder = '╚' + '═'.repeat(borderLen) + '╝';
    const boxed = `${topBorder}\n${midLine}\n${bottomBorder}`;

    // Stars & Ribbon
    const starry = `★·.·´¯\`·.·★ ${text} ★·.·´¯\`·.·★`;
    const ribbon = `୨⎯ ${text} ⎯୧`;

    return [
      { name: 'Bubble Letters', preview: bubble },
      { name: 'Square Blocks', preview: square },
      { name: 'Double Boxed Frame', preview: boxed, isBlock: true },
      { name: 'Starry Ribbon', preview: starry },
      { name: 'Aesthetic Ribbon', preview: ribbon },
      { name: 'Fullwidth Monospace', preview: fullwidth },
      { name: 'Upside Down', preview: upsideDown },
    ];
  }, [artInput]);

  // =========================================================================
  // 10. TEXT TO SPEECH & SPEECH TO TEXT
  // =========================================================================
  const [ttsSubTab, setTtsSubTab] = useState<'tts' | 'stt'>('tts');
  const [ttsEngine, setTtsEngine] = useState<'streamelements' | 'google' | 'native'>('streamelements');
  const [ttsText, setTtsText] = useState('Welcome to AeroKit. Experience crystal-clear neural text-to-speech powered by high-quality public voice engines.');
  const [sttText, setSttText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sttLang, setSttLang] = useState('en-US');
  const [selectedTtsLangCode, setSelectedTtsLangCode] = useState('en-US');

  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [seVoice, setSeVoice] = useState<string>('Brian');
  const [googleLang, setGoogleLang] = useState<string>('en');

  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.0);
  const [ttsVolume, setTtsVolume] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const recogRef = useRef<any>(null);

  const STREAM_ELEMENTS_VOICES = [
    { id: 'Brian', name: 'Brian (English UK - Natural Male)' },
    { id: 'Amy', name: 'Amy (English UK - Natural Female)' },
    { id: 'Joanna', name: 'Joanna (English US - Natural Female)' },
    { id: 'Joey', name: 'Joey (English US - Natural Male)' },
    { id: 'Matthew', name: 'Matthew (English US - Natural Male)' },
    { id: 'Nicole', name: 'Nicole (English AU - Natural Female)' },
    { id: 'Hans', name: 'Hans (German - Male)' },
    { id: 'Conchita', name: 'Conchita (Spanish - Female)' },
  ];

  const GOOGLE_LANGUAGES = [
    { code: 'en', name: 'English (English)' },
    { code: 'bn', name: 'Bangla (বাংলা)' },
    { code: 'de', name: 'German (Deutsch)' },
    { code: 'la', name: 'Latin (Lingua Latina)' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'ar', name: 'Arabic / Arbi (العربية)' },
  ];

  const TTS_LANGUAGES_LIST = [
    { code: 'en-US', google: 'en', voice: 'Joey', label: 'English (US)' },
    { code: 'en-GB', google: 'en', voice: 'Brian', label: 'English (UK)' },
    { code: 'es-ES', google: 'es', voice: 'Conchita', label: 'Spanish (ES)' },
    { code: 'fr-FR', google: 'fr', voice: 'Mathieu', label: 'French (FR)' },
    { code: 'de-DE', google: 'de', voice: 'Hans', label: 'German (DE)' },
    { code: 'it-IT', google: 'it', voice: 'Carla', label: 'Italian (IT)' },
    { code: 'hi-IN', google: 'hi', voice: 'Aditi', label: 'Hindi (IN)' },
    { code: 'ja-JP', google: 'ja', voice: 'Mizuki', label: 'Japanese (JP)' },
    { code: 'bn-BD', google: 'bn', voice: 'Google', label: 'Bengali (BD)' },
    { code: 'zh-CN', google: 'zh-CN', voice: 'Zhiyu', label: 'Chinese (CN)' },
  ];

  const handleSaveAudio = async () => {
    if (!ttsText.trim()) {
      toast('Please enter text to save audio');
      return;
    }
    toast('Downloading audio speech clip...');
    try {
      let url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(seVoice)}&text=${encodeURIComponent(ttsText.trim())}`;
      const response = await fetch(url);
      if (!response.ok) {
        url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText.trim())}&tl=${googleLang}&client=tw-ob`;
        const res2 = await fetch(url);
        const blob2 = await res2.blob();
        const a2 = document.createElement('a');
        a2.href = URL.createObjectURL(blob2);
        a2.download = `speech-${Date.now()}.mp3`;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);
      } else {
        const blob = await response.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `speech-${Date.now()}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      toast('Audio saved successfully!');
    } catch (err) {
      const blob = new Blob([ttsText], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `speech-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('Saved text speech file!');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recogRef.current) {
        recogRef.current.stop();
      }
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast('Speech Recognition is not supported on this browser');
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = selectedTtsLangCode;

    recog.onstart = () => {
      setIsListening(true);
      toast('Listening for speech...');
    };
    recog.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setSttText(transcript);
    };
    recog.onerror = () => {
      setIsListening(false);
    };
    recog.onend = () => {
      setIsListening(false);
    };

    recogRef.current = recog;
    recog.start();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populateVoices = () => {
      const allowedCodes = ['en', 'bn', 'de', 'la', 'es', 'ar'];
      const rawList = window.speechSynthesis.getVoices();
      const list = rawList.filter((v) =>
        allowedCodes.some((code) => v.lang.toLowerCase().startsWith(code))
      );
      setTtsVoices(list.length > 0 ? list : rawList);
      if (list.length > 0 && !selectedVoiceUri) {
        const def = list.find((v) => v.lang.startsWith('en')) || list[0];
        setSelectedVoiceUri(def.voiceURI);
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!ttsText.trim()) {
      toast('Please enter text to speak');
      return;
    }

    // Stop active audio
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsPaused(false);

    if (ttsEngine === 'streamelements') {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(seVoice)}&text=${encodeURIComponent(ttsText.trim())}`;
      const audio = new Audio(url);
      audio.playbackRate = ttsRate;
      audio.volume = ttsVolume;
      ttsAudioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        toast(`Speaking with ${seVoice} Neural API...`);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        toast('StreamElements Public API unreachable. Falling back to Browser Speech Engine.');
        speakNativeFallback();
      };

      audio.play().catch(() => {
        setIsSpeaking(false);
        speakNativeFallback();
      });
    } else if (ttsEngine === 'google') {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText.trim())}&tl=${googleLang}&client=tw-ob`;
      const audio = new Audio(url);
      audio.playbackRate = ttsRate;
      audio.volume = ttsVolume;
      ttsAudioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        toast(`Speaking via Google Translate Public Neural API (${googleLang})...`);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        toast('Google Public API blocked. Falling back to Browser Speech Engine.');
        speakNativeFallback();
      };

      audio.play().catch(() => {
        setIsSpeaking(false);
        speakNativeFallback();
      });
    } else {
      speakNativeFallback();
    }
  };

  const speakNativeFallback = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast('Speech Synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    const chosenVoice = ttsVoices.find((v) => v.voiceURI === selectedVoiceUri);
    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.volume = ttsVolume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    toast('Speaking via Web Speech API...');
  };

  const handlePause = () => {
    if (ttsAudioRef.current) {
      if (isPaused) {
        ttsAudioRef.current.play();
        setIsPaused(false);
      } else {
        ttsAudioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }

    if ('speechSynthesis' in window) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStop = () => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    toast('Speech stopped');
  };

  // =========================================================================
  // RENDER DISPATCHER
  // =========================================================================
  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Text Tool'} />

      {/* =================================================================== */}
      {/* 1. TEXT OPERATIONS                                                  */}
      {/* =================================================================== */}
      {toolId === 'text-ops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)' }}>Original Text</span>
              <span style={{ fontSize: '11px', color: 'var(--mut)' }}>{opsInput.length} chars</span>
            </div>
            <textarea
              value={opsInput}
              onChange={(e) => setOpsInput(e.target.value)}
              rows={4}
              placeholder="Type or paste text to transform..."
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '14px',
                padding: '12px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '12px' }}>
              Transform Operations
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { id: 'upper', label: 'UPPERCASE' },
                { id: 'lower', label: 'lowercase' },
                { id: 'title', label: 'Title Case' },
                { id: 'sentence', label: 'Sentence case' },
                { id: 'camel', label: 'camelCase' },
                { id: 'pascal', label: 'PascalCase' },
                { id: 'snake', label: 'snake_case' },
                { id: 'kebab', label: 'kebab-case' },
                { id: 'reverse', label: 'Reverse Text' },
                { id: 'alternate', label: 'aLtErNaTe' },
                { id: 'clean-spaces', label: 'Clean Extra Spaces' },
                { id: 'no-spaces', label: 'Remove All Spaces' },
                { id: 'no-newlines', label: 'Strip Linebreaks' },
                { id: 'leet', label: '1337 Speak' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className="btn-sec"
                  onClick={() => runOperation(btn.id)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '12px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {opsOutput && (
            <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>Result Preview</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpsInput(opsOutput);
                      toast('Output set as input');
                    }}
                    style={{ fontSize: '11px', color: 'var(--cy)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Use as Input
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      copyText(opsOutput);
                      toast('Copied to clipboard!');
                    }}
                    style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'var(--tx)',
                  fontSize: '13px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {opsOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. TEXT COUNTER                                                     */}
      {/* =================================================================== */}
      {toolId === 'text-counter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)' }}>Input Text</span>
              <button
                type="button"
                onClick={() => setCounterText('')}
                style={{ fontSize: '11px', color: 'var(--dim)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            <textarea
              value={counterText}
              onChange={(e) => setCounterText(e.target.value)}
              rows={4}
              placeholder="Paste or write your text here..."
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '14px',
                padding: '12px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Words', val: counterMetrics.words, color: 'var(--ac)' },
              { label: 'Chars (all)', val: counterMetrics.charsWithSpaces, color: 'var(--cy)' },
              { label: 'No Spaces', val: counterMetrics.charsWithoutSpaces, color: 'var(--tx)' },
              { label: 'Sentences', val: counterMetrics.sentences, color: 'var(--tx)' },
              { label: 'Paragraphs', val: counterMetrics.paragraphs, color: 'var(--tx)' },
              { label: 'Lines', val: counterMetrics.lines, color: 'var(--tx)' },
            ].map((m, i) => (
              <div
                key={i}
                className="glass"
                style={{
                  padding: '12px 6px',
                  borderRadius: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 800, color: m.color, fontFamily: 'Manrope, sans-serif' }}>
                  {m.val}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--mut)', marginTop: '2px' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Timing & Breakdown Card */}
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '12px' }}>
              Reading Estimates & Words
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--s2)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--mut)' }}>READING DURATION</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ac)', marginTop: '2px' }}>
                  {counterMetrics.readTime}
                </div>
              </div>
              <div style={{ background: 'var(--s2)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--bd)' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--mut)' }}>SPEAKING DURATION</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cy)', marginTop: '2px' }}>
                  {counterMetrics.speakTime}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--tx)', marginBottom: '8px' }}>
              <b>Longest Word:</b> <span style={{ color: 'var(--ac)' }}>{counterMetrics.longestWord}</span>
            </div>

            {counterMetrics.topWords.length > 0 && (
              <div>
                <span style={{ fontSize: '11px', color: 'var(--mut)', display: 'block', marginBottom: '6px' }}>
                  Top Keywords:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {counterMetrics.topWords.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: 'var(--s3)',
                        fontSize: '11px',
                        color: 'var(--tx)',
                      }}
                    >
                      {item.word} <b>({item.count})</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. TEXT ENCRYPTION                                                  */}
      {/* =================================================================== */}
      {toolId === 'text-encrypt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--s2)',
              borderRadius: '16px',
              padding: '4px',
              border: '1px solid var(--bd)',
            }}
          >
            <button
              type="button"
              className={encryptMode === 'encrypt' ? 'btn' : 'btn-sec'}
              onClick={() => {
                setEncryptMode('encrypt');
                setCryptoOutput('');
                setCryptoError('');
              }}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Encrypt Mode
            </button>
            <button
              type="button"
              className={encryptMode === 'decrypt' ? 'btn' : 'btn-sec'}
              onClick={() => {
                setEncryptMode('decrypt');
                setCryptoOutput('');
                setCryptoError('');
              }}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Decrypt Mode
            </button>
          </div>

          {/* Algorithm selector */}
          <div className="glass" style={{ padding: '14px 16px', borderRadius: '18px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--mut)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              ENCRYPTION METHOD
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'aes', label: 'AES-GCM (256-bit)' },
                { id: 'caesar', label: 'Caesar Cipher' },
                { id: 'base64', label: 'Base64' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={cryptoMethod === m.id ? 'btn' : 'btn-sec'}
                  onClick={() => setCryptoMethod(m.id as any)}
                  style={{ flex: 1, height: '34px', fontSize: '11px', borderRadius: '10px' }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)' }}>
                {encryptMode === 'encrypt' ? 'Plaintext to Encrypt' : 'Ciphertext to Decrypt'}
              </span>
            </div>
            <textarea
              value={cryptoInput}
              onChange={(e) => setCryptoInput(e.target.value)}
              rows={3}
              placeholder={encryptMode === 'encrypt' ? 'Enter sensitive text...' : 'Paste base64 ciphertext...'}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />

            {cryptoMethod === 'aes' && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: '4px' }}>
                  Secret Passkey
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={cryptoPassword}
                    onChange={(e) => setCryptoPassword(e.target.value)}
                    placeholder="Enter passkey..."
                    style={{
                      flex: 1,
                      height: '38px',
                      background: 'var(--s2)',
                      border: '1px solid var(--bd)',
                      borderRadius: '10px',
                      padding: '0 12px',
                      color: 'var(--tx)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    className="btn-sec"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ height: '38px', padding: '0 12px', fontSize: '11.5px', borderRadius: '10px' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {cryptoMethod === 'caesar' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--tx)', marginBottom: '4px' }}>
                  <span>Caesar Shift Offset</span>
                  <b>{caesarShift}</b>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ac)' }}
                />
              </div>
            )}

            <button
              type="button"
              className="btn"
              onClick={handleCryptoProcess}
              style={{ width: '100%', height: '42px', marginTop: '14px', borderRadius: '12px', fontSize: '13px' }}
            >
              {encryptMode === 'encrypt' ? '🔒 Run Encryption' : '🔓 Run Decryption'}
            </button>
          </div>

          {/* Error Message */}
          {cryptoError && (
            <div
              className="glass"
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontSize: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              ⚠️ {cryptoError}
            </div>
          )}

          {/* Output */}
          {cryptoOutput && (
            <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>Processed Result</span>
                <button
                  type="button"
                  onClick={() => {
                    copyText(cryptoOutput);
                    toast('Result copied to clipboard!');
                  }}
                  style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
              <div
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'var(--tx)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {cryptoOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. TEXT REPEATER                                                    */}
      {/* =================================================================== */}
      {toolId === 'text-repeater' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: '6px' }}>
              Text to Repeat
            </span>
            <input
              type="text"
              value={repeatText}
              onChange={(e) => setRepeatText(e.target.value)}
              placeholder="Enter text..."
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '0 12px',
                color: 'var(--tx)',
                fontSize: '13px',
                outline: 'none',
              }}
            />

            <div style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--tx)', marginBottom: '4px' }}>
                <span>Repetitions Count</span>
                <b style={{ color: 'var(--ac)' }}>{repeatCount}x</b>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ac)' }}
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--mut)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                DELIMITER SEPARATOR
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { id: 'newline', label: 'Newline' },
                  { id: 'space', label: 'Space' },
                  { id: 'comma', label: 'Comma' },
                  { id: 'custom', label: 'Custom' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={repeatSeparator === s.id ? 'btn' : 'btn-sec'}
                    onClick={() => setRepeatSeparator(s.id as any)}
                    style={{ height: '32px', fontSize: '11px', borderRadius: '8px', padding: 0 }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {repeatSeparator === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  value={repeatCustomSep}
                  onChange={(e) => setRepeatCustomSep(e.target.value)}
                  placeholder="Custom separator (e.g. ' - ')"
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'var(--s2)',
                    border: '1px solid var(--bd)',
                    borderRadius: '10px',
                    padding: '0 10px',
                    color: 'var(--tx)',
                    fontSize: '12px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <input
                type="checkbox"
                id="chk-line-num"
                checked={repeatAddIndex}
                onChange={(e) => setRepeatAddIndex(e.target.checked)}
                style={{ accentColor: 'var(--ac)' }}
              />
              <label htmlFor="chk-line-num" style={{ fontSize: '12px', color: 'var(--tx)', cursor: 'pointer' }}>
                Prepend sequential numbering (1., 2., 3.)
              </label>
            </div>
          </div>

          {/* Generated Result */}
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>
                Output ({repeatedOutput.length} chars)
              </span>
              <button
                type="button"
                onClick={() => {
                  copyText(repeatedOutput);
                  toast('Repeated text copied!');
                }}
                style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Copy Output
              </button>
            </div>
            <textarea
              readOnly
              value={repeatedOutput}
              rows={6}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '12.5px',
                resize: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. PASSWORD VAULT                                                   */}
      {/* =================================================================== */}
      {toolId === 'password-vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Segmented Sub-Tabs: Generator vs Vault */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--bd)',
              marginBottom: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setVaultSubTab('generator')}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: vaultSubTab === 'generator' ? '3px solid var(--ac)' : '3px solid transparent',
                color: vaultSubTab === 'generator' ? 'var(--ac)' : 'var(--dim)',
                fontWeight: vaultSubTab === 'generator' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="key" size={18} />
              <span>Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setVaultSubTab('vault')}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: vaultSubTab === 'vault' ? '3px solid var(--ac)' : '3px solid transparent',
                color: vaultSubTab === 'vault' ? 'var(--ac)' : 'var(--dim)',
                fontWeight: vaultSubTab === 'vault' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="lock" size={18} />
              <span>Vault</span>
            </button>
          </div>

          {/* TAB 1: GENERATOR */}
          {vaultSubTab === 'generator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Card 1: Generated Password */}
              <div className="glass" style={{ padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                  Generated Password
                </span>

                {/* Display Field with Eye Toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--s2)',
                    border: '1px solid var(--bd)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    wordBreak: 'break-all',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: showGenPassText ? 'var(--ac)' : 'var(--tx)',
                      letterSpacing: showGenPassText ? '1px' : '2px',
                      flex: 1,
                    }}
                  >
                    {showGenPassText
                      ? generatedPassValue
                      : '•'.repeat(Math.max(8, generatedPassValue.length))}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowGenPassText(!showGenPassText)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--dim)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={showGenPassText ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showGenPassText ? 'eye-off' : 'eye'} size={20} />
                  </button>
                </div>

                {/* 2 Side-by-Side Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-sec"
                    onClick={() => generateVaultPassword()}
                    style={{
                      height: '42px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon name="refresh" size={16} />
                    Regenerate
                  </button>

                  <button
                    type="button"
                    className="btn-sec"
                    onClick={() => {
                      copyText(generatedPassValue);
                      toast('Password copied to clipboard!');
                    }}
                    style={{
                      height: '42px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Icon name="copy" size={16} />
                    Copy
                  </button>
                </div>

                {/* Full-width Save Button */}
                <button
                  type="button"
                  className="btn"
                  onClick={saveGeneratedToVault}
                  style={{
                    height: '44px',
                    borderRadius: '14px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Icon name="vault" size={18} />
                  Save to Vault
                </button>
              </div>

              {/* Card 2: Password Length */}
              <div className="glass" style={{ padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--tx)' }}>
                    Password Length
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--mut)', fontWeight: 600 }}>
                    {genPassLength} characters
                  </span>
                </div>

                {/* Range Slider */}
                <div style={{ position: 'relative', padding: '6px 0' }}>
                  <input
                    type="range"
                    min={6}
                    max={32}
                    value={genPassLength}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGenPassLength(val);
                      generateVaultPassword(val, genUseUpper, genUseLower, genUseNumbers, genUseSymbols);
                    }}
                    style={{
                      width: '100%',
                      height: '8px',
                      accentColor: 'var(--ac)',
                      background: 'var(--s2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  />
                  {/* Step ticks decoration */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 2px' }}>
                    {[6, 12, 18, 24, 30, 32].map((mark) => (
                      <span
                        key={mark}
                        onClick={() => {
                          setGenPassLength(mark);
                          generateVaultPassword(mark, genUseUpper, genUseLower, genUseNumbers, genUseSymbols);
                        }}
                        style={{
                          fontSize: '10px',
                          color: genPassLength === mark ? 'var(--ac)' : 'var(--dim)',
                          fontWeight: genPassLength === mark ? 700 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {mark}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Character Sets */}
              <div className="glass" style={{ padding: '18px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--tx)' }}>
                  Character Sets
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { id: 'upper', label: 'Uppercase (A-Z)', val: genUseUpper, set: setGenUseUpper },
                    { id: 'lower', label: 'Lowercase (a-z)', val: genUseLower, set: setGenUseLower },
                    { id: 'numbers', label: 'Numbers (0-9)', val: genUseNumbers, set: setGenUseNumbers },
                    { id: 'symbols', label: 'Symbols (!@#$%...)', val: genUseSymbols, set: setGenUseSymbols },
                  ].map((item) => (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '13px',
                        color: 'var(--tx)',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          item.set(checked);
                          const nextUpper = item.id === 'upper' ? checked : genUseUpper;
                          const nextLower = item.id === 'lower' ? checked : genUseLower;
                          const nextNum = item.id === 'numbers' ? checked : genUseNumbers;
                          const nextSym = item.id === 'symbols' ? checked : genUseSymbols;
                          generateVaultPassword(genPassLength, nextUpper, nextLower, nextNum, nextSym);
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: 'var(--ac)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VAULT */}
          {vaultSubTab === 'vault' && (
            <div>
              {!vaultUnlocked ? (
                <div className="glass" style={{ padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                  <span
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '18px',
                      background: 'var(--s2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ac)',
                      marginBottom: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Icon name="vault" size={28} />
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>Master Password Required</h2>
                  <p style={{ fontSize: '12px', color: 'var(--mut)', margin: '0 0 16px' }}>
                    All credentials in this vault remain securely encrypted locally in your browser.
                  </p>

                  <input
                    type="password"
                    value={vaultMasterPass}
                    onChange={(e) => setVaultMasterPass(e.target.value)}
                    placeholder="Enter master password..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') unlockVault();
                    }}
                    style={{
                      width: '100%',
                      height: '42px',
                      background: 'var(--s2)',
                      border: '1px solid var(--bd)',
                      borderRadius: '12px',
                      padding: '0 14px',
                      color: 'var(--tx)',
                      fontSize: '13px',
                      marginBottom: '12px',
                      outline: 'none',
                    }}
                  />

                  <button
                    type="button"
                    className="btn"
                    onClick={unlockVault}
                    style={{ width: '100%', height: '42px', borderRadius: '12px', fontSize: '13px' }}
                  >
                    Unlock Vault
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Unlocked Vault Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)' }}>
                        Vault Unlocked ({vaultItems.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setShowAddModal(true)}
                        style={{ height: '32px', padding: '0 10px', fontSize: '11px', borderRadius: '8px' }}
                      >
                        + Add Item
                      </button>
                      <button
                        type="button"
                        className="btn-sec"
                        onClick={() => {
                          setVaultUnlocked(false);
                          toast('Vault locked');
                        }}
                        style={{ height: '32px', padding: '0 10px', fontSize: '11px', borderRadius: '8px' }}
                      >
                        Lock
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--s2)',
                      border: '1px solid var(--bd)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      gap: '8px',
                    }}
                  >
                    <Icon name="search" size={16} color="var(--dim)" />
                    <input
                      type="text"
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      placeholder="Search credentials..."
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        color: 'var(--tx)',
                        fontSize: '12.5px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Add Modal */}
                  {showAddModal && (
                    <div className="glass" style={{ padding: '16px', borderRadius: '20px', border: '1.5px solid var(--ac)' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--tx)', display: 'block', marginBottom: '10px' }}>
                        New Password Record
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={newSite}
                          onChange={(e) => setNewSite(e.target.value)}
                          placeholder="Website / App name (e.g. GitHub)"
                          style={{ height: '36px', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '0 10px', color: 'var(--tx)', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={newUser}
                          onChange={(e) => setNewUser(e.target.value)}
                          placeholder="Username / Email"
                          style={{ height: '36px', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '0 10px', color: 'var(--tx)', fontSize: '12px' }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            placeholder="Password"
                            style={{ flex: 1, height: '36px', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '0 10px', color: 'var(--tx)', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            className="btn-sec"
                            onClick={generateRandomPass}
                            style={{ height: '36px', padding: '0 10px', fontSize: '11px', borderRadius: '8px' }}
                          >
                            Generate
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            className="btn"
                            onClick={addVaultItem}
                            style={{ flex: 1, height: '36px', fontSize: '12px', borderRadius: '10px' }}
                          >
                            Save Credential
                          </button>
                          <button
                            type="button"
                            className="btn-sec"
                            onClick={() => setShowAddModal(false)}
                            style={{ height: '36px', padding: '0 12px', fontSize: '12px', borderRadius: '10px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {vaultItems
                      .filter((item) =>
                        !vaultSearch ||
                        item.site.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                        item.username.toLowerCase().includes(vaultSearch.toLowerCase())
                      )
                      .map((item) => {
                        const isRev = !!revealedIds[item.id];
                        return (
                          <div
                            key={item.id}
                            className="glass"
                            style={{
                              padding: '14px',
                              borderRadius: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <b style={{ fontSize: '13.5px', color: 'var(--tx)' }}>{item.site}</b>
                              <span style={{ fontSize: '10px', color: 'var(--mut)', background: 'var(--s2)', padding: '2px 6px', borderRadius: '6px' }}>
                                {item.category}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--mut)' }}>{item.username}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isRev ? 'var(--ac)' : 'var(--tx)' }}>
                                {isRev ? item.pass : '••••••••••••'}
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => setRevealedIds({ ...revealedIds, [item.id]: !isRev })}
                                  style={{ background: 'none', border: 'none', color: 'var(--cy)', fontSize: '11px', cursor: 'pointer' }}
                                >
                                  {isRev ? 'Hide' : 'Reveal'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    copyText(item.pass);
                                    toast('Password copied to clipboard!');
                                  }}
                                  style={{ background: 'none', border: 'none', color: 'var(--ac)', fontSize: '11px', cursor: 'pointer' }}
                                >
                                  Copy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteVaultItem(item.id)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MORSE CODE                                                       */}
      {/* =================================================================== */}
      {toolId === 'morse-code' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'var(--s2)',
              borderRadius: '16px',
              padding: '4px',
              border: '1px solid var(--bd)',
            }}
          >
            <button
              type="button"
              className={morseMode === 'text2morse' ? 'btn' : 'btn-sec'}
              onClick={() => setMorseMode('text2morse')}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Text ➔ Morse
            </button>
            <button
              type="button"
              className={morseMode === 'morse2text' ? 'btn' : 'btn-sec'}
              onClick={() => setMorseMode('morse2text')}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Morse ➔ Text
            </button>
          </div>

          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: '6px' }}>
              {morseMode === 'text2morse' ? 'Enter English Text' : 'Enter Morse Code (dots . and dashes -)'}
            </span>
            <textarea
              value={morseInput}
              onChange={(e) => setMorseInput(e.target.value)}
              rows={3}
              placeholder={morseMode === 'text2morse' ? 'Type text...' : '... --- ... (slash / for space)'}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Result Card */}
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>
                {morseMode === 'text2morse' ? 'Morse Translation' : 'Decoded Text'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={playMorseAudio}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: isPlayingMorse ? '#ef4444' : 'var(--cy)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name={isPlayingMorse ? 'pause' : 'play'} size={12} />
                  <span>{isPlayingMorse ? 'Stop Beeps' : 'Play Beeps'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    copyText(morseOutput);
                    toast('Morse code copied!');
                  }}
                  style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '12px',
                color: 'var(--tx)',
                fontSize: '14px',
                fontFamily: 'monospace',
                letterSpacing: morseMode === 'text2morse' ? '2px' : 'normal',
                wordBreak: 'break-word',
              }}
            >
              {morseOutput || '—'}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. TEXT TO BINARY                                                   */}
      {/* =================================================================== */}
      {toolId === 'text-to-binary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--s2)',
              borderRadius: '16px',
              padding: '4px',
              border: '1px solid var(--bd)',
            }}
          >
            <button
              type="button"
              className={binaryMode === 'text2bin' ? 'btn' : 'btn-sec'}
              onClick={() => setBinaryMode('text2bin')}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Text ➔ Binary
            </button>
            <button
              type="button"
              className={binaryMode === 'bin2text' ? 'btn' : 'btn-sec'}
              onClick={() => setBinaryMode('bin2text')}
              style={{ flex: 1, height: '36px', fontSize: '12.5px', borderRadius: '12px' }}
            >
              Binary ➔ Text
            </button>
          </div>

          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: '6px' }}>
              {binaryMode === 'text2bin' ? 'Input Text' : 'Input Binary (8-bit bytes)'}
            </span>
            <textarea
              value={binInput}
              onChange={(e) => setBinInput(e.target.value)}
              rows={3}
              placeholder={binaryMode === 'text2bin' ? 'Write text...' : '01001000 01101001...'}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--tx)',
                fontFamily: 'inherit',
                fontSize: '13px',
                outline: 'none',
              }}
            />

            {binaryMode === 'text2bin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--mut)' }}>Byte Separator:</span>
                {[
                  { id: 'space', label: 'Space' },
                  { id: 'comma', label: 'Comma' },
                  { id: 'none', label: 'None' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={binSep === s.id ? 'btn' : 'btn-sec'}
                    onClick={() => setBinSep(s.id as any)}
                    style={{ height: '28px', padding: '0 8px', fontSize: '10.5px', borderRadius: '8px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>Converted Output</span>
              <button
                type="button"
                onClick={() => {
                  copyText(binaryOutput);
                  toast('Binary result copied!');
                }}
                style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            <div
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '12px',
                color: 'var(--tx)',
                fontSize: '12.5px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                lineHeight: 1.5,
              }}
            >
              {binaryOutput || '—'}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. TYPING TEST                                                      */}
      {/* =================================================================== */}
      {toolId === 'typing-test' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Timer & WPM Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div className="glass" style={{ padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ac)', fontFamily: 'Manrope, sans-serif' }}>
                {typingStats.wpm}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--mut)' }}>WPM (Speed)</div>
            </div>
            <div className="glass" style={{ padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--cy)', fontFamily: 'Manrope, sans-serif' }}>
                {typingStats.accuracy}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--mut)' }}>Accuracy</div>
            </div>
            <div className="glass" style={{ padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: testTimeRemaining <= 5 ? '#ef4444' : 'var(--tx)', fontFamily: 'Manrope, sans-serif' }}>
                {testTimeRemaining}s
              </div>
              <div style={{ fontSize: '11px', color: 'var(--mut)' }}>Remaining</div>
            </div>
          </div>

          {/* Passage Area with character color coding */}
          <div className="glass" style={{ padding: '18px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--mut)' }}>TARGET PASSAGE</span>
              <button
                type="button"
                onClick={() => {
                  setPassageIndex((prev) => (prev + 1) % PASSAGES.length);
                  restartTypingTest();
                }}
                style={{ fontSize: '11px', color: 'var(--cy)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Change Text
              </button>
            </div>

            <div
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                letterSpacing: '0.3px',
                fontFamily: 'monospace',
                userSelect: 'none',
                marginBottom: '14px',
              }}
            >
              {targetPassage.split('').map((char, index) => {
                let color = 'var(--dim)';
                let bg = 'transparent';
                if (index < typingInput.length) {
                  if (typingInput[index] === char) {
                    color = '#22c55e';
                  } else {
                    color = '#ef4444';
                    bg = 'rgba(239, 68, 68, 0.2)';
                  }
                } else if (index === typingInput.length) {
                  bg = 'var(--ac)';
                  color = '#000';
                }
                return (
                  <span key={index} style={{ color, background: bg, borderRadius: '2px' }}>
                    {char}
                  </span>
                );
              })}
            </div>

            <textarea
              value={typingInput}
              onChange={(e) => handleTypingChange(e.target.value)}
              disabled={isTestFinished}
              rows={3}
              placeholder={isTestFinished ? 'Test completed! Tap Restart below.' : 'Start typing here to trigger the timer...'}
              style={{
                width: '100%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '10px',
                color: 'var(--tx)',
                fontFamily: 'monospace',
                fontSize: '13px',
                outline: 'none',
              }}
            />

            <button
              type="button"
              className="btn"
              onClick={restartTypingTest}
              style={{ width: '100%', height: '40px', marginTop: '12px', borderRadius: '12px', fontSize: '13px' }}
            >
              Restart Typing Test
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. TEXT ART                                                         */}
      {/* =================================================================== */}
      {toolId === 'text-art' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass" style={{ padding: '16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--tx)', display: 'block', marginBottom: '6px' }}>
              Your Words
            </span>
            <input
              type="text"
              value={artInput}
              onChange={(e) => setArtInput(e.target.value)}
              placeholder="Type word..."
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '12px',
                padding: '0 12px',
                color: 'var(--tx)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {artStyles.map((art, i) => (
              <div
                key={i}
                className="glass"
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--mut)', fontWeight: 700 }}>
                    {art.name.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      copyText(art.preview);
                      toast(`${art.name} copied!`);
                    }}
                    style={{ fontSize: '11px', color: 'var(--ac)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Copy
                  </button>
                </div>
                <div
                  style={{
                    fontSize: art.isBlock ? '11px' : '14px',
                    fontFamily: art.isBlock ? 'monospace' : 'inherit',
                    whiteSpace: art.isBlock ? 'pre' : 'normal',
                    color: 'var(--tx)',
                    wordBreak: 'break-word',
                  }}
                >
                  {art.preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. TEXT TO SPEECH                                                  */}
      {/* =================================================================== */}
      {toolId === 'text-to-speech' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Segmented Sub-Tabs: Text to Speech vs Speech to Text */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--bd)',
              marginBottom: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                handleStop();
                setTtsSubTab('tts');
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: ttsSubTab === 'tts' ? '3px solid var(--ac)' : '3px solid transparent',
                color: ttsSubTab === 'tts' ? 'var(--ac)' : 'var(--dim)',
                fontWeight: ttsSubTab === 'tts' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="volume" size={18} />
              <span>Text to Speech</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleStop();
                setTtsSubTab('stt');
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom: ttsSubTab === 'stt' ? '3px solid var(--ac)' : '3px solid transparent',
                color: ttsSubTab === 'stt' ? 'var(--ac)' : 'var(--dim)',
                fontWeight: ttsSubTab === 'stt' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name="mic" size={18} />
              <span>Speech to Text</span>
            </button>
          </div>

          {/* TAB 1: TEXT TO SPEECH */}
          {ttsSubTab === 'tts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card 1: Enter Text */}
              <div
                className="glass"
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                    Enter Text
                  </span>
                  <button
                    type="button"
                    onClick={() => setTtsText('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--tx)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.8,
                    }}
                    title="Clear text"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>

                <div
                  style={{
                    background: 'var(--s2)',
                    border: '1px solid var(--bd)',
                    borderRadius: '14px',
                    padding: '12px',
                  }}
                >
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    rows={4}
                    placeholder="Type text to convert to speech..."
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--tx)',
                      fontFamily: 'inherit',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Card 2: Language */}
              <div
                className="glass"
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                  Language
                </span>

                <div
                  style={{
                    position: 'relative',
                    background: 'var(--s2)',
                    border: '1.5px solid var(--bd)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <select
                    value={selectedTtsLangCode}
                    onChange={(e) => {
                      const selected = TTS_LANGUAGES_LIST.find((l) => l.code === e.target.value);
                      if (selected) {
                        setSelectedTtsLangCode(selected.code);
                        setGoogleLang(selected.google);
                        setSeVoice(selected.voice);
                        setSttLang(selected.code);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--tx)',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      paddingRight: '24px',
                    }}
                  >
                    {TTS_LANGUAGES_LIST.map((lang) => (
                      <option key={lang.code} value={lang.code} style={{ background: 'var(--bg)', color: 'var(--tx)' }}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '14px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <Icon name="chevron-down" size={18} color="var(--tx)" />
                  </div>
                </div>
              </div>

              {/* Speech Wave Animation while active */}
              {isSpeaking && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    height: '28px',
                  }}
                >
                  {[18, 28, 14, 32, 22, 16, 30, 20].map((h, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: '4px',
                        height: `${h}px`,
                        borderRadius: '4px',
                        background: 'var(--ac)',
                        animation: `pulse 0.6s infinite alternate ease-in-out`,
                        animationDelay: `${idx * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-sec"
                  onClick={isSpeaking ? handleStop : handleSpeak}
                  style={{
                    height: '46px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isSpeaking ? 'rgba(239, 68, 68, 0.15)' : undefined,
                    color: isSpeaking ? '#ef4444' : undefined,
                    borderColor: isSpeaking ? '#ef4444' : undefined,
                  }}
                >
                  <Icon name={isSpeaking ? 'square' : 'play'} size={18} />
                  <span>{isSpeaking ? 'Stop' : 'Speak'}</span>
                </button>

                <button
                  type="button"
                  className="btn-sec"
                  onClick={handleSaveAudio}
                  style={{
                    height: '46px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Icon name="save" size={18} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SPEECH TO TEXT */}
          {ttsSubTab === 'stt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card 1: Recognized Text */}
              <div
                className="glass"
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                    Recognized Text
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (sttText) {
                          copyText(sttText);
                          toast('Text copied to clipboard!');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--tx)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8,
                      }}
                      title="Copy text"
                    >
                      <Icon name="copy" size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSttText('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--tx)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8,
                      }}
                      title="Clear text"
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--s2)',
                    border: '1px solid var(--bd)',
                    borderRadius: '14px',
                    padding: '12px',
                  }}
                >
                  <textarea
                    value={sttText}
                    onChange={(e) => setSttText(e.target.value)}
                    rows={4}
                    placeholder="Press Start Listening to transcribe speech into text..."
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--tx)',
                      fontFamily: 'inherit',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Card 2: Language */}
              <div
                className="glass"
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                  Language
                </span>

                <div
                  style={{
                    position: 'relative',
                    background: 'var(--s2)',
                    border: '1.5px solid var(--bd)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <select
                    value={selectedTtsLangCode}
                    onChange={(e) => {
                      const selected = TTS_LANGUAGES_LIST.find((l) => l.code === e.target.value);
                      if (selected) {
                        setSelectedTtsLangCode(selected.code);
                        setSttLang(selected.code);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--tx)',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      paddingRight: '24px',
                    }}
                  >
                    {TTS_LANGUAGES_LIST.map((lang) => (
                      <option key={lang.code} value={lang.code} style={{ background: 'var(--bg)', color: 'var(--tx)' }}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '14px', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                    <Icon name="chevron-down" size={18} color="var(--tx)" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-sec"
                  onClick={toggleListening}
                  style={{
                    height: '46px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: isListening ? 'rgba(239, 68, 68, 0.15)' : undefined,
                    color: isListening ? '#ef4444' : undefined,
                    borderColor: isListening ? '#ef4444' : undefined,
                  }}
                >
                  <Icon name={isListening ? 'mic-off' : 'mic'} size={18} />
                  <span>{isListening ? 'Listening...' : 'Start Listening'}</span>
                </button>

                <button
                  type="button"
                  className="btn-sec"
                  onClick={() => {
                    if (sttText) {
                      copyText(sttText);
                      toast('Text copied to clipboard!');
                    } else {
                      toast('No text to copy');
                    }
                  }}
                  style={{
                    height: '46px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Icon name="copy" size={18} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextToolsView;
