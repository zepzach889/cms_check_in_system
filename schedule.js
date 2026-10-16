/* =====================================================================
   SCHOOL BELL SCHEDULE
   Every kiosk reads this file. Change it here (on GitHub, click the
   pencil icon to edit), and every kiosk uses the new times the next
   time it loads. No student information goes in this file.

   Times can be written like "8:20 AM" or "1:41 PM".
   "grade" is only needed when a period has different times for
   different grades (like Period 4). Use "6" or "7-8".
   ===================================================================== */

window.BELL_SCHEDULE = {

  // ---- The schedules ------------------------------------------------
  schedules: {

    regular: {
      name: "Regular Day",
      periods: [
        { period: "1", start: "8:20 AM",  end: "9:09 AM" },
        { period: "2", start: "9:13 AM",  end: "9:57 AM" },
        // Break 9:57 – 10:05
        { period: "3", start: "10:09 AM", end: "10:53 AM" },
        // Lunch (6th) 10:53 – 11:25
        { period: "4", grade: "7-8", start: "10:57 AM", end: "11:29 AM" },
        { period: "4", grade: "6",   start: "11:29 AM", end: "12:01 PM" },
        // Lunch (7th/8th) 11:29 – 12:01
        { period: "5", start: "12:05 PM", end: "12:49 PM" },
        { period: "6", start: "12:53 PM", end: "1:37 PM" },
        { period: "7", start: "1:41 PM",  end: "2:25 PM" },
        { period: "8", start: "2:29 PM",  end: "3:20 PM" }
      ]
    },

    early: {
      name: "Early Release",
      periods: [
        { period: "1", start: "8:20 AM",  end: "8:55 AM" },
        { period: "2", start: "8:59 AM",  end: "9:30 AM" },
        // Break 9:30 – 9:38
        { period: "3", start: "9:42 AM",  end: "10:14 AM" },
        { period: "5", start: "10:18 AM", end: "10:50 AM" },   // Period 5 comes before Period 4 on Wednesdays
        // Lunch (6th) 10:50 – 11:22
        { period: "4", grade: "7-8", start: "10:54 AM", end: "11:26 AM" },
        { period: "4", grade: "6",   start: "11:26 AM", end: "11:58 AM" },
        // Lunch (7th/8th) 11:26 – 11:58
        { period: "6", start: "12:02 PM", end: "12:34 PM" },
        { period: "7", start: "12:38 PM", end: "1:10 PM" },
        { period: "8", start: "1:14 PM",  end: "1:50 PM" }
      ]
    }

    // To add another schedule (for example an assembly day), copy one of
    // the blocks above, give it a new short key like  assembly: { ... }
    // and put a comma after the block before it.
  },

  // ---- Which schedule each weekday uses ------------------------------
  // Leave a day out (like Saturday) for no school.
  weekdays: {
    monday:    "regular",
    tuesday:   "regular",
    wednesday: "early",
    thursday:  "regular",
    friday:    "regular"
  },

  // ---- Special days ---------------------------------------------------
  // Dates that don't follow the weekday rule. Write the date as
  // "YYYY-MM-DD". Use "none" for days with no school.
  // Example:  "2026-11-25": "early",
  specialDays: {
  }
};
