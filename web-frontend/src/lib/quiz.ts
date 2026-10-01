import { supabase } from './supabase';
import { QuizAnswers } from '@kshurak/types';

// Retrieve active profile's latest quiz result
export async function getLatestQuizForProfile(profileId: string) {
  const { data, error } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Persist fresh quiz results
export async function submitQuizAnswers(profileId: string, answers: QuizAnswers) {
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert([
      {
        profile_id: profileId,
        who: answers.who,
        length: answers.length,
        texture: answers.texture,
        vibe: answers.vibe,
        maintenance: answers.maintenance,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
