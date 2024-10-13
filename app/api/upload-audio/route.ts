import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("audio") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const filename = `audio_${Date.now()}.wav`;
    const path = join(process.cwd(), "public", "uploads", filename);

    // Write the file
    await writeFile(path, buffer);

    // Here you would typically:
    // 1. Save metadata to a database
    // 2. Trigger your deep fake detection process

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filename,
    });
  } catch (error) {
    console.error("Error in upload-audio route:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
