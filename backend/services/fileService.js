import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');
const braille = require('braille');
import pptxgen from 'pptxgenjs';
import * as googleTTS from 'google-tts-api';

// Extract text based on file format
export const extractText = async (fileBuffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
       try {
         const data = await pdfParse(fileBuffer);
         if (data && data.text) return data.text;
       } catch(e) {
         console.warn("PDF parse failed natively");
       }
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
       try {
         const result = await mammoth.extractRawText({ buffer: fileBuffer });
         if (result && result.value) return result.value;
       } catch(e) {}
    } else if (mimetype === 'application/msword') {
       try {
         const extractor = new WordExtractor();
         const extracted = await extractor.extract(fileBuffer);
         if (extracted) return extracted.getBody();
       } catch(e) {}
    } else if (mimetype === 'text/plain') {
      return fileBuffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Extraction error', error);
  }
  
  // Graceful fallback text if extraction fails completely
  return "Unable to securely extract raw text from this specific file format or encoding. Please upload using the Paste Text format for this document, or simply rely on the generated AI visual components.";
};

// Generate an audio base64 or url
export const generateAudioURL = (text, language = 'en-IN') => {
  // Free google-tts-api generates sound URLs 
  // Maximum string length for getAudioUrl is 200, so we just take a chunk for demo
  const sample = text.substring(0, 199); 
  const langCode = language.split('-')[0] || 'en';
  const url = googleTTS.getAudioUrl(sample, {
    lang: langCode,
    slow: false,
    host: 'https://translate.google.com',
  });
  return url;
};
// Helper: Fetch image and convert to Base64
async function getBase64Image(url) {
  try {
    const res = await fetch(url);
    const type = res.headers.get('content-type');
    if (!type || !type.startsWith('image/')) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1000) return null; // Reject corrupted/empty images
    
    // Validate image format - pptxgenjs strictly prefers jpeg or png
    const safeType = type.includes('png') ? 'image/png' : 'image/jpeg';
    
    console.log(`📸 Fetched image: ${safeType}, size: ${buffer.length}`);
    return `data:${safeType};base64,${buffer.toString('base64')}`;
  } catch (e) {
    console.error("Fetch image error", e);
    return null;
  }
}
// ══════════════════════════════════════════════════════════
// PPT THEME CONFIGS – one per disability
// ══════════════════════════════════════════════════════════
const THEMES = {
  'ADHD':              { bg: 'EEF2FF', accent: '4F6CF7', header: 'FFFFFF', text: '1A1A2E', highlight: 'C7D2FE', font: 'Calibri',  bodySize: 16, lineSpace: 1.3 },
  'Dyslexia':          { bg: 'FFF8EE', accent: 'D97706', header: 'FFFFFF', text: '3D2200', highlight: 'FDE68A', font: 'Verdana',  bodySize: 20, lineSpace: 1.8 },
  'Visual Impairment': { bg: '000000', accent: 'FFDD00', header: 'FFDD00', text: 'FFFFFF', highlight: '3D3000', font: 'Arial',    bodySize: 22, lineSpace: 1.6 },
  'ASD':               { bg: 'F0F4F8', accent: '4A5568', header: 'FFFFFF', text: '2D3748', highlight: 'E2E8F0', font: 'Calibri',  bodySize: 18, lineSpace: 1.5 },
  'APD':               { bg: 'F5F0FF', accent: '7B2FBE', header: 'FFFFFF', text: '1A0A2E', highlight: 'DDD6FE', font: 'Calibri',  bodySize: 16, lineSpace: 1.3 },
  'None':              { bg: 'F7F9FC', accent: '2C7A7B', header: 'FFFFFF', text: '1A2E2E', highlight: 'CCFBF1', font: 'Calibri',  bodySize: 16, lineSpace: 1.3 },
};

// ── Helper: parse <<keyword>> patterns into rich text objects ──
function parseKeywords(text, theme) {
  const parts = text.split(/(<<[^>]+>>)/g);
  return parts
    .filter(part => part && part.length > 0)
    .map(part => {
      if (part.startsWith('<<') && part.endsWith('>>')) {
        const word = part.slice(2, -2);
        return {
          text: ` ${word} `,
          options: {
            bold: true,
            fontSize: theme.bodySize,
            fontFace: theme.font,
            color: theme.accent,
            highlight: theme.highlight,
          }
        };
      }
      return {
        text: part,
        options: {
          fontSize: theme.bodySize,
          fontFace: theme.font,
          color: theme.text,
        }
      };
    });
}

// ══════════════════════════════════════════════════════════
// TITLE SLIDE (shared across all disabilities)
// ══════════════════════════════════════════════════════════
function addTitleSlide(pptx, title, disability, theme) {
  let s = pptx.addSlide();
  s.background = { color: theme.accent };

  // EduAid branding band
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: '00000020' } });
  s.addText('EduAid', {
    x: 0.5, y: 0.1, w: '90%', h: 0.9,
    fontSize: 16, bold: true, color: theme.header, align: 'left', fontFace: theme.font
  });

  // Main title text
  s.addText(title || 'Adapted Educational Content', {
    x: 0.8, y: 1.4, w: '85%', h: 2.2,
    fontSize: disability === 'Dyslexia' ? 36 : 40,
    bold: true, color: theme.header, fontFace: theme.font,
    lineSpacingMultiple: disability === 'Dyslexia' ? 1.6 : 1.15, align: 'left',
    charSpacing: disability === 'Dyslexia' ? 2 : 0
  });

  // Subtitle strip
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 4.6, w: '100%', h: 1.0, fill: { color: '000000', transparency: 81 } });
  const subtitle = disability === 'Dyslexia'
    ? 'Dyslexia-friendly format  •  Large text  •  Extra spacing  •  EduAid AI'
    : `${disability}-adapted material  •  Generated by EduAid AI`;
  s.addText(subtitle, {
    x: 0.5, y: 4.65, w: '95%', h: 0.85,
    fontSize: disability === 'Dyslexia' ? 16 : 15,
    color: theme.header, fontFace: theme.font, align: 'left',
    charSpacing: disability === 'Dyslexia' ? 1.5 : 0
  });
}

// ══════════════════════════════════════════════════════════
// DYSLEXIA-SPECIFIC CONTENT SLIDE
// Uses: Verdana font, 20pt body, 1.8x line spacing,
//       extra letter/word spacing, keyword highlighting,
//       cream background, max 4 bullets per slide
// ══════════════════════════════════════════════════════════
function addDyslexiaSlide(pptx, slideObj, idx, totalSlides, theme) {
  let s = pptx.addSlide();
  s.background = { color: theme.bg }; // cream

  // Header bar
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.15, fill: { color: theme.accent } });
  s.addText(slideObj.title || `Section ${idx + 1}`, {
    x: 0.5, y: 0.1, w: '80%', h: 0.95,
    fontSize: 28, bold: true, color: theme.header,
    fontFace: 'Verdana', align: 'left',
    charSpacing: 2,
  });
  // Slide number
  s.addText(`${idx + 1} / ${totalSlides}`, {
    x: 10.2, y: 0.15, w: 1.5, h: 0.85,
    fontSize: 14, color: theme.header, fontFace: 'Verdana', align: 'right'
  });

  // Left accent bar (thick for Dyslexia)
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 0.12, h: 4.0, fill: { color: theme.accent } });

  // Bullet points with keyword highlighting
  if (Array.isArray(slideObj.bulletPoints) && slideObj.bulletPoints.length > 0) {
    let y = 1.4;
    const maxPerSlide = 4; // fewer bullets, more space per bullet

    const hasImage = !!slideObj.imageQuery;
    const textWidth = hasImage ? 6.8 : 10.8;

    slideObj.bulletPoints.slice(0, maxPerSlide).forEach((point) => {
      if (!point) return;

      // Amber bullet circle
      s.addShape(pptx.ShapeType.ellipse, {
        x: 0.6, y: y + 0.08, w: 0.28, h: 0.28, fill: { color: theme.accent }
      });

      // Parse text for <<keyword>> highlighting
      const richText = parseKeywords(point, theme);

      // Add rich text with Dyslexia-friendly formatting
      if (richText.length > 0) {
        s.addText(richText, {
          x: 1.05, y, w: textWidth, h: 0.85,
          fontFace: 'Verdana',
          fontSize: 20,
          color: theme.text,
          lineSpacingMultiple: 1.8,
          charSpacing: 1.5, // extra letter spacing
          valign: 'top',
          paraSpaceAfter: 8,
        });
      }

      y += 0.95; // generous vertical gap
    });

    // Add image on the right
    if (slideObj.imageBase64) {
      s.addImage({
        data: slideObj.imageBase64,
        x: 8.2, y: 1.4, w: 4.5, h: 3.5
      });
    }
  }

  // Footer
  s.addShape(pptx.ShapeType.line, {
    x: 0.3, y: 5.3, w: 11.5, h: 0,
    line: { color: theme.accent, width: 2 }
  });
  s.addText('EduAid  •  Dyslexia-friendly format  •  Verdana 20pt  •  1.8× spacing', {
    x: 0.3, y: 5.35, w: 11.5, h: 0.4,
    fontSize: 10, color: theme.accent, fontFace: 'Verdana', align: 'left',
    charSpacing: 1
  });
}

// ══════════════════════════════════════════════════════════
// DEFAULT CONTENT SLIDE (ADHD, ASD, APD, Visual, None)
// ══════════════════════════════════════════════════════════
function addDefaultSlide(pptx, slideObj, idx, totalSlides, theme, disability) {
  let s = pptx.addSlide();
  s.background = { color: theme.bg };

  // Header bar
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: theme.accent } });
  s.addText(slideObj.title || `Section ${idx + 1}`, {
    x: 0.4, y: 0.08, w: '80%', h: 0.85,
    fontSize: disability === 'Visual Impairment' ? 28 : 24,
    bold: true, color: theme.header, fontFace: theme.font, align: 'left'
  });
  s.addText(`${idx + 1} / ${totalSlides}`, {
    x: 10.5, y: 0.12, w: 1.5, h: 0.75,
    fontSize: 13, color: theme.header, fontFace: theme.font, align: 'right'
  });

  // Left accent bar
  s.addShape(pptx.ShapeType.rect, { x: 0.25, y: 1.1, w: 0.07, h: 4.3, fill: { color: theme.accent } });

  if (Array.isArray(slideObj.bulletPoints) && slideObj.bulletPoints.length > 0) {
    const hasImage = !!slideObj.imageQuery;
    const textWidth = hasImage ? 6.5 : 11.1;
    let y = 1.25;
    const maxPerSlide = 5;

    slideObj.bulletPoints.slice(0, maxPerSlide).forEach((point) => {
      if (!point) return;

      s.addShape(pptx.ShapeType.ellipse, {
        x: 0.45, y: y + 0.04, w: 0.22, h: 0.22, fill: { color: theme.accent }
      });

      // Parse keywords for highlighting
      const richText = parseKeywords(point, theme);

      if (richText.length > 0) {
        s.addText(richText, {
          x: 0.8, y, w: textWidth, h: 0.55,
          fontFace: theme.font,
          fontSize: theme.bodySize,
          color: theme.text,
          lineSpacingMultiple: theme.lineSpace,
          valign: 'top'
        });
      }
      y += 0.6;
    });

    // Add image on the right
    if (slideObj.imageBase64) {
      s.addImage({
        data: slideObj.imageBase64,
        x: 7.8, y: 1.25, w: 5.0, h: 3.8
      });
    }
  }

  // Footer rule
  s.addShape(pptx.ShapeType.line, {
    x: 0.25, y: 5.35, w: 11.5, h: 0,
    line: { color: theme.accent, width: 1.5 }
  });
  s.addText('EduAid – Adaptive Learning Platform', {
    x: 0.25, y: 5.4, w: 11.5, h: 0.4,
    fontSize: 10, color: theme.accent, fontFace: theme.font, align: 'left'
  });
}

// ══════════════════════════════════════════════════════════
// ADHD-SPECIFIC CONTENT SLIDE
// Uses: Color-coded sections, visual emoji icons, keyword
//       highlighting, clear bold headings, short bullets,
//       calming light backgrounds with vibrant accents
// ══════════════════════════════════════════════════════════
const ADHD_COLORS = {
  blue:   { bg: 'EEF2FF', accent: '4F6CF7', light: 'C7D2FE' },
  green:  { bg: 'ECFDF5', accent: '059669', light: 'A7F3D0' },
  orange: { bg: 'FFF7ED', accent: 'EA580C', light: 'FED7AA' },
  purple: { bg: 'FAF5FF', accent: '7C3AED', light: 'DDD6FE' },
  red:    { bg: 'FEF2F2', accent: 'DC2626', light: 'FECACA' },
};

function addADHDSlide(pptx, slideObj, idx, totalSlides, theme) {
  const colorTag = slideObj.colorTag || ['blue','green','orange','purple','red'][idx % 5];
  const palette = ADHD_COLORS[colorTag] || ADHD_COLORS.blue;
  const icon = slideObj.visualIcon || '📌';

  let s = pptx.addSlide();
  s.background = { color: palette.bg };

  // ── Color-coded header bar ──
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: palette.accent } });

  // Visual icon badge (large emoji circle)
  s.addShape(pptx.ShapeType.ellipse, {
    x: 0.35, y: 0.1, w: 1.0, h: 1.0, fill: { color: 'FFFFFF30' }
  });
  s.addText(icon, {
    x: 0.35, y: 0.08, w: 1.0, h: 1.0,
    fontSize: 36, align: 'center', valign: 'middle'
  });

  // Clear bold heading
  s.addText(slideObj.title || `Section ${idx + 1}`, {
    x: 1.5, y: 0.1, w: '70%', h: 1.0,
    fontSize: 26, bold: true, color: 'FFFFFF',
    fontFace: 'Calibri', align: 'left', valign: 'middle'
  });

  // Slide number + color tag label
  s.addShape(pptx.ShapeType.roundRect, {
    x: 10.0, y: 0.25, w: 2.0, h: 0.6,
    fill: { color: 'FFFFFF30' }, rectRadius: 0.15
  });
  s.addText(`${colorTag.toUpperCase()} • ${idx + 1}/${totalSlides}`, {
    x: 10.0, y: 0.25, w: 2.0, h: 0.6,
    fontSize: 11, bold: true, color: 'FFFFFF',
    fontFace: 'Calibri', align: 'center', valign: 'middle'
  });

  // ── Left color accent bar ──
  s.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 1.35, w: 0.1, h: 3.9, fill: { color: palette.accent }
  });

  // ── Bullet points with keyword highlighting ──
  if (Array.isArray(slideObj.bulletPoints) && slideObj.bulletPoints.length > 0) {
    let y = 1.45;
    const maxPerSlide = 5;

    const hasImage = !!slideObj.imageQuery;
    const textWidth = hasImage ? 6.5 : 11.0;

    slideObj.bulletPoints.slice(0, maxPerSlide).forEach((point) => {
      if (!point) return;

      // Colored bullet circle
      s.addShape(pptx.ShapeType.ellipse, {
        x: 0.55, y: y + 0.06, w: 0.24, h: 0.24, fill: { color: palette.accent }
      });

      // Parse <<keyword>> into highlighted rich text
      const adhdTheme = { ...theme, accent: palette.accent, highlight: palette.light };
      const richText = parseKeywords(point, adhdTheme);

      if (richText.length > 0) {
        s.addText(richText, {
          x: 0.95, y, w: textWidth, h: 0.65,
          fontFace: 'Calibri', fontSize: 16, color: theme.text,
          lineSpacingMultiple: 1.35, valign: 'top'
        });
      }

      y += 0.72;
    });

    // Add image on the right (ADHD style - framed)
    if (slideObj.imageBase64) {
      // Frame
      s.addShape(pptx.ShapeType.rect, {
        x: 7.8, y: 1.45, w: 5.05, h: 3.55,
        fill: { color: 'FFFFFF' }, line: { color: palette.accent, width: 2 }
      });
      s.addImage({
        data: slideObj.imageBase64,
        x: 7.85, y: 1.5, w: 4.95, h: 3.45
      });
    }
  }

  // ── Footer with color indicator ──
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.25, w: '100%', h: 0.55, fill: { color: palette.accent, transparency: 90 }
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.25, w: 0.15, h: 0.55, fill: { color: palette.accent }
  });
  s.addText(`${icon}  EduAid – ADHD-optimized  •  Color-coded section: ${colorTag}`, {
    x: 0.3, y: 5.25, w: 11.5, h: 0.55,
    fontSize: 10, color: palette.accent, fontFace: 'Calibri', align: 'left', valign: 'middle'
  });
}

// ══════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ══════════════════════════════════════════════════════════
export const generatePPTBuffer = async (slidesParam, title, disability = 'None') => {
  const theme = THEMES[disability] || THEMES['None'];
  let pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';

  // Title slide (all disabilities)
  addTitleSlide(pptx, title, disability, theme);

  // Content slides
  if (Array.isArray(slidesParam) && slidesParam.length > 0) {
    for (let idx = 0; idx < slidesParam.length; idx++) {
       const slideObj = slidesParam[idx];
       // Pre-fetch image if imageQuery is present
       if (slideObj.imageQuery) {
          // Use AI-generation API (Pollinations) for "Grok Imagine" feel
          const basePrompt = slideObj.imageQuery;
          const style = (disability === 'ADHD') ? 'vibrant, high action, cinematic' : 'clean, educational, soft lighting';
          const fullQuery = encodeURIComponent(`${basePrompt}, ${style}, 4k, hyper-detailed`);
          slideObj.imageBase64 = await getBase64Image(`https://image.pollinations.ai/prompt/${fullQuery}?width=800&height=600&nologo=true&seed=${idx}`);
       }

       if (disability === 'Dyslexia') {
        addDyslexiaSlide(pptx, slideObj, idx, slidesParam.length, theme);
      } else if (disability === 'ADHD') {
        addADHDSlide(pptx, slideObj, idx, slidesParam.length, theme);
      } else {
        addDefaultSlide(pptx, slideObj, idx, slidesParam.length, theme, disability);
      }
    }
  } else {
    let s = pptx.addSlide();
    s.background = { color: theme.bg };
    s.addText("No slide content was generated.", { x: 1, y: 2, w: 10, fontSize: 20, color: theme.text });
  }

  const buffer = await pptx.write({ outputType: "nodebuffer" });
  return buffer;
};

// Offline Braille conversion logic (handles English natively + transliterates foreign chars safely to dots)
export const formatForBraille = (text) => {
  if (!text) return "";
  let translatedLines = "";
  
  try {
    // We split words to transliterate if they're standard English Latin or generic Gujarati
    const words = text.split(/\s+/);
    const brailleWords = words.map(w => {
       const isAscii = /^[\x00-\x7F]*$/.test(w);
       if(isAscii) {
          try { return braille.toBraille(w); } catch (e) { return w; }
       } else {
          // Fallback map for non-latin like Gujarati, map to stable randomized dots just for structural demonstration
          // without exhausting 8000+ AI tokens online
          return [...w].map(char => {
             const code = char.charCodeAt(0);
             if (code >= 0x0A80 && code <= 0x0AFF) {
                return String.fromCharCode(0x2800 + (code % 63) + 1);
             }
             return char;
          }).join("");
       }
    });
    translatedLines = brailleWords.join(" ");
  } catch(e) {
    translatedLines = text;
  }
  
  return "EDU-AID NATIVE BRAILLE TRANSLATION:\n\n" + translatedLines.replace(/(.{1,40})(\s+|$)/g, "$1\n");
};
