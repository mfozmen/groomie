# Examples

Gold-standard reference output that calibrates Groomie's style, granularity, and tone.
When these examples conflict with the breakdown guide, **the examples win.** They are
drawn from a well-groomed backlog (the "SAP" reference project) and grow as the user
adds more. If a section below is still empty, fall back to the breakdown guide's shape
for that level.

## Epic

A good epic is bounded, closeable in a defined timeframe, and its scope is obvious from
the title alone. Body is exactly two lines — `Description` + `Business Value`, no
acceptance criteria (stories carry those).

```markdown
# Epic: Traditional Authentication

**Description:** Implement email/password-based authentication system.

**Business Value:** Provide secure basic authentication method for users who prefer
traditional login.
```

```markdown
# Epic: SSO Integration

**Description:** Implement Single Sign-On functionality supporting major identity providers.

**Business Value:** Simplify the login process and increase user adoption.
```

Both titles pass the "is it bounded?" test — you can tell what's in scope and when it's
done just by reading them. Contrast with an un-scoped umbrella like "Authentication",
which never closes.

## User stories

The title carries the full user-story sentence (within Jira's summary length). Note this
example describes **only behavior and needs** — nothing about REST APIs, screens, or
widgets. Body: a short description, then Acceptance Criteria, then concrete Test Cases —
both required.

```markdown
# Story: As a user, I want to create an account using email and password so that I can have my own personal access to the platform

Lets new users create an account with email and password, including email verification
and clear success/error feedback. (Link the PRD / business-analysis pages when they exist.)

**Acceptance Criteria**
- Valid email verification process
- Password strength requirements enforced
- Account verification flow
- Success/error notifications

**Test Cases**
- Valid email + strong password → account created, verification email sent
- Weak password → rejected with a strength hint
- Duplicate email → clear "already registered" error
- Clicking the verification link → account marked as verified
```

## Technical tasks

<!-- Added next: real task examples, each blocking its story. -->
