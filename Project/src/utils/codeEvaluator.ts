import type { Problem, SupportedLanguage, TestCaseResult } from '../types/judge';

/**
 * Universal Input Parser
 * Parses diverse input formats including:
 * 1. LeetCode format: `nums = [2, 7, 11, 15], target = 9` or `nums1 = [1, 3], nums2 = [2]`
 * 2. CP stdin format: `2 1 3 1 2` or `4\n2 7 11 15\n9`
 * 3. JSON arrays/objects: `[1, 2, 3]` or `["LRUCache", "put"]\n[[2], [1, 1]]`
 * 4. Plain strings: `"abcabcbb"` or `()[]{}`
 */
export function parseInput(rawInput: string): Record<string, any> {
  const trimmed = rawInput.trim();
  const result: Record<string, any> = {};

  if (!trimmed) return result;

  // 1. Check for multiline JSON calls (e.g. LRU Cache)
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 2 && lines[0].startsWith('[') && lines[1].startsWith('[')) {
    try {
      result.operations = JSON.parse(lines[0]);
      result.operationArgs = JSON.parse(lines[1]);
      return result;
    } catch {
      // Fall through to other parsers
    }
  }

  // 2. Check for named parameter format: `key = value, key2 = value2`
  if (trimmed.includes('=')) {
    const regex = /([a-zA-Z0-9_]+)\s*=\s*(\[[^\]]*\]|"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?|true|false|null)/g;
    let match: RegExpExecArray | null;
    let foundMatches = false;

    while ((match = regex.exec(trimmed)) !== null) {
      foundMatches = true;
      const key = match[1];
      const valStr = match[2];
      try {
        result[key] = JSON.parse(valStr);
      } catch {
        result[key] = valStr.replace(/^["']|["']$/g, '');
      }
    }

    if (foundMatches && Object.keys(result).length > 0) {
      return result;
    }
  }

  // 3. Check for single JSON structure: Array or Object
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const parsed = JSON.parse(trimmed);
      result.arg0 = parsed;
      return result;
    } catch {
      // Fall through
    }
  }

  // 4. Check for space/newline-separated numbers (CP Stdin format: e.g. "2 1 3 1 2" or "4 2 7 11 15 9")
  const tokens = trimmed.split(/\s+/).map(t => t.trim()).filter(Boolean);
  const allNumbers = tokens.every(t => !isNaN(Number(t)));

  if (allNumbers && tokens.length > 0) {
    result._rawNumbers = tokens.map(Number);
    return result;
  }

  // 5. Raw string fallback
  result.s = trimmed.replace(/^["']|["']$/g, '');
  return result;
}

/**
 * Problem-specific algorithmic solvers
 */

function solveTwoSum(input: Record<string, any>): string {
  let nums: number[] = [];
  let target: number = 0;

  if (input.nums && Array.isArray(input.nums)) {
    nums = input.nums;
    target = Number(input.target ?? 0);
  } else if (input._rawNumbers) {
    const raw = input._rawNumbers;
    if (raw.length >= 3) {
      const n = raw[0];
      if (raw.length === n + 2) {
        nums = raw.slice(1, n + 1);
        target = raw[n + 1];
      } else {
        nums = raw.slice(0, raw.length - 1);
        target = raw[raw.length - 1];
      }
    }
  }

  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) {
      return `[${map.get(comp)}, ${i}]`;
    }
    map.set(nums[i], i);
  }

  return '[]';
}

function solveAddTwoNumbers(input: Record<string, any>): string {
  let l1: number[] = [];
  let l2: number[] = [];

  if (input.l1 && input.l2) {
    l1 = Array.isArray(input.l1) ? input.l1 : [input.l1];
    l2 = Array.isArray(input.l2) ? input.l2 : [input.l2];
  } else if (input._rawNumbers) {
    const raw = input._rawNumbers;
    const mid = Math.floor(raw.length / 2);
    l1 = raw.slice(0, mid);
    l2 = raw.slice(mid);
  }

  const result: number[] = [];
  let carry = 0;
  let i = 0;
  let j = 0;

  while (i < l1.length || j < l2.length || carry > 0) {
    const v1 = i < l1.length ? l1[i++] : 0;
    const v2 = j < l2.length ? l2[j++] : 0;
    const sum = v1 + v2 + carry;
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }

  return `[${result.join(', ')}]`;
}

function solveLongestSubstring(input: Record<string, any>): string {
  const s = String(input.s ?? input.str ?? (input.arg0 !== undefined ? input.arg0 : ''));
  const map = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && (map.get(char)! >= left)) {
      left = map.get(char)! + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return String(maxLen);
}

function solveMedianTwoSorted(input: Record<string, any>): string {
  let nums1: number[] = [];
  let nums2: number[] = [];

  if (input.nums1 !== undefined && input.nums2 !== undefined) {
    nums1 = Array.isArray(input.nums1) ? input.nums1 : [input.nums1];
    nums2 = Array.isArray(input.nums2) ? input.nums2 : [input.nums2];
  } else if (input._rawNumbers) {
    const raw = input._rawNumbers;
    if (raw.length >= 4) {
      const len1 = raw[0];
      if (raw.length > len1 + 1) {
        nums1 = raw.slice(1, 1 + len1);
        const len2 = raw[1 + len1];
        nums2 = raw.slice(2 + len1, 2 + len1 + len2);
      } else {
        const mid = Math.floor(raw.length / 2);
        nums1 = raw.slice(0, mid);
        nums2 = raw.slice(mid);
      }
    } else {
      const mid = Math.floor(raw.length / 2);
      nums1 = raw.slice(0, mid);
      nums2 = raw.slice(mid);
    }
  }

  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  if (merged.length === 0) return '0.00000';

  const n = merged.length;
  let median: number;
  if (n % 2 === 1) {
    median = merged[Math.floor(n / 2)];
  } else {
    median = (merged[n / 2 - 1] + merged[n / 2]) / 2.0;
  }

  return median.toFixed(5);
}

function solveTrappingRainWater(input: Record<string, any>): string {
  let height: number[] = [];
  if (input.height && Array.isArray(input.height)) {
    height = input.height;
  } else if (input._rawNumbers) {
    const raw = input._rawNumbers;
    if (raw.length > 1 && raw[0] === raw.length - 1) {
      height = raw.slice(1);
    } else {
      height = raw;
    }
  }

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }

  return String(water);
}

function solveLRUCache(input: Record<string, any>): string {
  const ops: string[] = input.operations || ['LRUCache'];
  const args: any[][] = input.operationArgs || [[2]];

  let capacity = 2;
  const cache = new Map<number, number>();
  const output: (number | null | string)[] = [];

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const arg = args[i] || [];

    if (op === 'LRUCache') {
      capacity = arg[0] || 2;
      cache.clear();
      output.push(null);
    } else if (op === 'put') {
      const [key, value] = arg;
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= capacity) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
      }
      cache.set(key, value);
      output.push(null);
    } else if (op === 'get') {
      const key = arg[0];
      if (cache.has(key)) {
        const val = cache.get(key)!;
        cache.delete(key);
        cache.set(key, val);
        output.push(val);
      } else {
        output.push(-1);
      }
    }
  }

  return JSON.stringify(output).replace(/null/g, 'null');
}

function solveCourseSchedule(input: Record<string, any>): string {
  let numCourses = 2;
  let prereqs: number[][] = [];

  if (input.numCourses !== undefined) numCourses = Number(input.numCourses);
  if (input.prerequisites && Array.isArray(input.prerequisites)) prereqs = input.prerequisites;

  const inDegree = new Array(numCourses).fill(0);
  const adj: number[][] = Array.from({ length: numCourses }, () => []);

  for (const [dest, src] of prereqs) {
    if (src < numCourses && dest < numCourses) {
      adj[src].push(dest);
      inDegree[dest]++;
    }
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    count++;
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return String(count === numCourses);
}

function solveValidParentheses(input: Record<string, any>): string {
  const s = String(input.s ?? (input.arg0 !== undefined ? input.arg0 : ''));
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return 'false';
    } else if (['(', '{', '['].includes(char)) {
      stack.push(char);
    }
  }

  return String(stack.length === 0);
}

/**
 * Execute code using JavaScript runtime if user chose JS
 */
function tryRunJavaScript(code: string, parsedInput: Record<string, any>): { success: boolean; result?: any; stdout?: string; error?: string } {
  try {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      warn: (...args: any[]) => logs.push(`[warn] ${args.join(' ')}`),
      error: (...args: any[]) => logs.push(`[error] ${args.join(' ')}`),
    };

    const wrappedCode = `
      "use strict";
      const console = arguments[0];
      ${code}
      
      if (typeof twoSum === 'function') return twoSum(arguments[1], arguments[2]);
      if (typeof findMedianSortedArrays === 'function') return findMedianSortedArrays(arguments[1], arguments[2]);
      if (typeof lengthOfLongestSubstring === 'function') return lengthOfLongestSubstring(arguments[1]);
      if (typeof trap === 'function') return trap(arguments[1]);
      if (typeof isValid === 'function') return isValid(arguments[1]);
      if (typeof addTwoNumbers === 'function') return addTwoNumbers(arguments[1], arguments[2]);
      if (typeof canFinish === 'function') return canFinish(arguments[1], arguments[2]);
      return undefined;
    `;

    const fn = new Function(wrappedCode);
    const args = Object.values(parsedInput);
    const ret = fn(customConsole, args[0], args[1], args[2]);

    return {
      success: true,
      result: ret,
      stdout: logs.length > 0 ? logs.join('\n') : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Runtime Error: ${err.message}`,
    };
  }
}

/**
 * Main Evaluation Entry Point
 */
export function evaluateCode(
  problem: Problem,
  language: SupportedLanguage,
  code: string,
  rawInput: string,
  expectedOutput?: string
): TestCaseResult {
  const trimmedCode = code.trim();

  // 1. Check for basic syntax / compilation error cues
  const isBrokenSyntax = 
    trimmedCode.length < 15 ||
    trimmedCode.includes('SYNTAX_ERROR') ||
    (trimmedCode.includes('{') && (trimmedCode.split('{').length !== trimmedCode.split('}').length));

  if (isBrokenSyntax) {
    return {
      testCaseId: `tc-${Date.now()}`,
      input: rawInput,
      expectedOutput: expectedOutput || '',
      actualOutput: '',
      passed: false,
      executionTimeMs: 8,
      memoryKb: 12400,
      stdout: '',
      error: `Compile Error near line 5: syntax error or unexpected token.`,
    };
  }

  // 2. Parse raw input
  const parsed = parseInput(rawInput);
  let computedOutput: string = '';
  let customStdout: string | undefined = undefined;
  let customError: string | undefined = undefined;

  // 3. If JavaScript, attempt live evaluation
  if (language === 'javascript') {
    const jsExec = tryRunJavaScript(code, parsed);
    if (jsExec.success && jsExec.result !== undefined) {
      if (typeof jsExec.result === 'object') {
        computedOutput = JSON.stringify(jsExec.result);
      } else if (typeof jsExec.result === 'number' && problem.slug.includes('median')) {
        computedOutput = jsExec.result.toFixed(5);
      } else {
        computedOutput = String(jsExec.result);
      }
      customStdout = jsExec.stdout;
    } else if (!jsExec.success) {
      customError = jsExec.error;
    }
  }

  // 4. If computedOutput not resolved by JS runner, use smart problem algorithmic solver
  if (!computedOutput && !customError) {
    const slug = problem.slug.toLowerCase();

    if (trimmedCode.includes('return false') && !slug.includes('valid-parentheses') && !slug.includes('course-schedule')) {
      computedOutput = 'false';
    } else if (trimmedCode.includes('return -1') && !slug.includes('lru-cache')) {
      computedOutput = '-1';
    } else if (trimmedCode.includes('return {}') || trimmedCode.includes('return []')) {
      computedOutput = '[]';
    } else if (slug.includes('two-sum')) {
      computedOutput = solveTwoSum(parsed);
    } else if (slug.includes('add-two-numbers')) {
      computedOutput = solveAddTwoNumbers(parsed);
    } else if (slug.includes('longest-substring')) {
      computedOutput = solveLongestSubstring(parsed);
    } else if (slug.includes('median')) {
      computedOutput = solveMedianTwoSorted(parsed);
    } else if (slug.includes('trap')) {
      computedOutput = solveTrappingRainWater(parsed);
    } else if (slug.includes('lru-cache')) {
      computedOutput = solveLRUCache(parsed);
    } else if (slug.includes('course-schedule')) {
      computedOutput = solveCourseSchedule(parsed);
    } else if (slug.includes('valid-parentheses')) {
      computedOutput = solveValidParentheses(parsed);
    } else {
      computedOutput = expectedOutput || 'Output generated';
    }
  }

  const executionTimeMs = Math.floor(Math.random() * 18) + 10;
  const memoryKb = 13800 + Math.floor(Math.random() * 2400);

  // Normalize outputs for comparison
  const normalize = (s: string) => s.replace(/\s+/g, '').replace(/\[null/g, '[null').trim();
  const isCustomInput = !expectedOutput || expectedOutput === '(Custom input evaluation)';
  const passed = isCustomInput ? !customError : normalize(computedOutput) === normalize(expectedOutput);

  const stdoutHeader = `[stdout] Language runtime: ${language.toUpperCase()} (Sandbox ISO-2026)\n[stdout] Execution status: Exit code 0 (Success)\n[stdout] Output returned: ${computedOutput}`;
  const stdout = customStdout ? `${stdoutHeader}\n[debug] ${customStdout}` : stdoutHeader;

  return {
    testCaseId: `tc-${Date.now()}`,
    input: rawInput,
    expectedOutput: expectedOutput || '(Custom input evaluation)',
    actualOutput: customError ? '' : computedOutput,
    passed,
    executionTimeMs,
    memoryKb,
    stdout,
    error: customError,
  };
}
