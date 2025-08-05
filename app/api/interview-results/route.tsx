import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {interviewId, score, feedback, strengths, weaknesses } = body;

    const { error } = await supabase.from('interview_results').insert([
      {
        booking_id: interviewId,
        score,
        feedback,
        strengths,
        weaknesses,
      },
    ]);

    const {error: bookingError} = await supabase
      .from('bookings')
      .update({ status: 'Completed' })
      .eq('id', interviewId);
    if (bookingError) {
      console.error('Booking update failed:', bookingError);
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }

    if (error) {
      console.error('Insert failed:', error);
      return new Response(JSON.stringify({ success: false }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('[COMPLETE_BOOKING_ERROR]', err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
