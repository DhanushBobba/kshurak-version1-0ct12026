import { supabase } from '../lib/supabase';
import { QuizAnswers } from '@kshurak/types';

export async function saveQuizSubmission(profileId: string, answers: QuizAnswers) {
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      profile_id: profileId,
      who: answers.who,
      length: answers.length,
      texture: answers.texture,
      vibe: answers.vibe,
      maintenance: answers.maintenance,
    })
    .select()
    .single();

  if (error) {
    console.error('Quiz save failed:', error.message);
    throw error;
  }

  return data;
}

export default saveQuizSubmission;
