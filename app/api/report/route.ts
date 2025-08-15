import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    let report = formData.get('report') as string;
    const source = formData.get('source') as string;
    const userId = formData.get('id') as string;
    const interview_id = formData.get('interview_id') as string;

    if(interview_id) {
        report = `Interview ID: ${interview_id}\n Complaint : ${report}`;
    }

    await supabase.from('complaint').insert({ 
        user_id: userId, 
        description: report, 
        source: source
    });

    const baseUrl = req.headers.get('origin') || 'http://localhost:3000'; 
    if(source === "create-interview"){
         return NextResponse.redirect(`${baseUrl}/create-interview?report=submitted`);
    }else if(source === "attend-interview"){
        return NextResponse.redirect(`${baseUrl}/attend-interview/${interview_id}?report=submitted`);
     }else if(source === "live-interview"){
         return NextResponse.redirect(`${baseUrl}/live-interview?report=submitted`);
     }

  } catch (error) {
    console.error('❌ Error submitting report:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}
