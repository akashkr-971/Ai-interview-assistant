import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // adjust path as needed

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Interview ID is required' }), {
      status: 400,
    });
  }

  if(id){
    console.log("Interview ID:", id);
  }

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Interview not found' }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
