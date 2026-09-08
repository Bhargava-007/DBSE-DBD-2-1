import type { Problem } from '../types/judge';

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    acceptanceRate: 51.4,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    tags: ['Array', 'Hash Table'],
    submissionsCount: 489210,
    totalAccepted: 251454,
    author: 'AlgoFlow Editorial',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    sampleTestCases: [
      {
        id: 'tc-1-1',
        input: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        id: 'tc-1-2',
        input: 'nums = [3, 2, 4], target = 6',
        expectedOutput: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        id: 'tc-1-3',
        input: 'nums = [3, 3], target = 6',
        expectedOutput: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    hiddenTestCasesCount: 57,
    starterCode: {
      cpp: `#include <vector>
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
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`
    }
  },
  {
    id: 'prob-2',
    title: 'Add Two Numbers',
    slug: 'add-two-numbers',
    difficulty: 'Medium',
    acceptanceRate: 42.1,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tags: ['Linked List', 'Math', 'Recursion'],
    submissionsCount: 312000,
    totalAccepted: 131352,
    author: 'AlgoFlow Editorial',
    description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    constraints: [
      'The number of nodes in each linked list is in the range [1, 100].',
      '0 <= Node.val <= 9',
      'It is guaranteed that the list represents a number that does not have leading zeros.'
    ],
    sampleTestCases: [
      {
        id: 'tc-2-1',
        input: 'l1 = [2, 4, 3], l2 = [5, 6, 4]',
        expectedOutput: '[7, 0, 8]',
        explanation: '342 + 465 = 807.'
      },
      {
        id: 'tc-2-2',
        input: 'l1 = [0], l2 = [0]',
        expectedOutput: '[0]',
        explanation: '0 + 0 = 0.'
      }
    ],
    hiddenTestCasesCount: 40,
    starterCode: {
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        int carry = 0;
        while (l1 || l2 || carry) {
            int sum = carry + (l1 ? l1->val : 0) + (l2 ? l2->val : 0);
            carry = sum / 10;
            tail->next = new ListNode(sum % 10);
            tail = tail->next;
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }
        return dummy.next;
    }
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0)
        curr = dummy
        carry = 0
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            val = v1 + v2 + carry
            carry = val // 10
            curr.next = ListNode(val % 10)
            curr = curr.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next`,
      java: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode p = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int x = (l1 != null) ? l1.val : 0;
            int y = (l2 != null) ? l2.val : 0;
            int sum = carry + x + y;
            carry = sum / 10;
            p.next = new ListNode(sum % 10);
            p = p.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        return dummy.next;
    }
}`,
      javascript: `/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    let dummy = new ListNode(0);
    let curr = dummy;
    let carry = 0;
    while (l1 || l2 || carry) {
        let sum = (l1?.val || 0) + (l2?.val || 0) + carry;
        carry = Math.floor(sum / 10);
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        l1 = l1?.next || null;
        l2 = l2?.next || null;
    }
    return dummy.next;
};`
    }
  },
  {
    id: 'prob-3',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    acceptanceRate: 34.7,
    timeLimitMs: 1000,
    memoryLimitMb: 128,
    tags: ['Hash Table', 'String', 'Sliding Window'],
    submissionsCount: 298400,
    totalAccepted: 103544,
    author: 'Community Setter',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

A **substring** is a contiguous non-empty sequence of characters within a string.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    sampleTestCases: [
      {
        id: 'tc-3-1',
        input: 's = "abcabcbb"',
        expectedOutput: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        id: 'tc-3-2',
        input: 's = "bbbbb"',
        expectedOutput: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        id: 'tc-3-3',
        input: 's = "pwwkew"',
        expectedOutput: '3',
        explanation: 'The answer is "wke", with the length of 3.'
      }
    ],
    hiddenTestCasesCount: 62,
    starterCode: {
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>

class Solution {
public:
    int lengthOfLongestSubstring(std::string s) {
        std::unordered_map<char, int> lastSeen;
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); ++right) {
            if (lastSeen.find(s[right]) != lastSeen.end()) {
                left = std::max(left, lastSeen[s[right]] + 1);
            }
            lastSeen[s[right]] = right;
            maxLen = std::max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      javascript: `var lengthOfLongestSubstring = function(s) {
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
};`
    }
  },
  {
    id: 'prob-4',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'Hard',
    acceptanceRate: 38.6,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    submissionsCount: 184500,
    totalAccepted: 71217,
    author: 'AlgoFlow Editorial',
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6'
    ],
    sampleTestCases: [
      {
        id: 'tc-4-1',
        input: 'nums1 = [1, 3], nums2 = [2]',
        expectedOutput: '2.00000',
        explanation: 'merged array = [1, 2, 3] and median is 2.'
      },
      {
        id: 'tc-4-2',
        input: 'nums1 = [1, 2], nums2 = [3, 4]',
        expectedOutput: '2.50000',
        explanation: 'merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.'
      }
    ],
    hiddenTestCasesCount: 88,
    starterCode: {
      cpp: `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        // Implement O(log(min(m, n))) binary search partitioning
    }
};`,
      python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        # Binary search on smaller array
        pass`,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Implementation
        return 0.0;
    }
}`,
      javascript: `var findMedianSortedArrays = function(nums1, nums2) {
    // Implementation
};`
    }
  },
  {
    id: 'prob-5',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    acceptanceRate: 61.2,
    timeLimitMs: 1200,
    memoryLimitMb: 128,
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    submissionsCount: 245000,
    totalAccepted: 149940,
    author: 'AlgoFlow Editorial',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    sampleTestCases: [
      {
        id: 'tc-5-1',
        input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]',
        expectedOutput: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        id: 'tc-5-2',
        input: 'height = [4, 2, 0, 3, 2, 5]',
        expectedOutput: '9',
        explanation: '9 units of rain water are trapped between elevation bars.'
      }
    ],
    hiddenTestCasesCount: 112,
    starterCode: {
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
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
        return water;
    }
};`,
      python: `class Solution:
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
      java: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int lMax = 0, rMax = 0, total = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else total += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else total += rMax - height[r];
                r--;
            }
        }
        return total;
    }
}`,
      javascript: `var trap = function(height) {
    let l = 0, r = height.length - 1;
    let lMax = 0, rMax = 0, total = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            height[l] >= lMax ? (lMax = height[l]) : (total += lMax - height[l]);
            l++;
        } else {
            height[r] >= rMax ? (rMax = height[r]) : (total += rMax - height[r]);
            r--;
        }
    }
    return total;
};`
    }
  },
  {
    id: 'prob-6',
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'Medium',
    acceptanceRate: 42.8,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    submissionsCount: 198000,
    totalAccepted: 84744,
    author: 'AlgoFlow Editorial',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with **positive** size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.`,
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    sampleTestCases: [
      {
        id: 'tc-6-1',
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        expectedOutput: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRUCache lRUCache = new LRUCache(2); lRUCache.put(1, 1); lRUCache.put(2, 2); lRUCache.get(1); // returns 1'
      }
    ],
    hiddenTestCasesCount: 45,
    starterCode: {
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        
    }
    
    int get(int key) {
        return -1;
    }
    
    void put(int key, int value) {
        
    }
};`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass`,
      java: `class LRUCache {
    public LRUCache(int capacity) {
        
    }
    
    public int get(int key) {
        return -1;
    }
    
    public void put(int key, int value) {
        
    }
}`,
      javascript: `var LRUCache = function(capacity) {
    
};
LRUCache.prototype.get = function(key) {
    return -1;
};
LRUCache.prototype.put = function(key, value) {
    
};`
    }
  },
  {
    id: 'prob-7',
    title: 'Course Schedule',
    slug: 'course-schedule',
    difficulty: 'Medium',
    acceptanceRate: 46.9,
    timeLimitMs: 1200,
    memoryLimitMb: 128,
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    submissionsCount: 165000,
    totalAccepted: 77385,
    author: 'Community Setter',
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you **must** take course \`b_i\` first if you want to take course \`a_i\`.

For example, the pair \`[0, 1]\`, indicates that to take course \`0\` you have to first take \`1\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2',
      '0 <= a_i, b_i < numCourses',
      'All the pairs prerequisites[i] are unique.'
    ],
    sampleTestCases: [
      {
        id: 'tc-7-1',
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        expectedOutput: 'true',
        explanation: 'There are a total of 2 courses. To take course 1 you should have finished course 0. So it is possible.'
      },
      {
        id: 'tc-7-2',
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        expectedOutput: 'false',
        explanation: 'There is a cyclic dependency between courses 0 and 1.'
      }
    ],
    hiddenTestCasesCount: 52,
    starterCode: {
      cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        // Kahn's algorithm or DFS cycle detection
    }
};`,
      python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        # Kahn's algorithm or DFS
        pass`,
      java: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        return false;
    }
}`,
      javascript: `var canFinish = function(numCourses, prerequisites) {
    return false;
};`
    }
  },
  {
    id: 'prob-8',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    acceptanceRate: 40.5,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    tags: ['String', 'Stack'],
    submissionsCount: 512000,
    totalAccepted: 207360,
    author: 'Tarun',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    sampleTestCases: [
      {
        id: 'tc-8-1',
        input: 's = "()"',
        expectedOutput: 'true'
      },
      {
        id: 'tc-8-2',
        input: 's = "()[]{}"',
        expectedOutput: 'true'
      },
      {
        id: 'tc-8-3',
        input: 's = "(]"',
        expectedOutput: 'false'
      }
    ],
    hiddenTestCasesCount: 94,
    starterCode: {
      cpp: `class Solution {
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
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      javascript: `var isValid = function(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
};`
    }
  }
];
