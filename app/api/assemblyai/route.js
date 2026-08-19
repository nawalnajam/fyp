import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // ✅ Parse request body
    let audioBase64 = null;
    try {
      const body = await req.json();
      audioBase64 = body.audioBase64;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, error: "Audio data is required" },
        { status: 400 }
      );
    }

    // ✅ Check API Key
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      console.error("❌ ASSEMBLYAI_API_KEY is not set in .env.local");
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    // ✅ Step 1: Upload audio to AssemblyAI
    let uploadUrl = null;
    try {
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: audioBuffer,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("❌ Upload Error:", uploadRes.status, errorText);
        return NextResponse.json(
          { success: false, error: `Upload failed: ${uploadRes.status}` },
          { status: uploadRes.status }
        );
      }

      const uploadData = await uploadRes.json();
      uploadUrl = uploadData.upload_url;

      if (!uploadUrl) {
        return NextResponse.json(
          { success: false, error: "No upload URL received" },
          { status: 500 }
        );
      }
    } catch (uploadError) {
      console.error("❌ Upload Error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload audio" },
        { status: 500 }
      );
    }

    // ✅ Step 2: Request transcription
    let transcriptId = null;
    try {
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: uploadUrl,
          language_code: "en",
          punctuate: true,
          format_text: true,
        }),
      });

      if (!transcriptRes.ok) {
        const errorText = await transcriptRes.text();
        console.error("❌ Transcript Error:", transcriptRes.status, errorText);
        return NextResponse.json(
          { success: false, error: `Transcription request failed: ${transcriptRes.status}` },
          { status: transcriptRes.status }
        );
      }

      const transcriptData = await transcriptRes.json();
      transcriptId = transcriptData.id;

      if (!transcriptId) {
        return NextResponse.json(
          { success: false, error: "No transcript ID received" },
          { status: 500 }
        );
      }
    } catch (transcriptError) {
      console.error("❌ Transcript Error:", transcriptError);
      return NextResponse.json(
        { success: false, error: "Failed to start transcription" },
        { status: 500 }
      );
    }

    // ✅ Step 3: Poll for results
    let transcriptText = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (!transcriptText && attempts < maxAttempts) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { "Authorization": apiKey }
        });
        
        if (!statusRes.ok) {
          attempts++;
          continue;
        }
        
        const statusData = await statusRes.json();
        
        if (statusData.status === "completed") {
          transcriptText = statusData.text;
          break;
        } else if (statusData.status === "error") {
          console.error("❌ Transcription Error:", statusData.error);
          return NextResponse.json(
            { success: false, error: statusData.error || "Transcription failed" },
            { status: 500 }
          );
        }
        attempts++;
      } catch (pollError) {
        console.error("❌ Poll Error:", pollError);
        attempts++;
      }
    }

    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: "Transcription timeout. Please try again." },
        { status: 408 }
      );
    }

    // ✅ Step 4: Return success
    return NextResponse.json({
      success: true,
      text: transcriptText,
      confidence: 0.8,
    });

  } catch (error) {
    console.error("❌ AssemblyAI API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}