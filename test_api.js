import fetch from 'node-fetch';
import fs from 'fs';

async function testGeneration() {
  console.log("🚀 Testing EduAid API Generation...");
  
  const payload = {
    text: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments. In plants, photosynthesis normally occurs in the leaves. It involves the intake of carbon dioxide and water and the release of oxygen.",
    disability: "ADHD",
    grade: "Grade 6-10",
    formats: "simplified,visual,audio"
  };

  try {
    const res = await fetch("http://localhost:5000/api/content/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("❌ API Error:", err);
        return;
    }

    const data = await res.json();
    console.log("✅ API Success!");
    console.log("- Disability:", data.disabilityProcessed);
    console.log("- Simplified Content (first 100 chars):", data.simplifiedContent.substring(0, 100));
    console.log("- Slides Generated:", data.slides.length);
    console.log("- Assets Received:", Object.keys(data.assets));
    
    if (data.assets.pptBase64) {
        console.log("- PPT Base64 found (Success)");
    }
    
    if (data.slides[0]?.imageQuery) {
        console.log("- First Slide Image Query:", data.slides[0].imageQuery);
    }

    // Save sample response to a file for inspection
    fs.writeFileSync('sample_api_response.json', JSON.stringify(data, null, 2));
    console.log("📝 Sample response saved to sample_api_response.json");

  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
  }
}

testGeneration();
