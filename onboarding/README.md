# Parent onboarding form

For leads that have already converted. The parent gets a welcome message
with the form link; the form collects what we need before classroom
credentials are issued.

## Creating the form

Apps Script builds it, so the questions, required flags, validation and
response sheet are all set up the same way every time.

1. Go to **https://script.google.com** and click **New project**
2. Delete the placeholder code, paste in all of `create-onboarding-form.gs`
3. Save (**Cmd+S**)
4. Pick **createOnboardingForm** in the function dropdown, click **Run**
5. Authorise it when asked — it is your own script creating your own form,
   so click **Advanced → Go to … (unsafe) → Allow**
6. Open **View → Logs**. It prints three links: the form link to send to
   parents, the edit link, and the responses spreadsheet.

Run it **once**. Running it again creates a second, separate form.

## What it asks

**Required:** parent name, email, mobile with country code, student name,
student date of birth, country, and social media consent.

**Optional:** city, preferred days and time of day, current chess level,
Lichess and Chess.com usernames, what the parent hopes for, anything about
the child, and how they heard about us.

Three questions were added beyond the original list, each for a reason:

- **City, preferred days, preferred time.** An academy teaching across 15+
  countries cannot schedule a single class without knowing the parent's
  local time.
- **Current chess level.** Decides which course the child starts in, using
  the same wording as the demo booking form on the website.
- **Social media consent.** Student wins get posted on Instagram. Asking
  once, in writing, at onboarding is far better than asking each time — and
  it is why this one is required: a consent record with blanks in it is not
  a consent record. To make it optional, change `setRequired(true)` to
  `setRequired(false)` on the last question.

## After a parent submits

Responses arrive in the linked spreadsheet and by email. The confirmation
screen tells the parent to expect a mail from e4cacademy@gmail.com within
24 hours, so that promise needs keeping.

`welcome-message.md` has the WhatsApp and email templates that carry the
form link.
