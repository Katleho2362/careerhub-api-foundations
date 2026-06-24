INSERT INTO applicants ("Id", "FullName", "Email")
VALUES ('33333333-0000-0000-0000-000000000099', 'Dev Applicant', 'applicant@dev.local')
ON CONFLICT ("Id") DO NOTHING;
