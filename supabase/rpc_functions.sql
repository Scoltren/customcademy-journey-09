-- Create a function to check course completion status
CREATE OR REPLACE FUNCTION public.get_course_completion_status(user_id_param UUID, course_id_param INTEGER)
RETURNS SETOF public.course_completions AS $$
  SELECT * FROM public.course_completions
  WHERE user_id = user_id_param AND course_id = course_id_param;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a function to insert course completion
CREATE OR REPLACE FUNCTION public.insert_course_completion(user_id_param UUID, course_id_param INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO public.course_completions (user_id, course_id)
  VALUES (user_id_param, course_id_param)
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
