-- Add styles and occasions columns to clothes table
ALTER TABLE clothes
ADD COLUMN IF NOT EXISTS styles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS occasions TEXT[] DEFAULT '{}';

-- Add comment to explain the columns
COMMENT ON COLUMN clothes.styles IS 'Array of style tags for the clothing item';
COMMENT ON COLUMN clothes.occasions IS 'Array of occasion tags for the clothing item'; 