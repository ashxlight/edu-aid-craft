import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const simplifyContent = async (text, disability, grade, language = 'en-IN') => {
  let promptInstructions = `You are an expert educator. Your CRITICAL task is to adapt the following educational content STRICTLY for a student at the "${grade}" reading level. 
  
  MANDATORY GRADE-LEVEL RULES for "${grade}":
  - The vocabulary, sentence length, and conceptual depth MUST perfectly match a "${grade}" student.
  - If "${grade}" is early education (like Kindergarten/Primary), explain any complex concept using extremely simple, relatable analogies.
  - If "${grade}" is advanced (like High School/College), maintain rigorous academic terminology while making it accessible.
  
  The output content MUST be written in the ${language} language code (for example: if hi-IN, write in Hindi).`;

  switch (disability) {
    case 'ADHD':
      promptInstructions += `
        Rules for ADHD:
        1. Condense the text into short, punchy paragraphs (max 2-3 sentences each).
        2. Use bullet points for any lists or sequential steps.
        3. Wrap ALL critical keywords and concepts in <<keyword>> markers (e.g. <<photosynthesis>>). Use this for 6-10 keywords.
        4. Start each major section with a relevant emoji icon (e.g. 🌱 for plants, ⚡ for energy, 🧪 for chemistry).
        5. For each slide in the slides array, include a "colorTag" field with one of these labels: "blue", "green", "orange", "purple", "red". Alternate colors across slides so the presentation feels color-coded by section.
        6. For each slide, include a "visualIcon" field with a single emoji that represents the section content (e.g. "☀️", "💧", "🔬").
        7. Keep the tone energetic and engaging. Use exclamation marks and direct address ("You!", "Check this out!").
      `;
      break;
    case 'Dyslexia':
      promptInstructions += `
        Rules for Dyslexia:
        1. Rewrite complex sentences into simple, active-voice structures.
        2. Assure the text is left-aligned with no complex vocabulary where a simpler word works.
        3. Break the text into highly readable chunks with clear, descriptive subheadings.
        4. Suggest an optimal background color (like soft cream or pastel) to reduce visual stress.
      `;
      break;
    case 'Visual Impairment':
      promptInstructions += `
        Rules for Visual Impairment:
        1. Organize the text with a strict, logical heading structure (Heading 1, Heading 2).
        2. Remove any reliance on visual cues (e.g., change 'As you can see in the diagram' to a full text explanation of the concept).
        3. Provide highly detailed Alt-Text descriptions for any suggested images or graphs.
        4. Recommend a high-contrast color scheme (e.g., yellow text on black).
      `;
      break;
    case 'ASD':
      promptInstructions += `
        Rules for ASD (Autism Spectrum Disorder):
        1. MUST be Point Wise: Break all information down into short, bulleted points. Completely avoid long paragraphs.
        2. Simple Language: Use very simple language and strictly literal phrasing. Remove metaphors, idioms, or ambiguous phrasing.
        3. Clear Structure: Format the content predictably. If there is a process, format it as a clear, numbered step-by-step list.
        4. Visual Support: Suggest concrete visual aids and literal image queries to anchor the concepts rather than abstract decorative images.
        5. Avoid Bright Colors: Recommend and explicitly mention utilizing low-arousal, muted color palettes (cool grays, soft blues) instead of bright colors.
      `;
      break;
    case 'APD':
      promptInstructions += `
        Rules for APD (Auditory Processing Disorder):
        1. Add a "Bottom Line Up Front" (BLUF) brief summary at the very beginning of the text to prime the student.
        2. Ensure all instructions or complex concepts are fully written out and broken down into isolated, single-step numbered lists to reduce working memory load.
        3. Explicitly state that any accompanying audio or video materials must include full, accurate transcripts or captions.
        4. Suggest visual maps or diagrams (like a mind map or Venn diagram).
      `;
      break;
    default:
      promptInstructions += `Provide a simple, easy-to-read summary with short sentences.`;
      break;
  }

  const prompt = `${promptInstructions}

  ADDITIONAL FORMATTING RULES (apply to ALL disabilities):
  - CRITICAL: Wrap the 5-8 most important keywords and scientific terms by surrounding them with double angle brackets like this: <<keyword>>. For example: <<photosynthesis>> is how plants make food using <<sunlight>>.
  - Write a warm, approachable summary paragraph at the end starting with "**Summary:**" (translate to language).
  - Use "## " prefix for section headings.
  - Use numbered lists (1. 2. 3.) for sequential steps.
  - Include helpful emoji where appropriate.
  - Be thorough — write around 150-200 words of adapted content.
  - CRITICAL LANGUAGE RULE: ALL output text (simplifiedContent, audioScript, and videoSegments text, slides bullet points) MUST BE written in the ${language} language. Only "imageQuery" should be in English.
  
  Content to adapt:
  ${text}
  
  IMPORTANT: You MUST return ONLY a valid JSON object with exactly this schema, and nothing else. Do NOT wrap the JSON in Markdown (no \`\`\`json).
  {
    "simplifiedContent": "(STRING) The structured adapted text in ${language}. MUST be a SINGLE long string. Use ## for section headings. Use numbered lists. Include a **Summary:** paragraph at the end. Write around 150-200 words.",
    "audioScript": "(STRING) A warm, conversational narration (in ${language}, around 150-200 words). MUST be a SINGLE string containing natural flowing speech. Do NOT use any << >> markers or markdown.",
    "videoSegments": [
      {
        "text": "Intriguing first segment of the explanation (approx 30-40 words).",
        "imageQuery": "Atmospheric 4k illustration of the beginning of the process"
      },
      {
        "text": "The middle part detailing the transformation or core concept.",
        "imageQuery": "Detailed 4k scientific diagram or cinematic art"
      },
      {
        "text": "Conclusion and wrap-up with a final takeaway.",
        "imageQuery": "Calm, summative high-quality educational art"
      }
    ],
    "slides": [
      {
        "title": "Slide Title in ${language}",
        "bulletPoints": ["Detailed key point 1 with full explanation in ${language}", "Point 2", "Point 3", "Point 4"],
        "colorTag": "blue",
        "visualIcon": "🌱",
        "imageQuery": "vibrant green plant leaves photosynthesis sunlight"
      }
    ]
  }
  
  VIDEO RULES:
  - Generate exactly 6 video segments (~2 min total). 
  - Each part narration: 60-80 words. High clarity, descriptive.
  - "imageQuery" MUST use **GENERIC STOCK KEYWORDS** only.
    !! IMPORTANT: Stock sites (Pexels) DO NOT have copyrighted characters.
    BAD: "Tom and Jerry", "Spongebob", "Marvel"
    GOOD: "Cartoon cat and mouse", "Animated 2D characters", "Golden age animation production"
    Format: "[Topic Keywords], [Visual Perspective]"
  - IMPORTANT: Every segment must focus on a DIFFERENT aspect of the topic.
  
  SLIDE RULES:
  - Generate exactly 5 slides with 3 bullet points each.
  - "imageQuery" for slides: Unique 8-12 words prompt.
  - Wrap terms in <<keyword>> for all content.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 8000,
      response_format: { type: "json_object" }
    });

    let contentStr = chatCompletion.choices[0]?.message?.content || '{}';
    try {
      // Strip markdown code blocks just in case the LLM outputs them despite instructions
      contentStr = contentStr.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const jsonResp = JSON.parse(contentStr);
      return {
        simplifiedContent: jsonResp.simplifiedContent || "Failed to generate text.",
        audioScript: jsonResp.audioScript || "Welcome! Let's learn about this topic today.",
        slides: jsonResp.slides || [],
        videoSegments: jsonResp.videoSegments || []
      }
    } catch (e) {
      console.error("Failed to parse JSON", e);
      return {
        simplifiedContent: contentStr,
        videoSegments: [],
        slides: []
      };
    }
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate adapted content');
  }
};

export const generateADHDWords = async (text) => {
  const prompt = `Extract exactly 10 key educational words from the following text that a student should learn to pronounce. The words should be relevant to the topic.
  Text: ${text}
  Return ONLY a JSON object: { "words": ["word1", "word2", ...] }`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    return { words: ["Education", "Learning", "Knowledge", "Science", "History"] };
  }
};

export const generateADHDSentences = async (text) => {
  const prompt = `Create exactly 8 very short, punchy, and engaging sentences (max 5-7 words each) based on the following text. These are for a student with ADHD to read aloud.
  Text: ${text}
  Return ONLY a JSON object: { "sentences": ["sentence1", "sentence2", ...] }`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    return { sentences: ["Learning is super fun!", "Let's explore the world.", "You are doing great!"] };
  }
};
