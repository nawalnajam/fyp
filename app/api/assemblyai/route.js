// /app/api/assemblyai/route.js

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      return NextResponse.json(
        { success: false, error: "No audio provided" },
        { status: 400 }
      );
    }

    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

    if (!ASSEMBLYAI_API_KEY) {
      console.error("❌ ASSEMBLYAI_API_KEY not found");
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    // ✅ STEP 1: Upload audio
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLYAI_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: audioBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return NextResponse.json(
        { success: false, error: "Failed to upload audio: " + errorText },
        { status: 500 }
      );
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;
    console.log("✅ Audio uploaded:", audioUrl);

    // ✅ STEP 2: Create transcription - FIXED confidence threshold
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        "Authorization": ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_models: ["universal-2", "universal-3-5-pro"],
        // ✅ FIX: Lower confidence threshold from 0.5 to 0.1
        language_detection: true,
        language_confidence_threshold: 0.1,  // 🔥 Changed from 0.5 to 0.1
        punctuate: true,
        format_text: true,
        disfluencies: false,
        // ✅ Force language if detection fails - try English and Urdu
        language_code: "en",  // Default to English
        // ✅ Boost car-related keywords
        word_boost: ["toyota", "corolla", "honda", "civic", "city", "suzuki", "alto", "mehran", "cultus", "swift", "kia", "sportage", "hyundai", "tucson", "bmw", "mercedes", "audi", "nissan", "mg", "landcruiser", "fortuner", "prado", "vitz", "passo", "mira", "every", "bolan", "ritz", "grande", "gli", "xli", "vti", "lac", "lakh", "karachi", "lahore", "islamabad"],
        boost_param: "high",
      }),
    });

    const transcriptData = await transcriptResponse.json();
    
    if (transcriptData.error) {
      console.error("❌ Transcript Error:", transcriptData.error);
      return NextResponse.json(
        { success: false, error: transcriptData.error },
        { status: 500 }
      );
    }

    const transcriptId = transcriptData.id;
    console.log("📝 Transcript ID:", transcriptId);

    // ✅ STEP 3: Poll for results
    let result = null;
    let attempts = 0;
    
    while (attempts < 30) {
      attempts++;
      const statusRes = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { "Authorization": ASSEMBLYAI_API_KEY } }
      );
      
      const statusData = await statusRes.json();
      
      if (statusData.status === "completed") {
        result = statusData;
        break;
      } else if (statusData.status === "error") {
        return NextResponse.json(
          { success: false, error: statusData.error },
          { status: 500 }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Transcription timeout" },
        { status: 500 }
      );
    }

    console.log("✅ Transcription complete:", result.text);
    console.log("✅ Detected Language:", result.language_code || "en");

    return NextResponse.json({
      success: true,
      text: result.text,
      language: result.language_code || "en",
      confidence: result.confidence || 0,
    });

  } catch (error) {
    console.error("❌ AssemblyAI Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}