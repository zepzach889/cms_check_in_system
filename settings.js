/* =====================================================================
   SCHOOL SETTINGS — shared by every kiosk
   Change these here (on GitHub, click the pencil icon to edit), and every
   kiosk uses them the next time it loads. No student information here.
   ===================================================================== */

window.SCHOOL_SETTINGS = {

  // Buttons students choose from when they're late (8 or fewer fit best).
  // Keep "Other" last if you use it.
  tardyReasons: [
    "Bus",
    "Office",
    "Nurse",
    "Counselor",
    "Another teacher",
    "Bathroom",
    "Locker",
    "Other"
  ],

  // true  = students must choose a reason before they can check in
  // false = the reason is optional
  requireReason: true,

  // true  = students finish by tapping "I have a pass" or "No pass"
  // false = students finish with a single "I'm late" button
  askAboutPass: true,

  // true = choosing "Other" shows a small box to type a few words (optional)
  otherAsksForDetails: true
};
