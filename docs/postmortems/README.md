# Postmortems

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0012](../issue-tracking/issues/SY-0012.md)

Create a postmortem for a production, security, privacy, data-loss, failed
migration, prolonged outage, or repeatedly escaped systemic defect.

Do not create one for a local test failure, a red PR check, or a
single-user operator mistake with no control failure.

File: `docs/postmortems/YYYY-MM-DD-short-title.md`.

Timezone for timestamps: Asia/Kolkata unless the incident span is elsewhere,
in which case name that zone on every line.

Required sections: summary/impact, detection, timeline with time zone,
response, root cause and contributing conditions, safeguards that failed or
were missing, what worked, recovery/data reconciliation, security/privacy
notification assessment, corrective issues with owners and dates, lessons,
prevention/detection guard updates.

Use blameless language while naming control failures precisely. Never paste
credentials or unnecessary personal data. Restrict sensitive detail.

Template: [template.md](template.md). Qualifying incidents and the
release/rollback procedure are [SY-0151](../issue-tracking/issues/SY-0151.md)
/ skill `manage-release-incident`. This directory holds the template until
then.
