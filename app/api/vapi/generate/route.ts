import { supabase } from "@/lib/supabaseClient";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
    return Response.json({success:true,data:'THANK YOU'},{status:200})
}

export async function POST(request: Request) {
    try {
      const { type, role, level, techstack, amount, userid } = await request.json();
  
      const normalizePrompt = `
        You are an expert in converting casual, misspelled, or speech-to-text user inputs into clean, proper technical terms or phrases.
        
        Please correct and normalize these values and return a JSON object with keys matching the input fields.
        
        Input:
        {
            "role": "${role}",
            "level": "${level}",
            "type": "${type}",
            "techstack": "${techstack}"
        }
        
        Output (JSON):
        {
            "role": "corrected role here",
            "level": "corrected level here",
            "type": "corrected type here",
            "techstack": "corrected, comma-separated list of tech terms here"
        }
        `;
  
      const { text: normalizedJson } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: normalizePrompt,
      });
  
      let normalizedData;
      try {
        normalizedData = JSON.parse(normalizedJson);
      } catch (parseErr) {
        console.error('Failed to parse normalization response:', parseErr, normalizedJson);
        return Response.json(
          { success: false, error: 'Failed to parse normalized data from AI.' },
          { status: 500 }
        );
      }
  
      const { role: normRole, level: normLevel, type: normType, techstack: normTechstack } = normalizedData;
  
      const questionPrompt = `
        Prepare questions for a job interview.
        The job role is ${normRole}.
        The job experience level is ${normLevel}.
        The tech stack used in the job is: ${normTechstack}.
        The focus between behavioural and technical questions should lean towards: ${normType}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        Thank you! <3
        `;
  
      const { text: questionsText } = await generateText({
        model: google('gemini-2.0-flash-001'),
        prompt: questionPrompt,
      });
  
      let questions;
      try {
        questions = JSON.parse(questionsText);
      } catch (parseErr) {
        console.error('Failed to parse questions JSON:', parseErr, questionsText);
        return Response.json(
          { success: false, error: 'Failed to parse questions data from AI.' },
          { status: 500 }
        );
      }
  
      const interview = {
        role: normRole,
        level: normLevel,
        techstack: normTechstack.split(',').map((t: string) => t.trim()),
        type: normType,
        amount,
        questions,
        created_by:userid,
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