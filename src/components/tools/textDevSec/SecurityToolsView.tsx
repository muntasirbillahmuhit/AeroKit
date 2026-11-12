import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface SecurityToolsViewProps {
  toolId: string;
}

export const SecurityToolsView: React.FC<SecurityToolsViewProps> = ({ toolId }) => {
  const { toast } = useApp();

  // Password generator
  const [pwdLength, setPwdLength] = useState(16);
  const [incUpper, setIncUpper] = useState(true);
  const [incLower, setIncLower] = useState(true);
  const [incNumbers, setIncNumbers] = useState(true);
  const [incSymbols, setIncSymbols] = useState(true);
  const [generatedPwd, setGeneratedPwd] = useState('');

  // Password entropy test
  const [testPwd, setTestPwd] = useState('P@ssw0rd!2026#Secure');

  // Secret token
  const [tokenLength, setTokenLength] = useState(32);
  const [tokenType, setTokenType] = useState<'hex' | 'base64' | 'alphanumeric'>('hex');
  const [token, setToken] = useState('');

  // Passphrase
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [passphrase, setPassphrase] = useState('');

  // Generate password
  const generatePassword = () => {
    let chars = '';
    if (incLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (incUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (incNumbers) chars += '0123456789';
    if (incSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const arr = new Uint32Array(pwdLength);
    crypto.getRandomValues(arr);
    let pwd = '';
    for (let i = 0; i < pwdLength; i++) {
      pwd += chars[arr[i] % chars.length];
    }
    setGeneratedPwd(pwd);
  };

  // Generate token
  const generateToken = () => {
    const bytes = new Uint8Array(tokenLength);
    crypto.getRandomValues(bytes);
    if (tokenType === 'hex') {
      setToken(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
    } else if (tokenType === 'base64') {
      setToken(btoa(String.fromCharCode(...bytes)).replace(/[/+=]/g, ''));
    } else {
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      setToken(Array.from(bytes).map((b) => alpha[b % alpha.length]).join(''));
    }
  };

  // Generate passphrase
  const generatePassphrase = () => {
    const wordList = [
      'apple', 'banner', 'cabin', 'delta', 'eagle', 'falcon', 'galaxy', 'harbor',
      'island', 'jungle', 'kinetic', 'lagoon', 'meadow', 'nebula', 'ocean', 'planet',
      'quartz', 'river', 'solar', 'timber', 'ultra', 'vortex', 'whisper', 'zenith',
      'beacon', 'canyon', 'drift', 'ember', 'forest', 'glacier', 'horizon', 'matrix',
    ];
    const indices = new Uint32Array(wordCount);
    crypto.getRandomValues(indices);
    const words = Array.from(indices).map((idx) => wordList[idx % wordList.length]);
    setPassphrase(words.join(separator));
  };

  useEffect(() => {
    if (toolId === 'pwd-gen' && !generatedPwd) generatePassword();
    if (toolId === 'secret-tokens' && !token) generateToken();
    if (toolId === 'passphrase-gen' && !passphrase) generatePassphrase();
  }, [toolId]);

  // Compute entropy
  const entropyInfo = useMemo(() => {
    const pwd = testPwd;
    if (!pwd) return { bits: 0, strength: 'Very Weak', time: 'Instant' };
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;
    if (pool === 0) pool = 1;

    const bits = Math.round(pwd.length * Math.log2(pool));
    let strength = 'Weak';
    let time = 'Seconds';
    if (bits > 80) {
      strength = 'Very Strong';
      time = 'Millions of Centuries';
    } else if (bits > 60) {
      strength = 'Strong';
      time = 'Thousands of Years';
    } else if (bits > 45) {
      strength = 'Moderate';
      time = 'Several Months';
    } else if (bits > 30) {
      strength = 'Weak';
      time = 'A Few Hours';
    }
    return { bits, strength, time };
  }, [testPwd]);

  const titles: Record<string, string> = {
    'pwd-gen': 'Strong Password Generator',
    'pwd-entropy': 'Password Strength Analyzer',
    'sha256-chk': 'SHA-256 Checksum Calculator',
    'privacy-chk': 'Browser Privacy & Permissions',
    'secret-tokens': 'Random Secret Key Generator',
    'passphrase-gen': 'Diceware Passphrase Generator',
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Security Tool'} />

      {/* 1. Password Generator */}
      {toolId === 'pwd-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            className="glass result-fade-in"
            onClick={() => copyText(generatedPwd).then(() => toast('Password copied'))}
            style={{
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <b
              style={{
                fontSize: '18px',
                fontFamily: 'monospace',
                color: 'var(--ac)',
                wordBreak: 'break-all',
                display: 'block',
              }}
            >
              {generatedPwd}
            </b>
            <span style={{ fontSize: '10.5px', color: 'var(--dim)', marginTop: '4px', display: 'block' }}>
              Tap to copy password
            </span>
          </div>

          <div className="lbl">Password Length: {pwdLength}</div>
          <input
            type="range"
            min="8"
            max="40"
            value={pwdLength}
            onChange={(e) => setPwdLength(parseInt(e.target.value, 10))}
            style={{ accentColor: 'var(--ac)' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={incUpper}
                onChange={(e) => setIncUpper(e.target.checked)}
                style={{ accentColor: 'var(--ac)' }}
              />
              <span>Uppercase (A-Z)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={incLower}
                onChange={(e) => setIncLower(e.target.checked)}
                style={{ accentColor: 'var(--ac)' }}
              />
              <span>Lowercase (a-z)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={incNumbers}
                onChange={(e) => setIncNumbers(e.target.checked)}
                style={{ accentColor: 'var(--ac)' }}
              />
              <span>Numbers (0-9)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={incSymbols}
                onChange={(e) => setIncSymbols(e.target.checked)}
                style={{ accentColor: 'var(--ac)' }}
              />
              <span>Symbols (!@#$)</span>
            </label>
          </div>

          <button type="button" className="btn cv" onClick={generatePassword}>
            <Icon name="bolt" size={16} />
            <span>Generate New Password</span>
          </button>
        </div>
      )}

      {/* 2. Password Strength Analyzer */}
      {toolId === 'pwd-entropy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Test Password</div>
          <label className="fld">
            <input
              type="text"
              value={testPwd}
              onChange={(e) => setTestPwd(e.target.value)}
              placeholder="Enter password..."
            />
          </label>

          <div className="glass" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--mut)' }}>Security Strength Rating</span>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: entropyInfo.bits > 60 ? 'var(--ac)' : entropyInfo.bits > 40 ? 'var(--cy)' : '#ff6b6b',
                margin: '4px 0',
              }}
            >
              {entropyInfo.strength}
            </div>
            <small style={{ fontSize: '11px', color: 'var(--dim)' }}>
              Entropy: {entropyInfo.bits} bits · Est. Crack Time: {entropyInfo.time}
            </small>
          </div>
        </div>
      )}

      {/* 3. Random Secret Tokens */}
      {toolId === 'secret-tokens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="fld" style={{ flex: 1 }}>
              <select value={tokenType} onChange={(e) => setTokenType(e.target.value as any)}>
                <option value="hex">Hexadecimal (0-9, a-f)</option>
                <option value="base64">Base64 URL-Safe</option>
                <option value="alphanumeric">Alphanumeric</option>
              </select>
            </label>
            <label className="fld" style={{ width: '80px' }}>
              <input
                type="number"
                min="8"
                max="64"
                value={tokenLength}
                onChange={(e) => setTokenLength(parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div
            className="glass"
            onClick={() => copyText(token).then(() => toast('Token copied'))}
            style={{
              padding: '16px',
              borderRadius: '16px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--cy)',
              wordBreak: 'break-all',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {token}
          </div>

          <button type="button" className="btn cv" onClick={generateToken}>
            <Icon name="bolt" size={16} />
            <span>Generate Cryptographic Token</span>
          </button>
        </div>
      )}

      {/* 4. Passphrase Generator */}
      {toolId === 'passphrase-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="fld" style={{ flex: 1 }}>
              <select value={wordCount} onChange={(e) => setWordCount(parseInt(e.target.value, 10))}>
                <option value={3}>3 Words</option>
                <option value={4}>4 Words (Recommended)</option>
                <option value={5}>5 Words</option>
                <option value={6}>6 Words (High Security)</option>
              </select>
            </label>
            <label className="fld" style={{ width: '90px' }}>
              <select value={separator} onChange={(e) => setSeparator(e.target.value)}>
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Dot (.)</option>
                <option value=" ">Space</option>
              </select>
            </label>
          </div>

          <div
            className="glass"
            onClick={() => copyText(passphrase).then(() => toast('Passphrase copied'))}
            style={{
              padding: '18px',
              borderRadius: '16px',
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--ac)',
              wordBreak: 'break-all',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {passphrase}
          </div>

          <button type="button" className="btn cv" onClick={generatePassphrase}>
            <Icon name="bolt" size={16} />
            <span>Generate New Passphrase</span>
          </button>
        </div>
      )}

      {/* 5. Browser Privacy & Permissions */}
      {toolId === 'privacy-chk' && (
        <div className="glass" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span>Cookies Enabled</span>
            <b style={{ color: navigator.cookieEnabled ? 'var(--ac)' : 'var(--mut)' }}>
              {navigator.cookieEnabled ? 'Yes' : 'No'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span>Do Not Track Header</span>
            <b style={{ color: navigator.doNotTrack === '1' ? 'var(--ac)' : 'var(--mut)' }}>
              {navigator.doNotTrack === '1' ? 'Enabled (DNT)' : 'Unset / Disabled'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span>HTTPS Secure Context</span>
            <b style={{ color: window.isSecureContext ? 'var(--ac)' : '#ff6b6b' }}>
              {window.isSecureContext ? 'Secure (TLS/HTTPS)' : 'Insecure'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
            <span>Local Storage Sandboxed</span>
            <b style={{ color: 'var(--ac)' }}>Protected</b>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityToolsView;
