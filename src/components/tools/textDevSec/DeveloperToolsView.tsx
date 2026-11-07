import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface DeveloperToolsViewProps {
  toolId: string;
}

export const DeveloperToolsView: React.FC<DeveloperToolsViewProps> = ({ toolId }) => {
  const { toast } = useApp();

  // JSON formatter
  const [jsonInput, setJsonInput] = useState('{"name":"AeroKit","tools":75,"status":"active","features":["calc","converter","qr"]}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // UUID generator
  const [uuidList, setUuidList] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState(1);

  // Hash generator
  const [hashInput, setHashInput] = useState('Hello World');
  const [hashes, setHashes] = useState<{ sha1: string; sha256: string; sha512: string }>({
    sha1: '',
    sha256: '',
    sha512: '',
  });

  // JWT Decoder
  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggTWVyY2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4zC4X-b8'
  );

  // Regex tester
  const [regexPattern, setRegexPattern] = useState('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('Contact us at support@aerokit.app or dev@example.com for help.');

  // HTML entity
  const [entityText, setEntityText] = useState('<h1>Hello & welcome to AeroKit!</h1>');

  // Epoch converter
  const [epochInput, setEpochInput] = useState(() => Math.floor(Date.now() / 1000).toString());

  // Generate UUID
  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      if (crypto.randomUUID) list.push(crypto.randomUUID());
      else {
        list.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        }));
      }
    }
    setUuidList(list);
    toast(`Generated ${uuidCount} UUID(s)`);
  };

  useEffect(() => {
    if (toolId === 'uuid-gen' && uuidList.length === 0) {
      generateUuids();
    }
  }, [toolId]);

  // Compute hashes using Web Crypto
  useEffect(() => {
    if (toolId === 'hash-gen' && hashInput) {
      const buffer = new TextEncoder().encode(hashInput);
      Promise.all([
        crypto.subtle.digest('SHA-1', buffer),
        crypto.subtle.digest('SHA-256', buffer),
        crypto.subtle.digest('SHA-512', buffer),
      ]).then(([s1, s256, s512]) => {
        const toHex = (buf: ArrayBuffer) =>
          Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        setHashes({
          sha1: toHex(s1),
          sha256: toHex(s256),
          sha512: toHex(s512),
        });
      }).catch(() => {});
    }
  }, [toolId, hashInput]);

  // JWT Decoded parts
  const jwtParts = useMemo(() => {
    try {
      const parts = jwtInput.split('.');
      if (parts.length < 2) return null;
      const header = JSON.parse(decodeURIComponent(escape(atob(parts[0]))));
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
      return { header, payload };
    } catch {
      return null;
    }
  }, [jwtInput]);

  // Regex matches
  const regexMatches = useMemo(() => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = regexText.match(re);
      return matches ? Array.from(matches) : [];
    } catch {
      return null;
    }
  }, [regexPattern, regexFlags, regexText]);

  // Epoch date
  const epochDate = useMemo(() => {
    const num = parseInt(epochInput, 10);
    if (isNaN(num)) return null;
    const ms = epochInput.length > 11 ? num : num * 1000;
    const d = new Date(ms);
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
      relative: `${Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
    };
  }, [epochInput]);

  const titles: Record<string, string> = {
    'json-format': 'JSON Formatter & Validator',
    'uuid-gen': 'UUID / GUID Generator',
    'hash-gen': 'Hash Generator',
    'sha256-chk': 'SHA-256 Checksum Calculator',
    'jwt-decode': 'JWT Token Inspector',
    'regex-test': 'Regex Tester',
    'html-entity': 'HTML Entity Encoder',
    'epoch-conv': 'Unix Timestamp Converter',
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Developer Tool'} />

      {/* 1. JSON Formatter */}
      {toolId === 'json-format' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">JSON Data</div>
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setJsonError(null);
            }}
            rows={7}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: jsonError ? '1px solid #ff6b6b' : '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          {jsonError && (
            <div style={{ color: '#ff6b6b', fontSize: '11px', fontWeight: 600 }}>
              {jsonError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonInput);
                  setJsonInput(JSON.stringify(parsed, null, 2));
                  setJsonError(null);
                  toast('Formatted with 2-space indentation');
                } catch (e: any) {
                  setJsonError(e.message);
                }
              }}
              style={{ flex: 1, height: '36px', fontSize: '11px' }}
            >
              Format / Prettify
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  const parsed = JSON.parse(jsonInput);
                  setJsonInput(JSON.stringify(parsed));
                  setJsonError(null);
                  toast('Minified JSON string');
                } catch (e: any) {
                  setJsonError(e.message);
                }
              }}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Minify
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => copyText(jsonInput).then(() => toast('JSON copied'))}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* 2. UUID Generator */}
      {toolId === 'uuid-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div className="lbl" style={{ margin: '0 0 4px' }}>Count</div>
              <label className="fld">
                <select value={uuidCount} onChange={(e) => setUuidCount(parseInt(e.target.value, 10))}>
                  <option value={1}>1 UUID</option>
                  <option value={5}>5 UUIDs</option>
                  <option value={10}>10 UUIDs</option>
                </select>
              </label>
            </div>
            <div style={{ flex: 1, alignSelf: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                onClick={generateUuids}
                style={{ height: '42px', fontSize: '12px', width: '100%' }}
              >
                <Icon name="bolt" size={15} />
                <span>Generate</span>
              </button>
            </div>
          </div>

          <div className="lbl" style={{ marginTop: '8px' }}>Generated UUID v4</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {uuidList.map((u, i) => (
              <div
                key={i}
                className="glass"
                onClick={() => copyText(u).then(() => toast(`Copied ${u}`))}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--ac)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span>{u}</span>
                <Icon name="copy" size={14} color="var(--dim)" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Hash Generator */}
      {toolId === 'hash-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Input Plain Text</div>
          <label className="fld">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Text to hash..."
            />
          </label>

          <div className="lbl" style={{ marginTop: '4px' }}>SHA-256</div>
          <div
            className="glass"
            onClick={() => copyText(hashes.sha256).then(() => toast('Copied SHA-256'))}
            style={{ padding: '10px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: 'var(--ac)', cursor: 'pointer' }}
          >
            {hashes.sha256 || '...'}
          </div>

          <div className="lbl">SHA-1</div>
          <div
            className="glass"
            onClick={() => copyText(hashes.sha1).then(() => toast('Copied SHA-1'))}
            style={{ padding: '10px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: 'var(--cy)', cursor: 'pointer' }}
          >
            {hashes.sha1 || '...'}
          </div>
        </div>
      )}

      {/* 3b. SHA-256 Checksum Calculator */}
      {toolId === 'sha256-chk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Input Data / Text</div>
          <label className="fld">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter text to calculate SHA-256 checksum..."
            />
          </label>

          <div className="lbl" style={{ marginTop: '4px' }}>SHA-256 Digest</div>
          <div
            className="glass"
            onClick={() => copyText(hashes.sha256).then(() => toast('Copied SHA-256 Checksum'))}
            style={{ padding: '14px', borderRadius: '14px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', color: 'var(--ac)', cursor: 'pointer', textAlign: 'center' }}
          >
            {hashes.sha256 || '...'}
          </div>
        </div>
      )}

      {/* 4. JWT Decoder */}
      {toolId === 'jwt-decode' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Encoded JWT Token</div>
          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '8px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          {jwtParts ? (
            <>
              <div className="lbl">Header (Algorithm &amp; Type)</div>
              <pre
                className="glass"
                style={{ padding: '10px', borderRadius: '12px', color: 'var(--ac)', fontSize: '11px', margin: 0 }}
              >
                {JSON.stringify(jwtParts.header, null, 2)}
              </pre>

              <div className="lbl">Payload Claims</div>
              <pre
                className="glass"
                style={{ padding: '10px', borderRadius: '12px', color: 'var(--cy)', fontSize: '11px', margin: 0 }}
              >
                {JSON.stringify(jwtParts.payload, null, 2)}
              </pre>
            </>
          ) : (
            <div style={{ color: '#ff6b6b', fontSize: '11px' }}>Invalid JWT format</div>
          )}
        </div>
      )}

      {/* 5. Regex Tester */}
      {toolId === 'regex-test' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="fld" style={{ flex: 3 }}>
              <input
                type="text"
                placeholder="Regular expression"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
              />
            </label>
            <label className="fld" style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="flags"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
              />
            </label>
          </div>

          <div className="lbl">Test String</div>
          <textarea
            value={regexText}
            onChange={(e) => setRegexText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontSize: '12px',
            }}
          />

          <div className="lbl">
            Matches ({regexMatches ? regexMatches.length : 'Invalid regex'})
          </div>
          <div className="glass" style={{ padding: '10px', borderRadius: '12px' }}>
            {regexMatches && regexMatches.length > 0 ? (
              regexMatches.map((m, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    background: 'rgba(198,255,61,0.2)',
                    color: 'var(--ac)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    margin: '3px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                >
                  {m}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>No matches found</span>
            )}
          </div>
        </div>
      )}

      {/* 6. HTML Entity & Epoch */}
      {toolId === 'html-entity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Text / HTML Source</div>
          <textarea
            value={entityText}
            onChange={(e) => setEntityText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontSize: '12px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const encoded = entityText
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
                setEntityText(encoded);
                toast('Entities encoded');
              }}
              style={{ flex: 1, height: '36px', fontSize: '11px' }}
            >
              Encode Entities
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const doc = new DOMParser().parseFromString(entityText, 'text/html');
                setEntityText(doc.documentElement.textContent || '');
                toast('Entities decoded');
              }}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Decode Entities
            </button>
          </div>
        </div>
      )}

      {toolId === 'epoch-conv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Unix Epoch Timestamp (Seconds or ms)</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="fld" style={{ flex: 1 }}>
              <input
                type="text"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn"
              onClick={() => setEpochInput(Math.floor(Date.now() / 1000).toString())}
              style={{ height: '42px', fontSize: '11px', padding: '0 12px' }}
            >
              Now
            </button>
          </div>

          {epochDate && (
            <div className="glass" style={{ padding: '14px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
                <span style={{ color: 'var(--mut)' }}>Local Time</span>
                <b>{epochDate.local}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
                <span style={{ color: 'var(--mut)' }}>UTC Time</span>
                <b style={{ color: 'var(--cy)' }}>{epochDate.utc}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
                <span style={{ color: 'var(--mut)' }}>ISO 8601</span>
                <b style={{ color: 'var(--ac)' }}>{epochDate.iso}</b>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeveloperToolsView;
