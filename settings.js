/* =====================================================================
   SCHOOL SETTINGS — shared by every kiosk
   Change these here (on GitHub, click the pencil icon to edit), and every
   kiosk uses them the next time it loads. No student information here.
   ===================================================================== */

window.SCHOOL_SETTINGS = {

  // TOP ROW of reason buttons: places that might give a student a pass.
  // Picking one of these asks "Did they give you a pass?" (I have a pass / No pass).
  reasonsThatAskAboutPass: [
    "Office",
    "Nurse",
    "Counselor",
    "Another teacher"
  ],

  // BOTTOM ROW of reason buttons: no pass question, just "I'm late".
  // Keep "Other" last if you use it.
  otherReasons: [
    "Bus",
    "Bathroom",
    "Locker",
    "Other"
  ],

  // true  = students must choose a reason before they can check in
  // false = the reason is optional
  requireReason: true,

  // true = choosing "Other" shows a small box to type a few words (optional)
  otherAsksForDetails: true
};
