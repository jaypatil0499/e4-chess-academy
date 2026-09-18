/**
 * Builds the E4 Chess Academy parent onboarding form.
 *
 * Run createOnboardingForm() once from the Apps Script editor. It creates
 * the form, every question, the response spreadsheet, and links the two.
 * Running it again creates a second, separate form — so run it once.
 *
 * The form is for parents whose demo has already converted: it collects
 * what we need before issuing classroom credentials.
 */

var FORM_TITLE = 'E4 Chess Academy — Student Onboarding';
var SHEET_TITLE = 'E4CA Onboarding Responses';

function createOnboardingForm() {
  var form = FormApp.create(FORM_TITLE);

  form.setDescription(
    'Welcome to E4 Chess Academy!\n\n' +
    'Please take two minutes to fill this in. We use these details to place your ' +
    'child with the right coach, schedule classes in your local time, and set up ' +
    'their classroom login.\n\n' +
    'Once we have this, you will receive a confirmation email from ' +
    'e4cacademy@gmail.com with your login credentials and your first class time.\n\n' +
    'Questions marked * are required.');

  // Responses land in a sheet as well as email, so nothing depends on an inbox.
  try {
    var ss = SpreadsheetApp.create(SHEET_TITLE);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  } catch (err) {
    Logger.log('Could not link a spreadsheet: ' + err);
  }

  try { form.setCollectEmail(true); } catch (err) { /* not on all account types */ }
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);

  // ---------------------------------------------------------- required
  form.addTextItem()
      .setTitle('Parent / guardian full name')
      .setRequired(true);

  form.addTextItem()
      .setTitle('Email address')
      .setHelpText('Your classroom login and all class updates go to this address, so please double-check it.')
      .setValidation(FormApp.createTextValidation()
          .setHelpText('Please enter a valid email address.')
          .requireTextIsEmail()
          .build())
      .setRequired(true);

  form.addTextItem()
      .setTitle('Mobile number (with country code)')
      .setHelpText('Example: +91 98765 43210. We use this for WhatsApp class reminders.')
      .setValidation(FormApp.createTextValidation()
          .setHelpText('Please include the country code, for example +91 98765 43210.')
          .requireTextMatchesPattern('^[+]?[0-9 ()\\-]{8,20}$')
          .build())
      .setRequired(true);

  form.addTextItem()
      .setTitle("Student's full name")
      .setHelpText('As you would like it to appear on certificates.')
      .setRequired(true);

  form.addDateItem()
      .setTitle("Student's date of birth")
      .setHelpText('Used to enter your child in the correct age category for tournaments.')
      .setIncludesYear(true)
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('Country')
      .setChoiceValues(['India', 'United Kingdom', 'UAE', 'United States',
                        'Singapore', 'Canada', 'Australia'])
      .showOtherOption(true)
      .setRequired(true);

  // ------------------------------------------------- scheduling (added)
  // An academy teaching across 15+ countries cannot schedule anything
  // without these two, so they earn their place on the form.
  form.addTextItem()
      .setTitle('Which city are you in?')
      .setHelpText('So we schedule classes in your local time rather than ours.');

  form.addCheckboxItem()
      .setTitle('Which days usually work for classes?')
      .setHelpText('Tick everything that could work. More options means a better coach match.')
      .setChoiceValues(['Monday', 'Tuesday', 'Wednesday', 'Thursday',
                        'Friday', 'Saturday', 'Sunday']);

  form.addMultipleChoiceItem()
      .setTitle('Preferred time of day')
      .setChoiceValues(['Morning', 'Afternoon', 'Evening', 'Late evening'])
      .showOtherOption(true);

  // ------------------------------------------------- placement (added)
  form.addMultipleChoiceItem()
      .setTitle("Your child's current chess experience")
      .setHelpText('Be honest rather than generous — it helps us start at the right level.')
      .setChoiceValues(['Complete beginner',
                        'Knows the basic rules',
                        'Has played casually',
                        'Has competed in tournaments']);

  // ------------------------------------------------- optional detail
  form.addTextItem()
      .setTitle("Student's Lichess username (if they have one)")
      .setHelpText('Leave blank if not. We can create one during the first class.');

  form.addTextItem()
      .setTitle("Student's Chess.com username (if they have one)");

  form.addParagraphTextItem()
      .setTitle('What do you hope your child gets out of the classes?')
      .setHelpText('Tournament results, confidence, concentration, or simply enjoying the game — all valid answers.');

  form.addParagraphTextItem()
      .setTitle('Anything you would like us to know about your child?')
      .setHelpText('Learning style, attention span, shyness, a condition we should be aware of, or anything that helps a coach teach them well.');

  form.addMultipleChoiceItem()
      .setTitle('How did you hear about E4 Chess Academy?')
      .setChoiceValues(['Instagram', 'Google search', 'Friend or family referral',
                        'WhatsApp', 'School', 'YouTube'])
      .showOtherOption(true);

  // ------------------------------------------------- consent (added)
  // Required on purpose: a consent record with blanks in it is not a consent
  // record. To make it optional instead, change setRequired(true) to false.
  form.addMultipleChoiceItem()
      .setTitle("May we share your child's achievements on our social media?")
      .setHelpText('We post tournament wins and certificates on Instagram. You can change your answer at any time by emailing us.')
      .setChoiceValues(['Yes, name and photo are fine',
                        'Yes, but first name only and no photo',
                        'No, please keep my child off social media'])
      .setRequired(true);

  form.setConfirmationMessage(
    'Thank you! Your details are with us.\n\n' +
    'You will receive a confirmation email from e4cacademy@gmail.com within 24 hours ' +
    'with your classroom login and your first class time. If it has not arrived, ' +
    'please check your spam folder and mark it "Not spam" so future class updates reach you.\n\n' +
    'Any questions in the meantime: WhatsApp +91 76767 82072.');

  Logger.log('SEND THIS LINK TO PARENTS:\n' + form.getPublishedUrl());
  Logger.log('\nEDIT THE FORM HERE:\n' + form.getEditUrl());
  Logger.log('\nRESPONSES SHEET:\n' + (typeof ss !== 'undefined' ? ss.getUrl() : 'not linked'));
}
