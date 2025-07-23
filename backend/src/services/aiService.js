const Groq = require('groq-sdk');

// Initialize Groq client with error handling
let groq = null;
try {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  } else {
    console.log('⚠️ GROQ_API_KEY not configured - using intelligent fallback responses');
  }
} catch (error) {
  console.error('❌ Failed to initialize Groq client:', error.message);
}

// DSA-focused system prompt
const DSA_SYSTEM_PROMPT = `You are a Data Structures and Algorithms (DSA) instructor chatbot. Your role is to:

1. Help students understand DSA concepts clearly and thoroughly
2. Provide step-by-step explanations for algorithms and data structures
3. Offer coding examples in multiple programming languages (primarily JavaScript, Python, Java, C++)
4. Explain time and space complexity analysis
5. Guide students through problem-solving approaches
6. Provide practice problems and solutions
7. Help with debugging and optimization

Guidelines:
- Always explain concepts in a clear, educational manner
- Use examples and analogies when helpful
- Break down complex problems into smaller steps
- Encourage good coding practices
- Focus on understanding rather than just memorization
- Be patient and supportive
- Ask clarifying questions when needed

Keep responses focused on DSA topics. If asked about non-DSA topics, politely redirect to data structures and algorithms.`;

class AIService {
  constructor() {
    this.model = 'llama3-8b-8192';
    this.maxTokens = 1000;
    this.temperature = 0.7;
  }

  /**
   * Generate AI response for a user message
   * @param {string} userMessage - The user's message
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @param {Object} context - Additional context (difficulty level, language preference, etc.)
   * @returns {Object} AI response with content, tokens used, and detected concepts
   */
  async generateResponse(userMessage, conversationHistory = [], context = {}) {
    try {
      // If GROQ is not available, use intelligent fallback immediately
      if (!groq) {
        console.log('🤖 Using intelligent fallback (no GROQ API key)');
        return this.getFallbackResponse(userMessage);
      }

      // Prepare conversation messages
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        }
      ];

      // Add conversation history (limit to last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const aiResponse = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      // Analyze the response for DSA concepts
      const detectedConcepts = this.extractDSAConcepts(userMessage, aiResponse);

      return {
        content: aiResponse,
        tokensUsed: tokensUsed,
        isDSAConcept: detectedConcepts.length > 0,
        conceptTags: detectedConcepts,
        model: this.model
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Return fallback response
      return this.getFallbackResponse(userMessage);
    }
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context) {
    let prompt = DSA_SYSTEM_PROMPT;

    if (context.difficulty) {
      prompt += `\n\nUser's current level: ${context.difficulty}. Adjust explanations accordingly.`;
    }

    if (context.language) {
      prompt += `\n\nUser prefers ${context.language} for code examples.`;
    }

    return prompt;
  }

  /**
   * Extract DSA concepts from user message and AI response
   */
  extractDSAConcepts(userMessage, aiResponse) {
    const dsaKeywords = {
      // Data Structures
      'array': ['arrays', 'array-manipulation'],
      'linked list': ['linked-lists', 'data-structures'],
      'stack': ['stacks', 'data-structures'],
      'queue': ['queues', 'data-structures'],
      'tree': ['trees', 'binary-trees'],
      'binary tree': ['binary-trees', 'trees'],
      'bst': ['binary-search-trees', 'trees'],
      'binary search tree': ['binary-search-trees', 'trees'],
      'heap': ['heaps', 'trees'],
      'graph': ['graphs', 'graph-algorithms'],
      'hash': ['hashing', 'hash-tables'],
      'hash table': ['hash-tables', 'hashing'],
      'hash map': ['hash-maps', 'hashing'],
      
      // Algorithms
      'sort': ['sorting', 'algorithms'],
      'search': ['searching', 'algorithms'],
      'binary search': ['binary-search', 'searching'],
      'dfs': ['depth-first-search', 'graph-algorithms'],
      'bfs': ['breadth-first-search', 'graph-algorithms'],
      'dynamic programming': ['dynamic-programming', 'algorithms'],
      'dp': ['dynamic-programming', 'algorithms'],
      'recursion': ['recursion', 'algorithms'],
      'backtracking': ['backtracking', 'algorithms'],
      'greedy': ['greedy-algorithms', 'algorithms'],
      'divide and conquer': ['divide-and-conquer', 'algorithms'],
      
      // Complexity
      'time complexity': ['time-complexity', 'analysis'],
      'space complexity': ['space-complexity', 'analysis'],
      'big o': ['big-o-notation', 'complexity-analysis'],
      'o(n)': ['time-complexity', 'analysis'],
      'o(log n)': ['time-complexity', 'analysis'],
      'o(n^2)': ['time-complexity', 'analysis']
    };

    const concepts = new Set();
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();

    // Check for keyword matches
    for (const [keyword, tags] of Object.entries(dsaKeywords)) {
      if (combinedText.includes(keyword)) {
        tags.forEach(tag => concepts.add(tag));
      }
    }

    return Array.from(concepts);
  }

  /**
   * Fallback response when AI service fails
   */
  getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Provide intelligent fallback responses based on keywords
    if (lowerMessage.includes('binary search tree') || lowerMessage.includes('bst')) {
      return {
        content: `**Binary Search Tree (BST) - Comprehensive Guide**

A Binary Search Tree is a hierarchical data structure where each node has at most two children, arranged so that:

**🔑 Key Properties:**
• **Left child** < **Parent** < **Right child**
• All values in left subtree < parent value
• All values in right subtree > parent value
• No duplicate values (in standard BST)

**⚡ Time Complexities:**
• **Search**: O(log n) average, O(n) worst case
• **Insert**: O(log n) average, O(n) worst case
• **Delete**: O(log n) average, O(n) worst case

**💻 Basic Implementation (JavaScript):**
\`\`\`javascript
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(val) {
        this.root = this.insertNode(this.root, val);
    }

    insertNode(node, val) {
        if (!node) return new TreeNode(val);

        if (val < node.val) {
            node.left = this.insertNode(node.left, val);
        } else if (val > node.val) {
            node.right = this.insertNode(node.right, val);
        }
        return node;
    }

    search(val) {
        return this.searchNode(this.root, val);
    }

    searchNode(node, val) {
        if (!node || node.val === val) return node;

        if (val < node.val) {
            return this.searchNode(node.left, val);
        }
        return this.searchNode(node.right, val);
    }
}
\`\`\`

**🌟 Common Applications:**
• Database indexing
• Expression parsing
• File systems
• Priority queues

Would you like me to explain BST traversals or balancing techniques?`,
        tokensUsed: 150,
        isDSAConcept: true,
        conceptTags: ['binary-search-tree', 'trees', 'data-structures'],
        model: 'fallback-dsa-instructor'
      };
    }

    if (lowerMessage.includes('time complexity') || lowerMessage.includes('complexity')) {
      return {
        content: `**Time Complexity - Complete Guide**

Time complexity measures how an algorithm's runtime grows with input size.

**📊 Common Time Complexities (Best to Worst):**

**O(1) - Constant Time:**
• Array access: \`arr[index]\`
• Hash table lookup
• Stack push/pop

**O(log n) - Logarithmic Time:**
• Binary search in sorted array
• Balanced tree operations
• Heap insert/delete

**O(n) - Linear Time:**
• Array traversal
• Linear search
• Finding min/max in unsorted array

**O(n log n) - Linearithmic Time:**
• Merge sort
• Heap sort
• Efficient sorting algorithms

**O(n²) - Quadratic Time:**
• Bubble sort
• Selection sort
• Nested loops over same data

**O(2^n) - Exponential Time:**
• Recursive Fibonacci (naive)
• Subset generation
• Traveling salesman (brute force)

**🎯 Analysis Tips:**
1. **Focus on dominant term**: O(n² + n) → O(n²)
2. **Ignore constants**: O(3n) → O(n)
3. **Consider worst case** unless specified otherwise
4. **Count basic operations** in loops and recursion

**💡 Example Analysis:**
\`\`\`javascript
// O(n²) - nested loops
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        // O(1) operation
    }
}

// O(n log n) - divide and conquer
function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));    // T(n/2)
    const right = mergeSort(arr.slice(mid));      // T(n/2)

    return merge(left, right);                    // O(n)
}
\`\`\`

What specific algorithm would you like me to analyze?`,
        tokensUsed: 180,
        isDSAConcept: true,
        conceptTags: ['time-complexity', 'algorithm-analysis', 'big-o'],
        model: 'fallback-dsa-instructor'
      };
    }

    if (lowerMessage.includes('merge sort') || lowerMessage.includes('mergesort')) {
      return {
        content: `**Merge Sort - Divide & Conquer Algorithm**

Merge Sort is one of the most efficient and stable sorting algorithms.

**🎯 How It Works:**
1. **Divide**: Split array into two halves
2. **Conquer**: Recursively sort both halves
3. **Combine**: Merge sorted halves back together

**⚡ Time & Space Complexity:**
• **Time**: O(n log n) in all cases (best, average, worst)
• **Space**: O(n) for temporary arrays
• **Stable**: Maintains relative order of equal elements

**💻 Implementation (JavaScript):**
\`\`\`javascript
function mergeSort(arr) {
    // Base case
    if (arr.length <= 1) return arr;

    // Divide
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    // Conquer (merge)
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;

    // Compare and merge
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    // Add remaining elements
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// Example usage
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("Original:", arr);
console.log("Sorted:", mergeSort(arr));
\`\`\`

**🌟 Advantages:**
• Guaranteed O(n log n) performance
• Stable sorting algorithm
• Works well with large datasets
• Predictable performance

**⚠️ Disadvantages:**
• Requires O(n) extra space
• Not in-place sorting
• Slower than quicksort for small arrays

**🔄 Step-by-Step Example:**
\`\`\`
[38, 27, 43, 3, 9, 82, 10]
       ↓ Divide
[38, 27, 43]    [3, 9, 82, 10]
       ↓ Divide further
[38] [27, 43]   [3, 9] [82, 10]
       ↓ Merge back
[27, 38, 43]    [3, 9, 10, 82]
       ↓ Final merge
[3, 9, 10, 27, 38, 43, 82]
\`\`\`

Would you like to see other sorting algorithms or learn about merge sort optimizations?`,
        tokensUsed: 200,
        isDSAConcept: true,
        conceptTags: ['merge-sort', 'sorting', 'divide-conquer', 'algorithms'],
        model: 'fallback-dsa-instructor'
      };
    }

    if (lowerMessage.includes('array') && lowerMessage.includes('linked list')) {
      return {
        content: `**Arrays vs Linked Lists - Comprehensive Comparison**

Understanding the differences helps choose the right data structure for your needs.

**📊 Arrays**

**Structure:**
• Elements stored in contiguous memory locations
• Fixed size (in most languages)
• Direct access via index

**⚡ Time Complexities:**
• **Access**: O(1) - Direct indexing
• **Search**: O(n) - Linear search, O(log n) if sorted
• **Insert**: O(n) - Need to shift elements
• **Delete**: O(n) - Need to shift elements

**💻 Array Example:**
\`\`\`javascript
let arr = [10, 20, 30, 40, 50];

// O(1) access
console.log(arr[2]); // 30

// O(n) insertion at beginning
arr.unshift(5); // [5, 10, 20, 30, 40, 50]

// O(1) insertion at end
arr.push(60); // [5, 10, 20, 30, 40, 50, 60]
\`\`\`

**🔗 Linked Lists**

**Structure:**
• Elements (nodes) scattered in memory
• Each node contains data + pointer to next node
• Dynamic size

**⚡ Time Complexities:**
• **Access**: O(n) - Must traverse from head
• **Search**: O(n) - Linear traversal
• **Insert**: O(1) - If you have the position
• **Delete**: O(1) - If you have the position

**💻 Linked List Example:**
\`\`\`javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    // O(1) insertion at beginning
    prepend(val) {
        const newNode = new ListNode(val);
        newNode.next = this.head;
        this.head = newNode;
    }

    // O(n) insertion at end
    append(val) {
        const newNode = new ListNode(val);
        if (!this.head) {
            this.head = newNode;
            return;
        }

        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
    }
}
\`\`\`

**⚖️ When to Use What:**

**Use Arrays When:**
• You need random access to elements
• Memory usage is a concern
• You do more reading than inserting/deleting
• Working with mathematical operations

**Use Linked Lists When:**
• Frequent insertions/deletions at beginning
• Size varies significantly
• You don't need random access
• Implementing other data structures (stacks, queues)

**📈 Memory Comparison:**
• **Array**: Contiguous memory, better cache performance
• **Linked List**: Scattered memory, extra space for pointers

**🎯 Real-World Examples:**
• **Arrays**: Image pixels, mathematical matrices, lookup tables
• **Linked Lists**: Browser history, music playlists, undo functionality

Would you like to explore specific operations or see implementations of other data structures?`,
        tokensUsed: 250,
        isDSAConcept: true,
        conceptTags: ['arrays', 'linked-lists', 'data-structures', 'comparison'],
        model: 'fallback-dsa-instructor'
      };
    }

    // Check for more DSA topics
    if (lowerMessage.includes('sieve') || lowerMessage.includes('eratosthenes')) {
      return {
        content: `**Sieve of Eratosthenes - Prime Number Algorithm**

The Sieve of Eratosthenes is an ancient, efficient algorithm for finding all prime numbers up to a given limit.

**🎯 How It Works:**
1. **Create a list** of consecutive integers from 2 through n
2. **Mark multiples** of each prime starting from 2
3. **Remaining unmarked** numbers are prime

**⚡ Time & Space Complexity:**
• **Time**: O(n log log n) - Very efficient for finding many primes
• **Space**: O(n) - Array to track prime status
• **Optimal**: Best algorithm for finding all primes up to n

**💻 Implementation (JavaScript):**
\`\`\`javascript
function sieveOfEratosthenes(n) {
    // Create array of true values
    const isPrime = new Array(n + 1).fill(true);
    isPrime[0] = isPrime[1] = false; // 0 and 1 are not prime

    for (let i = 2; i * i <= n; i++) {
        if (isPrime[i]) {
            // Mark multiples of i as not prime
            for (let j = i * i; j <= n; j += i) {
                isPrime[j] = false;
            }
        }
    }

    // Collect all prime numbers
    const primes = [];
    for (let i = 2; i <= n; i++) {
        if (isPrime[i]) {
            primes.push(i);
        }
    }

    return primes;
}

// Example usage
console.log(sieveOfEratosthenes(30));
// Output: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
\`\`\`

**🔄 Step-by-Step Example (n = 30):**
\`\`\`
Initial: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

After 2: [2, 3, ✗, 5, ✗, 7, ✗, 9, ✗, 11, ✗, 13, ✗, 15, ✗, 17, ✗, 19, ✗, 21, ✗, 23, ✗, 25, ✗, 27, ✗, 29, ✗]

After 3: [2, 3, ✗, 5, ✗, 7, ✗, ✗, ✗, 11, ✗, 13, ✗, ✗, ✗, 17, ✗, 19, ✗, ✗, ✗, 23, ✗, 25, ✗, ✗, ✗, 29, ✗]

After 5: [2, 3, ✗, 5, ✗, 7, ✗, ✗, ✗, 11, ✗, 13, ✗, ✗, ✗, 17, ✗, 19, ✗, ✗, ✗, 23, ✗, ✗, ✗, ✗, ✗, 29, ✗]

Final Primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
\`\`\`

**🌟 Key Optimizations:**
• **Start from i²**: Multiples below i² already marked
• **Skip even numbers**: Only check odd numbers after 2
• **Early termination**: Stop at √n

**🎯 Applications:**
• Cryptography (RSA key generation)
• Number theory research
• Prime factorization
• Mathematical competitions

**⚖️ Comparison with Other Methods:**
• **Trial Division**: O(n√n) - Much slower
• **Sieve of Sundaram**: O(n log n) - Similar but more complex
• **Segmented Sieve**: Better for very large ranges

Would you like to see optimized versions or other prime-finding algorithms?`,
        tokensUsed: 200,
        isDSAConcept: true,
        conceptTags: ['sieve-of-eratosthenes', 'prime-numbers', 'algorithms', 'number-theory'],
        model: 'fallback-dsa-instructor'
      };
    }

    if (lowerMessage.includes('dynamic programming') || lowerMessage.includes('dp')) {
      return {
        content: `**Dynamic Programming - Optimization Technique**

Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems.

**🎯 Core Principles:**
1. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems**: Same subproblems solved multiple times
3. **Memoization**: Store results to avoid recomputation

**⚡ Time & Space Complexity:**
• **Time**: Usually O(n²) or O(n³) instead of exponential
• **Space**: O(n) to O(n²) for memoization table
• **Trade-off**: Space for time efficiency

**💻 Classic Example - Fibonacci:**
\`\`\`javascript
// Naive Recursive: O(2^n) time
function fibNaive(n) {
    if (n <= 1) return n;
    return fibNaive(n-1) + fibNaive(n-2);
}

// DP Memoization: O(n) time, O(n) space
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;

    memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
    return memo[n];
}

// DP Tabulation: O(n) time, O(n) space
function fibTab(n) {
    if (n <= 1) return n;

    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}

// Space Optimized: O(n) time, O(1) space
function fibOptimal(n) {
    if (n <= 1) return n;

    let prev2 = 0, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    return prev1;
}
\`\`\`

**🏆 Common DP Problems:**

**1. Coin Change:**
\`\`\`javascript
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\`

**2. Longest Common Subsequence:**
\`\`\`javascript
function lcs(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i-1] === text2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }

    return dp[m][n];
}
\`\`\`

**🎯 DP Patterns:**
• **Linear DP**: 1D problems (Fibonacci, Climbing Stairs)
• **Grid DP**: 2D problems (Unique Paths, Edit Distance)
• **Interval DP**: Range problems (Matrix Chain Multiplication)
• **Tree DP**: Tree-based problems (House Robber III)

**🔍 How to Identify DP Problems:**
1. **Optimization**: Find minimum/maximum value
2. **Counting**: Count number of ways
3. **Decision Making**: Yes/No feasibility
4. **Overlapping subproblems** present

Would you like to explore specific DP patterns or see more examples?`,
        tokensUsed: 250,
        isDSAConcept: true,
        conceptTags: ['dynamic-programming', 'optimization', 'memoization', 'algorithms'],
        model: 'fallback-dsa-instructor'
      };
    }

    // Enhanced generic fallback for any DSA question
    const dsaKeywords = ['algorithm', 'data structure', 'complexity', 'sort', 'search', 'tree', 'graph', 'array', 'list', 'stack', 'queue', 'hash', 'heap'];
    const containsDSAKeyword = dsaKeywords.some(keyword => lowerMessage.includes(keyword));

    if (containsDSAKeyword || lowerMessage.includes('detail') || lowerMessage.includes('explain')) {
      return {
        content: `**DSA Learning Assistant - Intelligent Mode**

I'm currently running in intelligent offline mode, providing comprehensive DSA education without requiring an internet connection.

**🎯 What I Can Help You With:**

**📚 Core Topics Available:**
• **Data Structures**: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Tables
• **Algorithms**: Sorting, Searching, Dynamic Programming, Greedy, Divide & Conquer
• **Analysis**: Time/Space Complexity, Big O Notation, Algorithm Optimization
• **Advanced Topics**: Graph Algorithms, Tree Traversals, String Algorithms

**💡 Try These Specific Questions:**
• "What is a binary search tree?"
• "Explain time complexity"
• "How does merge sort work?"
• "What's the difference between arrays and linked lists?"
• "What is dynamic programming?"
• "Explain the sieve of Eratosthenes"

**🚀 Features:**
✅ **Detailed Explanations** with step-by-step breakdowns
✅ **Code Examples** in JavaScript with comments
✅ **Time/Space Analysis** for all algorithms
✅ **Real-world Applications** and use cases
✅ **Visual Examples** and comparisons

**🎓 Learning Approach:**
I provide university-level explanations with:
- Clear conceptual understanding
- Practical implementation details
- Performance analysis
- Common pitfalls and optimizations

**Ask me about any DSA topic and I'll provide a comprehensive explanation!**

*Note: For unlimited topic coverage and dynamic conversations, you can optionally add a free GROQ API key to upgrade to full AI mode.*`,
        tokensUsed: 120,
        isDSAConcept: true,
        conceptTags: ['general-dsa', 'learning-guide'],
        model: 'fallback-dsa-instructor'
      };
    }

    // Final fallback for non-DSA questions
    const fallbackResponses = [
      "I'm a DSA (Data Structures & Algorithms) learning assistant. Could you ask me about algorithms, data structures, or programming concepts?",
      "I specialize in DSA education. What data structure or algorithm would you like to learn about?",
      "I'm here to help with Data Structures and Algorithms. Try asking about sorting, searching, trees, graphs, or complexity analysis!"
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      content: randomResponse,
      tokensUsed: 0,
      isDSAConcept: false,
      conceptTags: [],
      model: 'fallback',
      isError: true
    };
  }

  /**
   * Check if Groq API is properly configured
   */
  async testConnection() {
    try {
      const response = await groq.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      return { success: true, message: 'AI service connected successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new AIService();
