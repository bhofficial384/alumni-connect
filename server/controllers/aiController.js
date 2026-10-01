/**
 * aiController — Multi-Provider AI Engine for AlumniConnect
 * Supports:
 * 1. Google Gemini Flash (GEMINI_API_KEY)
 * 2. OpenAI GPT-4o-mini (OPENAI_API_KEY)
 * 3. Anthropic Claude (ANTHROPIC_API_KEY)
 * 4. High-Quality Dynamic Procedural AI Engine (when external keys are not provided)
 */

// Helper to call configured LLM or fallback cleanly
const callLLM = async ({ systemPrompt, userPrompt, temperature = 0.7, maxTokens = 1200 }) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // 1. Google Gemini Flash API
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, provider: 'gemini' };
      } else {
        console.warn('Gemini API call failed, trying next provider or fallback');
      }
    } catch (err) {
      console.warn('Gemini API error:', err.message);
    }
  }

  // 2. OpenAI API (GPT-4o-mini)
  if (openAiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return { text, provider: 'openai' };
      } else {
        console.warn('OpenAI API call failed, trying next provider or fallback');
      }
    } catch (err) {
      console.warn('OpenAI API error:', err.message);
    }
  }

  // 3. Anthropic Claude API
  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return { text, provider: 'anthropic' };
      }
    } catch (err) {
      console.warn('Anthropic API error:', err.message);
    }
  }

  return null;
};

/**
 * 1. Conversational AI Career Assistant (Copilot)
 * POST /api/ai/chat
 */
const chatAssistant = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const studentName = req.user?.name || 'Student';
    const studentRole = req.user?.role || 'student';

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Prompt message is required' });
    }

    const systemPrompt = `You are "AlumniCopilot", an elite AI Career Advisor and Alumni Networking Strategist at AlumniConnect.
Your mission is to help university students and mentees:
1. Connect meaningfully with alumni working at top companies (Google, Stripe, Microsoft, Goldman Sachs, etc.).
2. Master behavioral and technical interview strategies (STAR method, system design, case interviews).
3. Frame high-impact resume bullets and portfolio projects.
4. Prepare insightful questions for 30-minute 1-on-1 alumni coffee chats.

Guidelines:
- Keep responses concise, structured, and immediately actionable.
- Use markdown bolding and bullet points for readability.
- Maintain an encouraging, executive, and warm tone.
- Address the user as ${studentName} when appropriate.`;

    const formattedHistory = conversationHistory
      .slice(-6)
      .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const userPrompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ''}User Question: ${message}`;

    const llmResult = await callLLM({ systemPrompt, userPrompt, temperature: 0.7 });

    if (llmResult) {
      return res.json({
        reply: llmResult.text,
        provider: llmResult.provider
      });
    }

    // Dynamic contextual fallback response when no API key is supplied
    const query = message.toLowerCase();
    let dynamicReply = '';

    if (query.includes('interview') || query.includes('mock') || query.includes('question')) {
      dynamicReply = `### 🎯 Targeted Interview Strategy for ${studentName}

1. **The STAR Framework**:
   - **Situation**: Briefly set the context (company, challenge, or team setting).
   - **Task**: Define the exact deliverable or problem you owned.
   - **Action**: Highlight *your* specific decisions, tech choices, or leadership steps (avoid saying "we").
   - **Result**: Quantify the business or technical outcome (e.g., *reduced latency by 32%* or *onboarded 1,500 active users*).

2. **Top 3 Questions to Ask Your Alumni Interviewer**:
   - *"What surprised you most about the engineering culture when you transitioned from university to your current company?"*
   - *"How does your team evaluate code quality and architecture trade-offs under tight deadlines?"*
   - *"If you were in my shoes preparing for this role today, what key skill would you prioritize?"*

💡 *Tip: Request a 1-on-1 mock session with one of our verified alumni mentors to practice your pitch!*`;
    } else if (query.includes('resume') || query.includes('bullet') || query.includes('cv')) {
      dynamicReply = `### 📄 Resume Polish Formula (Google X-Y-Z Standard)

Transform your resume bullets using this high-conversion formula:
> **"Accomplished [X], as measured by [Y], by doing [Z]"**

**Example Transformation:**
- ❌ *Weak:* "Built a web app for students to book sessions."
- ✅ *Strong:* "Architected a responsive full-stack booking portal supporting **500+ active university users**, reducing session scheduling latency by **45%** utilizing React, Node.js, and MongoDB."

**Quick Checklist:**
- Start every bullet with a strong action verb (*Spearheaded, Engineered, Optimized, Delivered*).
- Keep bullets under 2 lines.
- Always include at least one metric (% efficiency gain, user count, or data scale).`;
    } else if (query.includes('reach') || query.includes('message') || query.includes('email') || query.includes('coffee chat')) {
      dynamicReply = `### ☕ Cold Outreach & Coffee Chat Template

Here is a tested, high-response note you can customize when booking a session:

> *"Hi [Mentor Name],*  
> *I came across your profile on AlumniConnect and was inspired by your career journey from campus to [Company]. As a student passionate about [Domain/Field], I'd love to learn from your experience.*  
> *Would you be open to a 20-30 minute virtual coffee chat to discuss [Specific Topic]? I have prepared a few targeted questions and would deeply value your perspective.*  
> *Best regards,*  
> *${studentName}"*

📌 *Pro Tip: Use our **"⚡ AI Draft My Request"** button inside the Book Session modal to auto-generate this tailored to any mentor with 1 click!*`;
    } else {
      dynamicReply = `Hello **${studentName}**! 👋 I'm your AlumniCopilot career advisor.

Here are high-impact ways I can accelerate your journey today:
1. **Outreach Optimization**: Draft personalized session requests to alumni at Google, Amazon, Stripe, and Goldman Sachs.
2. **Interview Readiness**: Generate role-specific behavioral and technical mock questions.
3. **Resume Review**: Upgrade your project bullet points into Google XYZ metric-driven achievements.
4. **Alumni Matching**: Advise you on which mentor is best aligned with your career goals.

What career milestone or company would you like to prepare for?`;
    }

    res.json({
      reply: dynamicReply,
      provider: 'local-engine'
    });
  } catch (error) {
    console.error('AI Chat Assistant Error:', error);
    res.status(500).json({ message: 'Error processing AI chat request', error: error.message });
  }
};

/**
 * 2. Specialized Prompt API: AI Cold Outreach & Session Request Drafter
 * POST /api/ai/draft-outreach
 */
const draftOutreach = async (req, res) => {
  try {
    const { mentorName, mentorCompany, mentorDomain, topic, tone = 'professional', customNote = '' } = req.body;
    const studentName = req.user?.name || 'A Student Mentee';

    if (!mentorName) {
      return res.status(400).json({ message: 'Mentor name is required' });
    }

    const systemPrompt = `You are an expert alumni communications coach. 
Craft a personalized, concise, high-converting 3-paragraph outreach note from a student requesting a 1-on-1 mentorship session with an alumni mentor.
Tone: ${tone}.
Keep it under 150 words. Do not use generic filler. Highlight genuine curiosity and specific topic alignment.`;

    const userPrompt = `Student Name: ${studentName}
Mentor Name: ${mentorName}
Mentor's Company: ${mentorCompany || 'Top Tech'}
Mentor's Domain: ${mentorDomain || 'Engineering'}
Session Topic: ${topic || 'Career Guidance & Industry Transition'}
Additional Context: ${customNote || 'None'}`;

    const llmResult = await callLLM({ systemPrompt, userPrompt, temperature: 0.65 });

    if (llmResult) {
      return res.json({
        outreachMessage: llmResult.text.trim(),
        provider: llmResult.provider
      });
    }

    // Dynamic procedural generator
    const companyText = mentorCompany ? ` at ${mentorCompany}` : '';
    const domainText = mentorDomain ? ` in ${mentorDomain}` : '';
    const topicText = topic || 'navigating career opportunities and industry best practices';

    const fallbackDraft = `Dear ${mentorName},

I hope this note finds you well! I came across your profile on AlumniConnect and was truly inspired by your accomplishments${companyText}${domainText}. As a current student working hard to break into this field, learning from alumni who have walked this path is invaluable.

I would be deeply grateful for the opportunity to connect for a brief 20-30 minute mentorship session to discuss ${topicText}. I have prepared specific questions regarding skill development and interview preparation to ensure we make the most of your valuable time.

Thank you very much for giving back to our university community. I look forward to connecting with you!

Warm regards,
${studentName}`;

    res.json({
      outreachMessage: fallbackDraft,
      provider: 'local-engine'
    });
  } catch (error) {
    console.error('Draft Outreach Error:', error);
    res.status(500).json({ message: 'Failed to generate outreach message', error: error.message });
  }
};

/**
 * 3. Specialized Prompt API: AI Interview Prep Generator
 * POST /api/ai/interview-prep
 */
const interviewPrep = async (req, res) => {
  try {
    const { targetCompany = 'Tech Giant', role = 'Software Engineer', experienceLevel = 'Entry-Level' } = req.body;

    const systemPrompt = `You are a Senior Principal Technical Interviewer and Hiring Committee Lead.
Generate a structured, actionable interview preparation guide for the specified company and role.
Format clearly in Markdown with headers, bullet points, and practical tips.`;

    const userPrompt = `Target Company: ${targetCompany}
Role: ${role}
Experience Level: ${experienceLevel}

Generate:
1. Top 3 Behavioral / Culture Questions tailored to ${targetCompany} (with the key quality they test).
2. Top 3 Technical / Domain Deep-Dive Questions (with recommended approach).
3. 2 Smart Questions the candidate should ask the interviewer at the end of the session.`;

    const llmResult = await callLLM({ systemPrompt, userPrompt, temperature: 0.7 });

    if (llmResult) {
      return res.json({
        prepGuide: llmResult.text,
        provider: llmResult.provider
      });
    }

    // Dynamic tailored fallback guide
    const fallbackGuide = `### 🚀 Interview Prep Guide for ${targetCompany} — ${role}

#### 1. Behavioral & Culture Fit Questions
- **"Tell me about a time you faced technical disagreement on a project."**
  - *What they look for:* Empathy, data-driven reasoning, and disagree-and-commit maturity.
- **"Describe a complex project that missed a deadline or failed to launch as planned."**
  - *What they look for:* Ownership, root-cause analysis (post-mortem), and resilience without blaming teammates.
- **"Why ${targetCompany} specifically over other industry leaders?"**
  - *What they look for:* Specific knowledge of ${targetCompany}'s products, engineering culture, and mission.

#### 2. Core Technical Competency Questions
- **Architecture & Trade-offs:** *"How would you design a scalable notification or rate-limiting service capable of handling 50k requests/sec?"*
- **Algorithmic Efficiency:** *"Given a continuous stream of data, how do you find the top K frequent elements within bounded memory?"*
- **Debugging & Reliability:** *"Walk me through how you isolate a memory leak or sudden latency spike in production."*

#### 3. Smart Questions to Ask Your Interviewer
1. *"What is the single biggest engineering bottleneck your team is working to solve over the next two quarters?"*
2. *"How does mentorship and career mobility operate between junior and staff engineers in this organization?"*`;

    res.json({
      prepGuide: fallbackGuide,
      provider: 'local-engine'
    });
  } catch (error) {
    console.error('Interview Prep Error:', error);
    res.status(500).json({ message: 'Failed to generate interview prep guide', error: error.message });
  }
};

/**
 * 4. Specialized Prompt API: AI Resume Bullet Polisher (Google XYZ Formula)
 * POST /api/ai/resume-polish
 */
const resumePolish = async (req, res) => {
  try {
    const { bulletPoint, targetRole = 'Software Engineer' } = req.body;

    if (!bulletPoint || !bulletPoint.trim()) {
      return res.status(400).json({ message: 'Resume bullet point is required' });
    }

    const systemPrompt = `You are an elite Tech Career Coach & Former FAANG Recruiter.
Your job is to rewrite raw student resume bullets into punchy, metric-driven bullet points using the Google XYZ Formula:
"Accomplished [X], as measured by [Y], by doing [Z]".
Provide:
1. Polished Version (Strongest)
2. Metric Alternative (Emphasizing scale/speed)
3. Key Impact Highlights.`;

    const userPrompt = `Target Role: ${targetRole}
Original Bullet: "${bulletPoint.trim()}"`;

    const llmResult = await callLLM({ systemPrompt, userPrompt, temperature: 0.6 });

    if (llmResult) {
      return res.json({
        result: llmResult.text,
        provider: llmResult.provider
      });
    }

    // Dynamic Polish Engine
    const clean = bulletPoint.trim().replace(/^[-*•]\s*/, '');
    const polished1 = `Spearheaded ${clean}, resulting in a 40% reduction in turnaround time and enhancing user reliability across 1,000+ operations.`;
    const polished2 = `Architected and deployed optimized solutions for ${clean}, delivering measurable improvements in workflow efficiency and data integrity using modern engineering best practices.`;

    const fallbackResult = `### 📄 AI Resume Enhancements

#### Option 1: Metric-Driven (Recommended)
• **${polished1}**

#### Option 2: Architectural & Engineering Focus
• **${polished2}**

**Why this works:**
- Uses active leadership verbs (*Spearheaded, Architected*).
- Adds quantifiable impact metrics to catch automated ATS filters and recruiter eyes.`;

    res.json({
      result: fallbackResult,
      provider: 'local-engine'
    });
  } catch (error) {
    console.error('Resume Polish Error:', error);
    res.status(500).json({ message: 'Failed to polish resume bullet', error: error.message });
  }
};

/**
 * Legacy support for existing POST /api/ai-assistant
 */
const generateMessage = async (req, res) => {
  req.body.mentorName = req.body.context || 'Alumni Mentor';
  req.body.topic = req.body.prompt || 'Career Mentorship';
  return draftOutreach(req, res);
};

module.exports = {
  chatAssistant,
  draftOutreach,
  interviewPrep,
  resumePolish,
  generateMessage
};
