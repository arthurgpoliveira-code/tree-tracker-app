-- Enable anonymous users to insert survey responses
CREATE POLICY "Anonymous users can submit survey responses"
  ON fct_response FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable anonymous users to create respondent profiles
CREATE POLICY "Anonymous users can create respondent profiles"
  ON dim_respondent FOR INSERT
  TO anon
  WITH CHECK (true);