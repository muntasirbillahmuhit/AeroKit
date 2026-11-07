/*
 * AeroKit Calculator Engine
 * Recursive-descent parser, safe evaluation of arithmetic & scientific expressions.
 */

function fact(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const FUNCS = ['sin', 'cos', 'tan', 'log', 'ln'] as const;

interface Token {
  t: string;
  v?: any;
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let m: RegExpExecArray | null;

  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if ((m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i)))) {
      tokens.push({ t: 'num', v: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    const fn = FUNCS.find((f) => src.startsWith(f, i));
    if (fn) {
      tokens.push({ t: 'fn', v: fn });
      i += fn.length;
      continue;
    }
    if (ch === 'π') {
      tokens.push({ t: 'num', v: Math.PI });
      i++;
      continue;
    }
    if (ch === 'e') {
      tokens.push({ t: 'num', v: Math.E });
      i++;
      continue;
    }
    if (ch === '√') {
      tokens.push({ t: 'sqrt' });
      i++;
      continue;
    }
    if ('+-*/^!%²()'.indexOf(ch) !== -1) {
      tokens.push({ t: ch });
      i++;
      continue;
    }
    throw new Error('Invalid expression');
  }
  return tokens;
}

function evaluateTokens(tokens: Token[], angleMode: 'DEG' | 'RAD'): number {
  let pos = 0;
  const peek = () => tokens[pos] && tokens[pos].t;
  const take = () => tokens[pos++];
  const toRad = (x: number) => (angleMode === 'DEG' ? (Math.PI / 180) * x : x);

  function expr(): number {
    let v = term();
    while (peek() === '+' || peek() === '-') {
      const op = take().t;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }

  function term(): number {
    let v = unary();
    while (peek() === '*' || peek() === '/') {
      const op = take().t;
      const r = unary();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }

  function unary(): number {
    if (peek() === '-') {
      take();
      return -unary();
    }
    if (peek() === '+') {
      take();
      return unary();
    }
    return power();
  }

  function power(): number {
    const base = postfix();
    if (peek() === '^') {
      take();
      return Math.pow(base, unary());
    }
    return base;
  }

  function postfix(): number {
    let v = primary();
    for (;;) {
      const p = peek();
      if (p === '!') {
        take();
        v = fact(v);
      } else if (p === '%') {
        take();
        v = v / 100;
      } else if (p === '²') {
        take();
        v = v * v;
      } else {
        break;
      }
    }
    return v;
  }

  function group(): number {
    if (peek() !== '(') throw new Error('Error');
    take();
    const v = expr();
    if (peek() !== ')') throw new Error('Error');
    take();
    return v;
  }

  function primary(): number {
    const tk = tokens[pos];
    if (!tk) throw new Error('Error');
    if (tk.t === 'num') {
      pos++;
      return tk.v;
    }
    if (tk.t === '(') return group();
    if (tk.t === 'sqrt') {
      take();
      if (peek() === '(') return Math.sqrt(group());
      if (peek() === 'num') return Math.sqrt(take().v);
      throw new Error('Error');
    }
    if (tk.t === 'fn') {
      take();
      const arg = group();
      switch (tk.v) {
        case 'sin':
          return Math.sin(toRad(arg));
        case 'cos':
          return Math.cos(toRad(arg));
        case 'tan':
          return Math.tan(toRad(arg));
        case 'log':
          return Math.log10(arg);
        case 'ln':
          return Math.log(arg);
        default:
          return Math.log(arg);
      }
    }
    throw new Error('Error');
  }

  const result = expr();
  if (pos !== tokens.length) throw new Error('Error');
  return result;
}

export function evaluateCalc(
  exprStr: string,
  angleMode: 'DEG' | 'RAD' = 'DEG'
): { value: number | null; error?: string } {
  if (!exprStr.trim()) return { value: 0 };
  try {
    const s = exprStr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (/\/0(?!\.)(?!\d)/.test(s)) return { value: null, error: 'Cannot divide by 0' };

    const tokens = tokenize(s);
    // drop trailing operators for live preview
    while (tokens.length && /^[+\-*/^]$/.test(tokens[tokens.length - 1].t)) {
      tokens.pop();
    }
    // auto-close open parentheses
    let open = 0;
    tokens.forEach((tk) => {
      if (tk.t === '(') open++;
      else if (tk.t === ')') open--;
    });
    while (open-- > 0) tokens.push({ t: ')' });
    if (!tokens.length) return { value: 0 };

    const r = evaluateTokens(tokens, angleMode);
    if (typeof r !== 'number' || Number.isNaN(r)) return { value: null, error: 'Error' };
    if (!Number.isFinite(r)) return { value: null, error: 'Cannot divide by 0' };
    return { value: r };
  } catch {
    return { value: null, error: 'Error' };
  }
}

export function formatNumber(num: number): string {
  if (Number.isNaN(num)) return 'Error';
  if (!Number.isFinite(num)) return 'Cannot divide by 0';
  const clean = Number.isInteger(num) ? num : parseFloat(num.toPrecision(14));
  if (Math.abs(clean) >= 1e16 || (Math.abs(clean) < 1e-7 && clean !== 0)) {
    return clean.toExponential(6);
  }
  return clean.toLocaleString('en-US', { maximumFractionDigits: 10 });
}
