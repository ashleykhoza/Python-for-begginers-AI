import { TopicItem, DebugChallenge, PredictChallenge, StagedProject } from "../types/mentor";

export const CORE_TOPICS: TopicItem[] = [
  {
    id: "vars-types",
    track: "core",
    title: "1. Variables & Data Types",
    level: "Beginner",
    analogy: "Think of variables as labeled boxes in a storage room. You can place numbers, text, or flags inside, and swap the contents anytime.",
    explanation: "In Python, variables don't require explicit type declarations. Python infers types at runtime: `int` for whole numbers, `float` for decimals, `str` for text, and `bool` for True/False.",
    starterCode: `# 1. Create a variable 'learner_name' with your name (str)
# 2. Create 'hours_coded' with a number (e.g. 5)
# 3. Print a formatted message: "<name> has coded for <hours> hours."

learner_name = "Alex"
hours_coded = 4
`,
    goal: "Assign variables and print a formatted string combining text and numeric values.",
    validationRule: (code: string, stdout: string) => {
      const hasPrint = code.includes("print");
      const hasVariables = code.includes("learner_name") && code.includes("hours_coded");
      const hasOutput = stdout.trim().length > 0 && stdout.toLowerCase().includes("hour");
      return hasPrint && hasVariables && hasOutput;
    },
    hints: [
      "Level 1: What Python built-in function sends text to the screen?",
      "Level 2: You can combine variables and text using f-strings, for example: f\"{name} is here\".",
      "Level 3: Use: print(f\"{learner_name} has coded for {hours_coded} hours.\")",
      "Level 4: If not using f-strings, print(learner_name, \"has coded for\", hours_coded, \"hours.\") works too.",
      "Level 5: Solution approach: define the two variables, then call print() passing the formatted sentence.",
    ],
    feynmanPrompt: "Explain how Python knows the type of `learner_name` without you writing `String learner_name` like in Java or C.",
  },
  {
    id: "conditionals-logic",
    track: "core",
    title: "2. Conditionals & Boolean Logic",
    level: "Beginner",
    analogy: "Conditionals are like traffic signals: Green means go, Red means stop, Yellow checks your speed. Code branches based on True or False.",
    explanation: "Use `if`, `elif`, and `else` blocks to control program execution. Remember the double equals `==` is used for equality checks, while `=` is for variable assignment.",
    starterCode: `# Check if an exam score qualifies for Honors (>= 90), Pass (>= 60), or Fail (< 60)
score = 85

# Write an if/elif/else structure that prints 'Honors', 'Pass', or 'Needs Improvement'
`,
    goal: "Write an if-elif-else block evaluating a numerical score and printing the grade category.",
    validationRule: (code: string, stdout: string) => {
      const hasIf = code.includes("if") && code.includes("score");
      const output = stdout.trim().toLowerCase();
      return hasIf && (output.includes("pass") || output.includes("honors") || output.includes("improvement"));
    },
    hints: [
      "Level 1: How does Python evaluate whether one number is greater than or equal to another?",
      "Level 2: The comparison operator is `>=`. Check the highest condition first (Honors), then elif for Pass.",
      "Level 3: Structure:\nif score >= 90:\n    print('Honors')\nelif score >= 60:\n    print('Pass')\nelse:\n    print('Needs Improvement')",
      "Level 4: Be careful with colon `:` at the end of each condition line, and 4-space indentation.",
      "Level 5: Complete solution: Write the score comparison in order so 95 won't just trigger the pass branch.",
    ],
    feynmanPrompt: "Why does the order of conditions matter in an if-elif chain? What would happen if `if score >= 60:` came before `score >= 90:`?",
  },
  {
    id: "loops-iteration",
    track: "core",
    title: "3. Loops & Sequences",
    level: "Beginner",
    analogy: "A loop is like an assembly line conveyor belt. Each item passes by, and your robot arm performs the exact same action on it.",
    explanation: "Python offers `for` loops to iterate through sequences (lists, strings, ranges) and `while` loops for running until a boolean condition turns False.",
    starterCode: `# Given a list of daily temperatures in Celsius:
temperatures = [20, 25, 30, 22, 18]

# Calculate and print the average temperature using a loop
total = 0
for temp in temperatures:
    total += temp

# Now calculate average and print it
`,
    goal: "Iterate through a list, sum the elements, compute the average, and print the result.",
    validationRule: (code: string, stdout: string) => {
      const hasLoop = code.includes("for") && code.includes("in");
      const hasLenOrDivision = code.includes("len(") || code.includes("/");
      const hasOutput = stdout.trim().length > 0;
      return hasLoop && hasLenOrDivision && hasOutput;
    },
    hints: [
      "Level 1: How many items are in the temperatures list, and how can you calculate an average from a total?",
      "Level 2: The average is `total / len(temperatures)`. What function prints the result?",
      "Level 3: After the loop finishes, compute: avg = total / len(temperatures), then print(avg).",
      "Level 4: Make sure your print statement is NOT indented inside the loop, otherwise it prints on every step!",
      "Level 5: Solution: Dedent your final print so it runs once after all items are summed.",
    ],
    feynmanPrompt: "Explain the difference between code placed INSIDE the loop indentation vs code placed OUTSIDE after the loop.",
  },
  {
    id: "functions-scope",
    track: "core",
    title: "4. Functions & Scope",
    level: "Intermediate",
    analogy: "A function is like a blender recipe: You put ingredients in (parameters), blend them according to instructions, and pour out the smoothie (return value).",
    explanation: "Define functions using `def function_name(params):`. Always prefer `return` over `print` for reusable code. Variables defined inside a function belong to its local scope.",
    starterCode: `# Define a function 'calculate_discount(price, discount_percent)'
# It should RETURN the final discounted price.
# Example: calculate_discount(100, 20) -> 80.0

def calculate_discount(price, discount_percent):
    # Your logic here
    pass

# Test your function:
result = calculate_discount(100, 15)
print("Final Price:", result)
`,
    goal: "Define a function that takes arguments, calculates a discount percentage, and returns the net price.",
    validationRule: (code: string, stdout: string) => {
      const hasDef = code.includes("def calculate_discount");
      const hasReturn = code.includes("return");
      const hasCorrectOutput = stdout.includes("85") || stdout.includes("85.0");
      return hasDef && hasReturn && hasCorrectOutput;
    },
    hints: [
      "Level 1: What is the mathematical formula for subtracting a percentage from an initial price?",
      "Level 2: Discount amount = price * (discount_percent / 100). Final price = price - discount amount.",
      "Level 3: Return the calculated value instead of just printing it inside the function.",
      "Level 4: def calculate_discount(price, discount_percent):\n    return price * (1 - discount_percent / 100)",
      "Level 5: Solution: Implement the return statement and verify calculate_discount(100, 15) outputs 85.",
    ],
    feynmanPrompt: "Why is returning a value from a function generally preferred over printing it directly inside the function?",
  },
  {
    id: "dicts-collections",
    track: "core",
    title: "5. Dictionaries & Key-Value Maps",
    level: "Intermediate",
    analogy: "A Python dictionary is like a real dictionary or phone book: You look up a word (key) to immediately find its definition (value) in O(1) constant time.",
    explanation: "Dictionaries store data as `{key: value}` pairs. Keys must be immutable (strings, numbers, tuples). Use `.get()` to avoid KeyErrors when a key might not exist.",
    starterCode: `# Inventory tracker for a bookstore:
inventory = {
    "python_crash_course": 12,
    "fluent_python": 5,
    "clean_code": 8
}

# 1. Update 'fluent_python' by adding 3 more copies.
# 2. Safely check if 'algorithms_guide' is in stock (if not, print 'Not stocked')
# 3. Print the total number of books in the inventory.
`,
    goal: "Mutate dictionary values, use safe lookup, and aggregate values using sum().",
    validationRule: (code: string, stdout: string) => {
      const usesDict = code.includes("inventory");
      const hasSumOrLoop = code.includes("sum(") || code.includes("for");
      const hasOutput = stdout.trim().length > 0;
      return usesDict && hasSumOrLoop && hasOutput;
    },
    hints: [
      "Level 1: How do you access and modify the value associated with a specific key in a dictionary?",
      "Level 2: Use inventory['fluent_python'] += 3 to update. Use inventory.get('key', default_val) for safe lookup.",
      "Level 3: To sum all values: total = sum(inventory.values()). Then print(total).",
      "Level 4: For safe checking:\nif 'algorithms_guide' not in inventory:\n    print('Not stocked')",
      "Level 5: Solution: Combine inventory['fluent_python'] += 3 with sum(inventory.values()) and safe lookup.",
    ],
    feynmanPrompt: "What is the key difference between a Python list and a dictionary in terms of how you look up data?",
  },
];

export const DATA_SCIENCE_TOPICS: TopicItem[] = [
  {
    id: "ds-cleaning",
    track: "datascience",
    title: "DS 1: Data Cleaning & Type Casting",
    level: "Intermediate",
    analogy: "Raw data is like unrefined ore: it contains missing values, strange formatting, and mixed types that must be filtered before analysis.",
    explanation: "Clean anomalies by filtering `None`, stripping whitespace, parsing currencies, and handling missing values with default medians or sentinels.",
    starterCode: `# Raw messy customer transaction data:
raw_transactions = [" $10.50 ", "25.00", "None", "$14.20", "INVALID", " 100.0 "]

# Extract valid numeric floats into 'clean_data' and calculate the total sales
clean_data = []

# Write your cleaning logic here:
`,
    goal: "Parse noisy string records into a clean list of floats and compute summary statistics.",
    validationRule: (code: string, stdout: string) => {
      const hasLoop = code.includes("for") || code.includes("[");
      const hasStripOrReplace = code.includes("replace") || code.includes("strip");
      const hasOutput = stdout.trim().length > 0;
      return hasLoop && hasStripOrReplace && hasOutput;
    },
    hints: [
      "Level 1: What string methods can remove extra whitespace or remove the dollar sign '$'?",
      "Level 2: Use `.strip()` and `.replace('$', '')`. Then try casting to float with a try/except block.",
      "Level 3: for item in raw_transactions:\n    try:\n        cleaned = float(item.strip().replace('$', ''))\n        clean_data.append(cleaned)\n    except ValueError:\n        continue",
      "Level 4: Sum clean_data using sum() and print the total sales.",
      "Level 5: Solution: Loop with try/except ValueError, append valid floats, print sum(clean_data).",
    ],
    feynmanPrompt: "Why is a `try...except ValueError` block more resilient for data cleaning than manually checking every possible invalid string?",
  },
  {
    id: "ds-stats",
    track: "datascience",
    title: "DS 2: Descriptive Statistics (Mean, Median, Variance)",
    level: "Intermediate",
    analogy: "Descriptive statistics summarize thousands of individual data points into a few meaningful numbers that describe central tendency and spread.",
    explanation: "Implement central metrics from first principles: Mean is sum/count; Median is the middle value of a sorted list; Variance measures dispersion.",
    starterCode: `def calculate_summary_stats(data):
    # Sort data for median
    sorted_data = sorted(data)
    n = len(sorted_data)
    
    # 1. Compute mean
    mean = sum(sorted_data) / n
    
    # 2. Compute median (handle odd/even length)
    # TODO: Write median logic
    median = 0
    
    return {"mean": mean, "median": median}

sample_data = [12, 18, 14, 22, 10, 28, 16]
print(calculate_summary_stats(sample_data))
`,
    goal: "Compute the exact median and mean for an odd or even length dataset.",
    validationRule: (code: string, stdout: string) => {
      const hasMedian = code.includes("median");
      const hasOutput = stdout.includes("16") && stdout.includes("mean");
      return hasMedian && hasOutput;
    },
    hints: [
      "Level 1: When a list of numbers is sorted, where is the median located?",
      "Level 2: If length n is odd, the middle index is `n // 2`. If even, it's the average of indices `n//2 - 1` and `n//2`.",
      "Level 3: For odd length: `median = sorted_data[n // 2]`.",
      "Level 4: sample_data has 7 elements (odd), so index 7//2 = 3 gives the median.",
      "Level 5: Solution: Set median = sorted_data[n//2] if n % 2 != 0 else (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2.",
    ],
    feynmanPrompt: "When would the median be a much better metric of central tendency than the mean for real-world data like salaries?",
  },
];

export const DEBUG_CHALLENGES: DebugChallenge[] = [
  {
    id: "debug-off-by-one",
    title: "The Off-By-One Index Trap",
    difficulty: "Beginner",
    brokenCode: `fruits = ["apple", "banana", "cherry"]

# The student wants to print all items using an index
for i in range(1, len(fruits) + 1):
    print(f"Fruit {i}: {fruits[i]}")
`,
    bugExplanation: "IndexError: Python lists start at index 0. Accessing fruits[len(fruits)] will crash because the maximum index is len - 1.",
    validationRule: (code: string, stdout: string) => {
      return !stdout.includes("IndexError") && stdout.includes("apple") && stdout.includes("cherry");
    },
  },
  {
    id: "debug-mutable-default",
    title: "The Persistent List Mystery",
    difficulty: "Intermediate",
    brokenCode: `def add_task(task_name, task_list=[]):
    task_list.append(task_name)
    return task_list

print(add_task("Write docs"))
print(add_task("Review PR"))
# Why does the second call contain both tasks?!
`,
    bugExplanation: "Mutable default arguments (`task_list=[]`) are evaluated once when the function is defined, causing state to persist between calls.",
    validationRule: (code: string, stdout: string) => {
      return code.includes("None") && stdout.includes("['Review PR']");
    },
  },
  {
    id: "debug-type-coercion",
    title: "The Accidental String Concatenation",
    difficulty: "Beginner",
    brokenCode: `price = "45"
tax = "5"

total = price + tax
print("Total price is:", total)
# Expected: 50, but it prints: 455!
`,
    bugExplanation: "String concatenation vs numeric addition. '45' + '5' is '455' instead of 50.",
    validationRule: (code: string, stdout: string) => {
      return stdout.includes("50") && !stdout.includes("455");
    },
  },
];

export const PREDICT_CHALLENGES: PredictChallenge[] = [
  {
    id: "predict-1",
    code: `x = [1, 2, 3]
y = x
y.append(4)
print(len(x))`,
    options: ["3", "4", "Error", "Undefined"],
    correct: 1,
    explanation: "In Python, assigning `y = x` copies the reference to the list, not the list itself. Mutating `y` also mutates `x`.",
  },
  {
    id: "predict-2",
    code: `a = 10
def test():
    a = 20
test()
print(a)`,
    options: ["20", "10", "UnboundLocalError", "None"],
    correct: 1,
    explanation: "`a = 20` creates a local variable inside `test()`. The outer global `a` remains 10.",
  },
  {
    id: "predict-3",
    code: `nums = [i * 2 for i in range(4) if i % 2 == 0]
print(nums)`,
    options: ["[0, 2, 4]", "[0, 4]", "[2, 4]", "[0, 1, 2, 3]"],
    correct: 1,
    explanation: "Range(4) yields 0, 1, 2, 3. The condition `i % 2 == 0` filters for 0 and 2. Multiplying by 2 gives [0, 4].",
  },
];

export const STAGED_PROJECTS: StagedProject[] = [
  {
    id: "proj-expense-tracker",
    title: "Personal Expense Tracker & Analytics CLI",
    level: "Intermediate",
    description: "Build a complete financial ledger that parses transactions, computes category totals, and detects outlier expenses.",
    stages: [
      {
        stageNumber: 1,
        title: "Stage 1: Data Model Design",
        task: "Define a function `create_expense(category, amount, description)` that returns a dictionary with validated keys.",
        starterCode: `def create_expense(category, amount, description):
    # Return a structured dictionary with keys: 'category', 'amount', 'description'
    # Ensure amount is a float
    pass

# Test
expense = create_expense("Food", 24.50, "Lunch meeting")
print(expense)
`,
        validationRule: (code, stdout) => {
          return stdout.includes("Food") && stdout.includes("24.5");
        },
      },
      {
        stageNumber: 2,
        title: "Stage 2: Category Aggregator",
        task: "Write `calculate_category_totals(expenses_list)` that sums spending per category into a dictionary.",
        starterCode: `expenses = [
    {"category": "Food", "amount": 20.0},
    {"category": "Transport", "amount": 15.0},
    {"category": "Food", "amount": 35.0},
]

def calculate_category_totals(expenses):
    # Sum amount by category
    totals = {}
    for exp in expenses:
        cat = exp["category"]
        totals[cat] = totals.get(cat, 0) + exp["amount"]
    return totals

print(calculate_category_totals(expenses))
`,
        validationRule: (code, stdout) => {
          return stdout.includes("Food': 55") || stdout.includes("Food\": 55");
        },
      },
      {
        stageNumber: 3,
        title: "Stage 3: Outlier & Budget Alert",
        task: "Write `check_budget_limits(category_totals, limits)` that flags any category that exceeds its allowed budget.",
        starterCode: `totals = {"Food": 150.0, "Transport": 45.0, "Entertainment": 120.0}
limits = {"Food": 100.0, "Transport": 50.0, "Entertainment": 100.0}

def check_budget_limits(totals, limits):
    alerts = []
    for cat, total in totals.items():
        if cat in limits and total > limits[cat]:
            alerts.append(f"ALERT: {cat} exceeded by {total - limits[cat]}")
    return alerts

print(check_budget_limits(totals, limits))
`,
        validationRule: (code, stdout) => {
          return stdout.includes("ALERT") && stdout.includes("Food");
        },
      },
    ],
  },
];
