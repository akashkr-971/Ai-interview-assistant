import { NextRequest, NextResponse } from 'next/server';
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabaseClient";

interface Feedback {
  overallScore: number;
  overallRating: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  answerAnalysis: Array<any>;
  recommendations: string[];
  technicalCompetency: { score: number; assessment: string; };
  communicationSkills: { score: number; assessment: string; };
  problemSolvingApproach: { score: number; assessment: string; };
}

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const rawBody = await request.text();
    console.log('Received raw request body:', rawBody);

    // Reconstruct the request object for json() parsing
    const parsedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: rawBody,
    });

    const {
      id,
      interview_id,
      questionsAndAnswers,
      interviewDetails,
      completedAt,
      userId,
      totalTime
    } = await parsedRequest.json();

    if (!questionsAndAnswers || questionsAndAnswers.length === 0 || !interviewDetails) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required data: questionsAndAnswers or interviewDetails' }),
        { status: 400 }
      );
    }

    const feedback = await generateGeminiFeedback({
      interviewDetails,
      questionsAndAnswers,
      totalTime
    });

    if (!feedback) {
      throw new Error('Failed to generate valid feedback from AI model.');
    }

    const savedFeedback = await saveFeedbackToSupabase({
      interview_id,
      userId,
      feedback,
      completedAt,
      totalTime,
      interviewDetails
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        feedback, 
        savedFeedbackId: savedFeedback?.id,
        interviewId: savedFeedback?.interview_id,
        feedbackId: savedFeedback?.id
      }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in generate-feedback API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate feedback', details: error.message || 'Unknown error' }),
      { status: 500 }
    );
  }
}

async function generateGeminiFeedback({ interviewDetails, questionsAndAnswers, totalTime }: { interviewDetails: any, questionsAndAnswers: any[], totalTime: number }): Promise<Feedback | null> {
  try {
    const prompt = createEvaluationPrompt(interviewDetails, questionsAndAnswers, totalTime);

    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: prompt,
    });

    if (!text) {
      console.error('Gemini API returned no text.');
      return null;
    }

    return parseGeminiFeedback(text);
  } catch (error) {
    console.error('Error calling Gemini API or parsing feedback:', error);
    throw error;
  }
}

function createEvaluationPrompt(interviewDetails: any, questionsAndAnswers: any[], totalTime: number): string {
  const timeInMinutes = Math.round(totalTime / 60);

  return `You are an expert interviewer evaluating a ${interviewDetails.level} ${interviewDetails.role} for ${interviewDetails.company}.

INTERVIEW CONTEXT:
- Type: ${interviewDetails.type}
- Stack: ${interviewDetails.techstack?.join(', ')}
- Duration: ${timeInMinutes} minutes
- Questions: ${questionsAndAnswers.length}

RESPONSES:
${questionsAndAnswers.map((qa, index) => `Q${index + 1}: ${qa.question}\nA${index + 1}: ${qa.answer || 'No answer provided'}`).join('\n')}

Provide feedback in JSON format. Ensure the JSON is valid and complete, enclosed within a single JSON object.
{
  "overallScore": <1-100>,
  "overallRating": "<rating, e.g., 'Strong Hire', 'Hire', 'Lean Hire', 'No Hire'>",
  "strengths": ["<strength 1>", "<strength 2>", "..."],
  "areasForImprovement": ["<area 1>", "<area 2>", "..."],
  "detailedFeedback": "<A comprehensive paragraph summarizing the interview performance, highlighting key observations and overall impression.>",
  "answerAnalysis": [
    {
      "question": "<Question 1 text>",
      "answer": "<Candidate's answer 1 text>",
      "analysis": "<Detailed analysis of this specific answer, including accuracy, depth, and completeness.>",
      "score": <1-10>
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "..."],
  "technicalCompetency": {"score": <1-10>, "assessment": "<Assessment of technical skills based on answers.>"},
  "communicationSkills": {"score": <1-10>, "assessment": "<Assessment of clarity, conciseness, and responsiveness.>"},
  "problemSolvingApproach": {"score": <1-10>, "assessment": "<Assessment of logical thinking, approach to complex problems, and ability to break down issues.>"}
}`;
}

function parseGeminiFeedback(generatedText: string): Feedback {
  try {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    if (jsonMatch && jsonMatch[0]) {
      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    }
    throw new Error('No valid JSON object found in generated text.');
  } catch (error) {
    console.error('Error parsing Gemini feedback JSON:', error);
    throw new Error(`Failed to parse Gemini feedback: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function saveFeedbackToSupabase({ 
  interview_id, 
  userId, 
  feedback, 
  completedAt, 
  totalTime,
  interviewDetails 
}: {
  interview_id: string;
  userId: string;
  feedback: Feedback;
  completedAt: string;
  totalTime: number;
  interviewDetails: any;
}): Promise<{ id: string; interview_id: string } | null> {
  try {
    const { data: interviewData, error: fetchError } = await supabase
      .from('interviews')
      .select('attendees')
      .eq('id', interview_id)
      .single();

    if (fetchError) {
      console.error('Error fetching interview:', fetchError);
      throw new Error(`Failed to fetch interview: ${fetchError.message}`);
    }

    const currentAttendees = interviewData?.attendees || [];
    const updatedAttendees = currentAttendees.includes(userId) 
      ? currentAttendees 
      : [...currentAttendees, userId];

    const { error: updateError } = await supabase
      .from('interviews')
      .update({ attendees: updatedAttendees })
      .eq('id', interview_id);

    if (updateError) {
      console.error('Error updating interview attendees:', updateError);
      throw new Error(`Failed to update attendees: ${updateError.message}`);
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        interview_id: interview_id,
        user_id: userId,
        feedback: feedback,
        completed_at: completedAt,
        total_time: totalTime,
        interview_details: interviewDetails,
        created_at: new Date().toISOString()
      })
      .select('id, interview_id')
      .single();

    if (error) {
      console.error('Error saving feedback to Supabase:', error);
      throw new Error(`Failed to save feedback: ${error.message}`);
    }

    console.log('Feedback saved successfully:', data);
    return data;

  } catch (error) {
    console.error('Error in saveFeedbackToSupabase:', error);
    throw error;
  }
}