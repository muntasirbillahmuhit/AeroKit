import React, { useState, useMemo } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface TextToolsViewProps {
  toolId: string;
}

export const TextToolsView: React.FC<TextToolsViewProps> = ({ toolId }) => {
  const { toast } = useApp();

  // General text state
  const [inputText, setInputText] = useState('The quick brown fox jumps over the lazy dog.');
  const [diffTextB, setDiffTextB] = useState('The quick brown fox leaps over a sleeping dog.');

  // Lorem state
  const [loremCount, setLoremCount] = useState(3);
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences'>('paragraphs');

  // Case conversions
  const cases = useMemo(() => {
    const t = inputText;
    return {
      upper: t.toUpperCase(),
      lower: t.toLowerCase(),
      title: t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()),
      camel: t
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, ''),
      kebab: t
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      snake: t
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '_')
        .replace(/^_+|_+$/g, ''),
    };
  }, [inputText]);

  // Word count metrics
  const metrics = useMemo(() => {
    const t = inputText.trim();
    if (!t) return { words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readTime: '0s' };
    const words = t.split(/\s+/).filter(Boolean).length;
    const chars = inputText.length;
    const charsNoSpaces = inputText.replace(/\s/g, '').length;
    const sentences = t.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = t.split(/\n+/).filter(Boolean).length;
    const readSeconds = Math.ceil((words / 200) * 60);
    const readTime = readSeconds < 60 ? `${readSeconds} sec` : `${Math.ceil(readSeconds / 60)} min`;
    return { words, chars, charsNoSpaces, sentences, paragraphs, readTime };
  }, [inputText]);

  // Lorem Ipsum generator
  const generatedLorem = useMemo(() => {
    const sentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    ];
    if (loremType === 'sentences') {
      return Array.from({ length: loremCount }, (_, i) => sentences[i % sentences.length]).join(' ');
    }
    return Array.from({ length: loremCount }, () => sentences.join(' ')).join('\n\n');
  }, [loremCount, loremType]);

  // Line cleaner
  const cleanLines = (action: 'dedup' | 'trim' | 'sort') => {
    const lines = inputText.split('\n');
    let res: string[] = [];
    if (action === 'dedup') {
      res = [...new Set(lines.map((l) => l.trim()).filter(Boolean))];
      toast(`Removed duplicates: ${lines.length - res.length} lines reduced`);
    } else if (action === 'trim') {
      res = lines.map((l) => l.trim()).filter(Boolean);
      toast('Empty lines and spaces trimmed');
    } else if (action === 'sort') {
      res = [...lines].sort((a, b) => a.localeCompare(b));
      toast('Lines sorted alphabetically');
    }
    setInputText(res.join('\n'));
  };

  const titles: Record<string, string> = {
    'case-conv': 'Text Case Converter',
    'word-count': 'Word & Character Counter',
    'lorem-gen': 'Lorem Ipsum Generator',
    'url-enc': 'URL Encoder / Decoder',
    'base64-txt': 'Base64 Text Encoder',
    'slug-gen': 'URL Slug Generator',
    'line-clean': 'Duplicate Line Remover',
    'diff-text': 'Text Diff & Comparator',
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Text Tool'} />

      {/* 1. Case Converter */}
      {toolId === 'case-conv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Input Text</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'inherit',
              fontSize: '12.5px',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.upper);
                toast('Converted to UPPERCASE');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              UPPERCASE
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.lower);
                toast('Converted to lowercase');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              lowercase
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.title);
                toast('Converted to Title Case');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Title Case
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.camel);
                toast('Converted to camelCase');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              camelCase
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.kebab);
                toast('Converted to kebab-case');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              kebab-case
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(cases.snake);
                toast('Converted to snake_case');
              }}
              style={{ height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              snake_case
            </button>
          </div>

          <button
            type="button"
            className="btn cv"
            onClick={() => copyText(inputText).then(() => toast('Copied text'))}
            style={{ marginTop: '8px' }}
          >
            <Icon name="copy" size={16} />
            <span>Copy Converted Text</span>
          </button>
        </div>
      )}

      {/* 2. Word & Character Counter */}
      {toolId === 'word-count' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginBottom: '6px',
            }}
          >
            <div className="glass" style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <b style={{ fontSize: '18px', color: 'var(--ac)' }}>{metrics.words}</b>
              <small style={{ fontSize: '10.5px', color: 'var(--mut)', display: 'block' }}>Words</small>
            </div>
            <div className="glass" style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <b style={{ fontSize: '18px', color: 'var(--cy)' }}>{metrics.chars}</b>
              <small style={{ fontSize: '10.5px', color: 'var(--mut)', display: 'block' }}>Characters</small>
            </div>
            <div className="glass" style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
              <b style={{ fontSize: '18px', color: 'var(--bl)' }}>{metrics.readTime}</b>
              <small style={{ fontSize: '10.5px', color: 'var(--mut)', display: 'block' }}>Reading Time</small>
            </div>
          </div>

          <div className="lbl">Type or paste text below</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '12px',
              color: 'var(--tx)',
              fontFamily: 'inherit',
              fontSize: '12.5px',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--mut)', padding: '0 4px' }}>
            <span>Sentences: {metrics.sentences}</span>
            <span>Paragraphs: {metrics.paragraphs}</span>
            <span>Without spaces: {metrics.charsNoSpaces}</span>
          </div>
        </div>
      )}

      {/* 3. Lorem Ipsum Generator */}
      {toolId === 'lorem-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="fld" style={{ flex: 1 }}>
              <input
                type="number"
                min="1"
                max="20"
                value={loremCount}
                onChange={(e) => setLoremCount(parseInt(e.target.value, 10) || 1)}
              />
            </label>
            <label className="fld" style={{ flex: 1 }}>
              <select value={loremType} onChange={(e) => setLoremType(e.target.value as any)}>
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
              </select>
            </label>
          </div>

          <textarea
            value={generatedLorem}
            readOnly
            rows={7}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontSize: '11.5px',
              lineHeight: 1.45,
            }}
          />

          <button
            type="button"
            className="btn cv"
            onClick={() => copyText(generatedLorem).then(() => toast('Lorem Ipsum copied'))}
          >
            <Icon name="copy" size={16} />
            <span>Copy Generated Lorem</span>
          </button>
        </div>
      )}

      {/* 4. URL Encoder / Decoder */}
      {toolId === 'url-enc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">URL String</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setInputText(encodeURIComponent(inputText));
                toast('Encoded URL component');
              }}
              style={{ flex: 1, height: '38px', fontSize: '12px' }}
            >
              Encode URL
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  setInputText(decodeURIComponent(inputText));
                  toast('Decoded URL component');
                } catch {
                  toast('Invalid URL encoded string');
                }
              }}
              style={{ flex: 1, height: '38px', fontSize: '12px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Decode URL
            </button>
          </div>
        </div>
      )}

      {/* 5. Base64 Text Encoder */}
      {toolId === 'base64-txt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Text String</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  setInputText(btoa(unescape(encodeURIComponent(inputText))));
                  toast('Encoded to Base64');
                } catch {
                  toast('Encoding failed');
                }
              }}
              style={{ flex: 1, height: '38px', fontSize: '12px' }}
            >
              Encode Base64
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  setInputText(decodeURIComponent(escape(atob(inputText))));
                  toast('Decoded from Base64');
                } catch {
                  toast('Invalid Base64 input');
                }
              }}
              style={{ flex: 1, height: '38px', fontSize: '12px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Decode Base64
            </button>
          </div>
        </div>
      )}

      {/* 6. Slug Generator */}
      {toolId === 'slug-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Article or Page Title</div>
          <label className="fld">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 10 Essential Productivity Tools for Developers"
            />
          </label>

          <div className="lbl">Generated Slug</div>
          <div
            className="glass result-fade-in"
            style={{
              padding: '14px',
              borderRadius: '14px',
              wordBreak: 'break-all',
              color: 'var(--ac)',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {cases.kebab || '—'}
          </div>

          <button
            type="button"
            className="btn cv"
            onClick={() => copyText(cases.kebab).then(() => toast(`Copied slug "${cases.kebab}"`))}
          >
            <Icon name="copy" size={16} />
            <span>Copy Slug</span>
          </button>
        </div>
      )}

      {/* 7. Line Cleaner */}
      {toolId === 'line-clean' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Input Multi-line List</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => cleanLines('dedup')}
              style={{ flex: 1, height: '36px', fontSize: '11px' }}
            >
              Remove Dupes
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => cleanLines('trim')}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Trim Empty
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => cleanLines('sort')}
              style={{ flex: 1, height: '36px', fontSize: '11px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Sort A-Z
            </button>
          </div>
        </div>
      )}

      {/* 8. Text Diff */}
      {toolId === 'diff-text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Text A (Original)</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '8px',
              color: 'var(--tx)',
              fontSize: '11px',
            }}
          />

          <div className="lbl">Text B (Modified)</div>
          <textarea
            value={diffTextB}
            onChange={(e) => setDiffTextB(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '8px',
              color: 'var(--tx)',
              fontSize: '11px',
            }}
          />

          <div className="lbl">Comparison Status</div>
          <div
            className="glass"
            style={{
              padding: '12px',
              borderRadius: '12px',
              fontSize: '12px',
              textAlign: 'center',
              color: inputText === diffTextB ? 'var(--ac)' : '#ffb54a',
            }}
          >
            {inputText === diffTextB ? '✓ Both texts are completely identical' : '⚠ Differences detected between inputs'}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToolsView;
