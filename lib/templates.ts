export interface PromptTemplate {
  id: string;
  name: string;
  category: "code" | "writing" | "analysis" | "creative" | "education";
  prompt: string;
  description: string;
  icon: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // CODE (10)
  { id: "debug", name: "Debug This Code", category: "code", icon: "bug", description: "Find and fix bugs in code",
    prompt: "Debug the following code. Identify the bug, explain why it happens, and provide the corrected version:\n\n```\n// Paste your code here\n```" },
  { id: "refactor", name: "Refactor Code", category: "code", icon: "wrench", description: "Improve code quality and readability",
    prompt: "Refactor the following code for better readability, performance, and maintainability. Explain each change:\n\n```\n// Paste your code here\n```" },
  { id: "explain-code", name: "Explain Code", category: "code", icon: "book-open", description: "Get a clear explanation of any code",
    prompt: "Explain the following code line by line. What does it do, and how does it work?\n\n```\n// Paste your code here\n```" },
  { id: "unit-test", name: "Write Unit Tests", category: "code", icon: "check-circle", description: "Generate comprehensive tests",
    prompt: "Write comprehensive unit tests for the following function. Include edge cases, error scenarios, and happy path tests. Use Jest/Vitest syntax:\n\n```\n// Paste your function here\n```" },
  { id: "sql-query", name: "SQL Query Builder", category: "code", icon: "database", description: "Generate optimized SQL queries",
    prompt: "Write an optimized SQL query for the following requirement. Include index suggestions if relevant:\n\nRequirement: " },
  { id: "api-design", name: "Design REST API", category: "code", icon: "server", description: "Design clean API endpoints",
    prompt: "Design a REST API for the following feature. Include endpoints, HTTP methods, request/response schemas, and status codes:\n\nFeature: " },
  { id: "code-review", name: "Code Review", category: "code", icon: "eye", description: "Get a thorough code review",
    prompt: "Review the following code for bugs, security issues, performance problems, and best practices. Rate severity (low/medium/high) for each finding:\n\n```\n// Paste your code here\n```" },
  { id: "regex", name: "Regex Generator", category: "code", icon: "search", description: "Generate and explain regex patterns",
    prompt: "Create a regex pattern that matches the following requirement. Explain each part of the pattern and provide test cases:\n\nRequirement: " },
  { id: "algorithm", name: "Algorithm Design", category: "code", icon: "cpu", description: "Design efficient algorithms",
    prompt: "Design an efficient algorithm for the following problem. Include time/space complexity analysis and pseudocode:\n\nProblem: " },
  { id: "docs-gen", name: "Generate Docs", category: "code", icon: "file-text", description: "Auto-generate documentation",
    prompt: "Generate comprehensive documentation for the following code. Include: overview, parameters, return values, examples, and edge cases:\n\n```\n// Paste your code here\n```" },

  // WRITING (8)
  { id: "blog-post", name: "Blog Post Draft", category: "writing", icon: "pen-tool", description: "Draft a structured blog post",
    prompt: "Write a comprehensive blog post about the following topic. Include an engaging introduction, 3-5 main sections with subheadings, and a conclusion:\n\nTopic: " },
  { id: "email-draft", name: "Professional Email", category: "writing", icon: "mail", description: "Draft professional emails",
    prompt: "Write a professional email for the following situation. Keep it concise, clear, and actionable:\n\nSituation: " },
  { id: "cover-letter", name: "Cover Letter", category: "writing", icon: "file", description: "Craft compelling cover letters",
    prompt: "Write a compelling cover letter for the following job position. Highlight relevant experience and enthusiasm:\n\nPosition: \nMy background: " },
  { id: "product-desc", name: "Product Description", category: "writing", icon: "shopping-bag", description: "Write persuasive product copy",
    prompt: "Write a compelling product description that highlights benefits, features, and creates urgency. Target audience and product details:\n\nProduct: " },
  { id: "social-media", name: "Social Media Post", category: "writing", icon: "share-2", description: "Create engaging social posts",
    prompt: "Create engaging social media posts for the following topic. Write versions for Twitter (280 chars), LinkedIn (professional), and Instagram (casual with hashtags):\n\nTopic: " },
  { id: "story", name: "Short Story", category: "writing", icon: "book", description: "Generate creative short stories",
    prompt: "Write a short story (500-800 words) based on the following premise. Include vivid descriptions, dialogue, and a surprising ending:\n\nPremise: " },
  { id: "summarize", name: "Summarize Text", category: "writing", icon: "minimize-2", description: "Condense long text into key points",
    prompt: "Summarize the following text into 3-5 key bullet points. Preserve the most important information:\n\n" },
  { id: "translate", name: "Translate & Localize", category: "writing", icon: "globe", description: "Translate with cultural context",
    prompt: "Translate the following text to [TARGET LANGUAGE]. Preserve tone, cultural nuances, and formatting:\n\n" },

  // ANALYSIS (6)
  { id: "data-analysis", name: "Analyze Data", category: "analysis", icon: "bar-chart-2", description: "Extract insights from data",
    prompt: "Analyze the following data. Identify trends, anomalies, and actionable insights. Present findings in a structured format:\n\n" },
  { id: "compare-options", name: "Compare Options", category: "analysis", icon: "git-branch", description: "Systematic comparison of choices",
    prompt: "Compare the following options in a structured table format. Include: pros, cons, cost, complexity, and recommendation:\n\nOptions: " },
  { id: "pros-cons", name: "Pros & Cons", category: "analysis", icon: "list", description: "Balanced analysis of trade-offs",
    prompt: "Provide a detailed pros and cons analysis for the following decision. Include hidden risks and opportunities:\n\nDecision: " },
  { id: "research", name: "Research Brief", category: "analysis", icon: "search", description: "Quick research on any topic",
    prompt: "Provide a comprehensive research brief on the following topic. Include: overview, key facts, current trends, and sources to explore:\n\nTopic: " },
  { id: "swot", name: "SWOT Analysis", category: "analysis", icon: "target", description: "Strategic SWOT framework",
    prompt: "Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the following:\n\nSubject: " },
  { id: "market-analysis", name: "Market Analysis", category: "analysis", icon: "trending-up", description: "Market opportunity assessment",
    prompt: "Analyze the market opportunity for the following product/service. Include: target audience, market size, competitors, pricing strategy, and go-to-market approach:\n\nProduct: " },

  // CREATIVE (4)
  { id: "brainstorm", name: "Brainstorm Ideas", category: "creative", icon: "lightbulb", description: "Generate creative ideas",
    prompt: "Brainstorm 10 creative ideas for the following challenge. For each idea, include: concept (1 sentence), why it works, and first step to implement:\n\nChallenge: " },
  { id: "tagline", name: "Tagline Generator", category: "creative", icon: "zap", description: "Catchy taglines and slogans",
    prompt: "Generate 10 catchy taglines/slogans for the following brand or product. Mix styles: clever, emotional, direct, question-based:\n\nBrand/Product: " },
  { id: "name-gen", name: "Name Generator", category: "creative", icon: "tag", description: "Business and product names",
    prompt: "Generate 15 creative name suggestions for the following. Include: available domain check hints (.com availability likelihood), pronunciation notes, and why each name works:\n\nWhat needs naming: " },
  { id: "analogy", name: "Explain with Analogy", category: "creative", icon: "repeat", description: "Explain complex things simply",
    prompt: "Explain the following complex concept using 3 different analogies. Make each progressively more detailed:\n\nConcept: " },

  // EDUCATION (4)
  { id: "eli5", name: "Explain Like I'm 5", category: "education", icon: "smile", description: "Simple explanations for anything",
    prompt: "Explain the following concept as if I'm 5 years old. Use simple words, everyday examples, and no jargon:\n\nConcept: " },
  { id: "study-guide", name: "Study Guide", category: "education", icon: "book-open", description: "Comprehensive study materials",
    prompt: "Create a comprehensive study guide for the following topic. Include: key concepts, definitions, examples, practice questions, and memory aids:\n\nTopic: " },
  { id: "quiz", name: "Quiz Generator", category: "education", icon: "help-circle", description: "Generate quiz questions",
    prompt: "Generate 10 quiz questions (mix of multiple choice, true/false, and short answer) for the following topic. Include answers and explanations:\n\nTopic: " },
  { id: "lesson-plan", name: "Lesson Plan", category: "education", icon: "clipboard", description: "Structured lesson plans",
    prompt: "Create a 60-minute lesson plan for the following topic. Include: learning objectives, materials needed, activities, discussion questions, and assessment:\n\nTopic: " },
];

export function getTemplatesByCategory(category?: string): PromptTemplate[] {
  if (!category || category === "all") return PROMPT_TEMPLATES;
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
}

export const CATEGORIES = [
  { id: "all", name: "All Templates", count: PROMPT_TEMPLATES.length },
  { id: "code", name: "Code", count: PROMPT_TEMPLATES.filter((t) => t.category === "code").length },
  { id: "writing", name: "Writing", count: PROMPT_TEMPLATES.filter((t) => t.category === "writing").length },
  { id: "analysis", name: "Analysis", count: PROMPT_TEMPLATES.filter((t) => t.category === "analysis").length },
  { id: "creative", name: "Creative", count: PROMPT_TEMPLATES.filter((t) => t.category === "creative").length },
  { id: "education", name: "Education", count: PROMPT_TEMPLATES.filter((t) => t.category === "education").length },
];
