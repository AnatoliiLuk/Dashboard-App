-- Stop if two accounts differ only in email case; they must be merged by hand first.
DO $$
DECLARE dupes TEXT;
BEGIN
  SELECT string_agg(e, ', ') INTO dupes
  FROM (SELECT lower(trim(email)) AS e FROM "users" GROUP BY 1 HAVING count(*) > 1) d;

  IF dupes IS NOT NULL THEN
    RAISE EXCEPTION 'Case-only duplicate emails: %', dupes;
  END IF;
END $$;

UPDATE "users" SET "email" = lower(trim("email")) WHERE "email" <> lower(trim("email"));
