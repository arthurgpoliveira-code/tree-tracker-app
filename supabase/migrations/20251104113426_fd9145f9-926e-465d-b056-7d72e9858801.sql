-- Allow anonymous users to create events when submitting surveys
CREATE POLICY "Anonymous users can create events for surveys"
ON public.dim_event
FOR INSERT
TO anon
WITH CHECK (true);