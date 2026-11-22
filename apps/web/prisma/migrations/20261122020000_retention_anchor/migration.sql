-- Anchor pre-existing registrations to the actual meeting date, not migration time.
UPDATE r SET [retentionExpiresAt] = DATEADD(hour, -4, DATEADD(month, 12, DATEADD(hour, 4, m.[startsAt])))
FROM [dbo].[meeting_registrations] r
INNER JOIN [dbo].[introductory_meetings] m ON m.[id] = r.[meetingId];
