import { supabase } from "@/lib/supabaseClient";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
    return Response.json({success:true,data:'THANK YOU'},{status:200})
}

// Helper function to extract JSON from AI response
function extractJsonFromText(text: string): any {
  // First, try to parse the text directly
  try {
    return JSON.parse(text);
  } catch {
    // If direct parsing fails, try to extract JSON from the text
    
    // Look for JSON block between ```json and ``` (for arrays)
    const jsonArrayBlockMatch = text.match(/```json\s*(\[[\s\S]*?\])\s*```/);
    if (jsonArrayBlockMatch) {
      try {
        return JSON.parse(jsonArrayBlockMatch[1]);
      } catch {}
    }
    
    // Look for JSON block between ```json and ``` (for objects)
    const jsonBlockMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1]);
      } catch {}
    }
    
    // Look for any JSON array in the text
    const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        return JSON.parse(jsonArrayMatch[0]);
      } catch {}
    }
    
    // Look for any JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    
    // If all else fails, throw an error
    throw new Error('No valid JSON found in response');
  }
}

export async function POST(request: Request) {
    try {
      const { type, role, level, techstack, amount, userid } = await request.json();
      console.log('Received data:', { type, role, level, techstack, amount, userid });
  
      const normalizePrompt = `
        You are an expert in converting casual, misspelled, or speech-to-text user inputs into clean, proper technical terms or phrases.
        
        Please correct and normalize these values and return ONLY a JSON object with keys matching the input fields. Do not include any explanatory text, conversation, or formatting - just the raw JSON object.

        convert the amount into a number if it is a string, and ensure it is a valid integer.if u cant recognize the amount, set it to 5.

        The levels are entery-level, mid-level, and senior-level.

        The types are technical, behavioral, and mixed. select the one that matches closest to the input.

        correct the json format to ensure it is valid and properly formatted.

        Input:
        {
            "role": "${role}",
            "level": "${level}",
            "techstack": "${techstack}",
            "amount": ${amount},
            "type": "${type}"
        }
        Return only this JSON format (no additional text):
        {"role": "corrected role here", "level": "corrected level here", "techstack": "corrected, comma-separated list of tech terms here", "amount": corrected_amount_here}
        `;

      const { text: normalizedJson } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: normalizePrompt,
      });
  
      let normalizedData;
      try {
        normalizedData = extractJsonFromText(normalizedJson);
        console.log('Normalized data:', normalizedData);
      } catch (parseErr) {
        console.error('Failed to parse normalization response:', parseErr);
        console.error('Raw response:', normalizedJson);
        return Response.json(
          { success: false, error: 'Failed to parse normalized data from AI.' },
          { status: 500 }
        );
      }

      const { role: normRole, type: normType, level: normLevel, techstack: normTechstack, amount: normAmount } = normalizedData;
  
      const questionPrompt = `
        You are an AI interviewer. Your task is to generate a realistic and natural-sounding interview flow for a candidate applying for a ${normRole} role.

        Requirements:
        1. **Start with 2-3 introductory questions** to warm up the candidate. These should be casual and ask about their background, interests, or goals.
        2. **Then generate exactly ${normAmount} core technical interview questions**. These must match:
          - Experience level: ${normLevel}
          - Interview type: ${normType}
          - Tech stack: ${normTechstack}
          - Focus: ${normType}
        3. **End with 1-2 wrap-up questions** (e.g., “Do you have any questions for us?” or “Where do you see yourself in the next few years?”)

        🔒 Constraints:
        - Return ONLY a valid JSON array of strings.
        - Each question must be a single line.
        - Escape quotes and apostrophes properly.
        - Do NOT include any extra text, explanation, or formatting.
        - The final array will include ~(${normAmount} + ~3 to 5) total questions.

        ✅ Example:
        [
          "Can you introduce yourself?",
          "What motivated you to pursue a career in software?",
          "How do you manage your learning outside of work?",
          "Explain how Flutter handles widget rendering internally.",
          "What are some performance optimization techniques in Dart?",
          "How do you implement state management using Provider?",
          "Do you have any questions for us?"
        ]
        `;

  
      const { text: questionsText } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: questionPrompt,
      });
  
      let questions;
      try {
        questions = extractJsonFromText(questionsText);
        
        // Ensure questions is an array
        if (!Array.isArray(questions)) {
          throw new Error('Questions response is not an array');
        }
      } catch (parseErr) {
        console.error('Failed to parse questions JSON:', parseErr);
        console.error('Raw response:', questionsText);
        
        try {
          // Look for lines that appear to be questions (contain question words or end with question marks)
          const lines = questionsText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 10) // Filter out short lines
            .filter(line => 
              line.includes('?') || 
              line.toLowerCase().includes('how') || 
              line.toLowerCase().includes('what') || 
              line.toLowerCase().includes('why') || 
              line.toLowerCase().includes('describe') ||
              line.toLowerCase().includes('explain')
            );
          
          if (lines.length >= amount) {
            questions = lines.slice(0, amount).map(line => 
              line.replace(/^["\[\],-\s]+|["\[\],-\s]+$/g, '') // Clean up any formatting
            );
            console.log('Using fallback question extraction:', questions);
          } else {
            throw new Error('Not enough questions found in fallback extraction');
          }
        } catch (fallbackErr) {
          console.error('Failed to extract questions from fallback method:', fallbackErr);
          return Response.json(
            { success: false, error: 'Failed to parse questions data from AI.' },
            { status: 500 }
          );
        }
      }
  
      const interview = {
        role: normRole,
        level: level,
        techstack: normTechstack.split(',').map((t: string) => t.trim()),
        type: normType,
        amount: normAmount,
        questions,
        created_by: userid,
        coverImage: 'Image',
        created_at: new Date().toISOString(),
      };
  
      const { error } = await supabase.from('interviews').insert([interview]);
  
      if (error) {
        console.error('Supabase insert error:', error);
        return Response.json({ success: false, error }, { status: 500 });
      }
  
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Unexpected error in POST handler:', e);
        return Response.json(
            { success: false, error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}