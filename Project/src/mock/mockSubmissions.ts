import type { Submission } from '../types/judge';

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_892101',
    userId: 'usr_892144',
    username: 'alex_dev',
    problemId: 'prob-1',
    problemTitle: 'Two Sum',
    problemDifficulty: 'Easy',
    language: 'cpp',
    code: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`,
    verdict: 'Accepted',
    executionTimeMs: 4,
    memoryKb: 14120,
    submittedAt: '2026-09-08T18:32:10Z',
    testCasesPassed: 60,
    totalTestCases: 60,
  },
  {
    id: 'sub_892095',
    userId: 'usr_892144',
    username: 'alex_dev',
    problemId: 'prob-5',
    problemTitle: 'Trapping Rain Water',
    problemDifficulty: 'Hard',
    language: 'python',
    code: `class Solution:
    def trap(self, height: list[int]) -> int:
        l, r = 0, len(height) - 1
        l_max, r_max = 0, 0
        ans = 0
        while l < r:
            if height[l] < height[r]:
                if height[l] >= l_max:
                    l_max = height[l]
                else:
                    ans += l_max - height[l]
                l += 1
            else:
                if height[r] >= r_max:
                    r_max = height[r]
                else:
                    ans += r_max - height[r]
                r -= 1
        return ans`,
    verdict: 'Accepted',
    executionTimeMs: 52,
    memoryKb: 18940,
    submittedAt: '2026-09-08T17:14:02Z',
    testCasesPassed: 114,
    totalTestCases: 114,
  },
  {
    id: 'sub_891950',
    userId: 'usr_892144',
    username: 'alex_dev',
    problemId: 'prob-5',
    problemTitle: 'Trapping Rain Water',
    problemDifficulty: 'Hard',
    language: 'python',
    code: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Brute force O(N^2) leading to TLE
        ans = 0
        n = len(height)
        for i in range(n):
            l_max = max(height[:i+1])
            r_max = max(height[i:])
            ans += min(l_max, r_max) - height[i]
        return ans`,
    verdict: 'Time Limit Exceeded',
    executionTimeMs: 1205,
    memoryKb: 16400,
    submittedAt: '2026-09-08T16:55:40Z',
    testCasesPassed: 78,
    totalTestCases: 114,
    errorMessage: 'Execution exceeded 1200ms time threshold on hidden test case #79.'
  },
  {
    id: 'sub_891820',
    userId: 'usr_892144',
    username: 'alex_dev',
    problemId: 'prob-3',
    problemTitle: 'Longest Substring Without Repeating Characters',
    problemDifficulty: 'Medium',
    language: 'javascript',
    code: `var lengthOfLongestSubstring = function(s) {
    let map = new Map();
    let left = 0, maxLen = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right])) {
            left = Math.max(left, map.get(s[right]) + 1);
        }
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
};`,
    verdict: 'Accepted',
    executionTimeMs: 68,
    memoryKb: 46200,
    submittedAt: '2026-09-07T20:10:15Z',
    testCasesPassed: 65,
    totalTestCases: 65,
  },
  {
    id: 'sub_891700',
    userId: 'usr_892144',
    username: 'alex_dev',
    problemId: 'prob-8',
    problemTitle: 'Valid Parentheses',
    problemDifficulty: 'Easy',
    language: 'cpp',
    code: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
    verdict: 'Accepted',
    executionTimeMs: 0,
    memoryKb: 8300,
    submittedAt: '2026-09-06T14:22:30Z',
    testCasesPassed: 97,
    totalTestCases: 97,
  },
  {
    id: 'sub_891500',
    userId: 'usr_892146',
    username: 'marcus_v',
    problemId: 'prob-6',
    problemTitle: 'LRU Cache',
    problemDifficulty: 'Medium',
    language: 'java',
    code: `// Submissions for LRU Cache`,
    verdict: 'Wrong Answer',
    executionTimeMs: 82,
    memoryKb: 68400,
    submittedAt: '2026-09-06T11:45:00Z',
    testCasesPassed: 31,
    totalTestCases: 46,
    errorMessage: 'Expected output: [null, -1, 4] but got [null, 2, 4]'
  },
  {
    id: 'sub_891400',
    userId: 'usr_892145',
    username: 'sarah_k',
    problemId: 'prob-7',
    problemTitle: 'Course Schedule',
    problemDifficulty: 'Medium',
    language: 'python',
    code: `# Course schedule DFS`,
    verdict: 'Runtime Error',
    executionTimeMs: 14,
    memoryKb: 17200,
    submittedAt: '2026-09-05T09:12:00Z',
    testCasesPassed: 12,
    totalTestCases: 54,
    errorMessage: 'RecursionError: maximum recursion depth exceeded while calling a Python object (cycle detected)'
  }
];
