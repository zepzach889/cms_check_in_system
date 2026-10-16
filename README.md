# Tardy Sign-In Kiosk — Setup Guide

A free tardy sign-in page for a Chromebook or tablet by the classroom door. Students tap their name and "I'm late." Each check-in goes into a Google Form, and the form's Google Sheet becomes the record for every room.

Synergy stays the official attendance record. This is a convenience log.

---

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The kiosk page |
| `style.css` | Colors and layout (school green, gold, and white) |
| `settings.js` | School-wide settings: the tardy reasons, whether a reason is required, and the pass question |
| `schedule.js` | The school's bell schedule (Regular Day and Wednesday Early Release). Edit this to change times for every kiosk |
| `app.js` | How the kiosk works |
| `sw.js` | Lets the page open even if the internet is down when the device restarts |
| `sample-class-list.csv` | A made-up class list you can use to practice importing |
| `README.md` | This guide |

The page contains **no student names**. Class lists are typed or imported on each device and stay in that device's browser.

---

## Step 1: Make the Google Form (about 10 minutes)

Use the school's Google account (or your own school account for the pilot; see "Moving the form to the office later" below).

1. Go to **forms.google.com** and start a blank form. Name it something like "Tardy Kiosk Log."
2. Add these nine questions **in this order**. Make every one a **Short answer** question, and leave **Required turned off** on all of them.

| # | Question title | What the kiosk fills in |
|---|---|---|
| 1 | `Room` | Room 14 |
| 2 | `Student` | Maya Rivera |
| 3 | `Type` | Tardy, Hall pass out, Back, or Not signed back in |
| 4 | `Reason` | Why they were late (for example "Bathroom" or "Other: forgot binder"), or where they went on a hall pass |
| 5 | `Class` | Period 3 – World History |
| 6 | `Kiosk time` | The time the student actually tapped |
| 7 | `Minutes out` | How long a hall pass lasted (blank for tardies) |
| 8 | `Minutes late` | How many minutes after class started the student tapped (tardies only) |
| 9 | `Pass` | Yes or No: did the late student have a pass |

   **Why no Required questions?** If a required question arrives blank, Google rejects the whole entry, and the kiosk has no way to know. Reason, Minutes out and Minutes late are often blank on purpose.

   **Why Kiosk time?** If the internet is down, a check-in may reach Google later. Google's Timestamp column shows when it *arrived*; Kiosk time shows when the student *tapped*.

3. Open the **Settings** tab › **Responses**:
   - **Collect email addresses:** **Do not collect.** ("Verified" requires a sign-in, which silently blocks the kiosk.)
   - **Limit to 1 response:** off.
4. Open the **Responses** tab and click **Link to Sheets** › **Create a new spreadsheet**. Its columns will be: Timestamp, Room, Student, Type, Reason, Class, Kiosk time, Minutes out, Minutes late, Pass. This Sheet is the shared record.
5. **Publish the form.** New Google Forms start out unpublished and won't accept anything until you click **Publish** (top right). When it asks who can respond, choose **anyone with the link** (see Step 4 for why).

**Get the pre-filled link** (this is how the kiosk learns each question's hidden code):

1. In the form editor, click the **⋮** menu (top right) › **Get pre-filled link**.
2. Type these words in the boxes: `room`, `student`, `type`, `reason`, `class`, `time`, `minutes`, `late`, `pass` (one in each matching box). **Fill in every box** — Google leaves a question out of the link if its box is empty.
3. Click **Get link**, then **Copy link**. Paste it somewhere safe.

This doesn't submit anything. The words are just labels so the kiosk can tell which hidden code belongs to which question.

**Later changes:** renaming questions or changing settings is fine. But if you **delete and re-add a question, or change its type**, Google gives it a new hidden code. Then make a new pre-filled link and paste it into setup again (or into one kiosk, then send out a new setup code).

---

## Step 2: Put the page online with GitHub Pages (free, about 10 minutes)

1. Sign in at **github.com** (or create a free account).
2. Click **+** (top right) › **New repository**. Name it something like `tardy-kiosk`. Choose **Public** (free GitHub Pages needs public; the page has no student data, so that's okay). Click **Create repository**.
3. On the new repository page, click **uploading an existing file**. Drag in **all the files from this folder** (not the folder itself). Click **Commit changes**.
4. Go to **Settings** › **Pages**. Under "Branch," choose **main** and **/ (root)**, then click **Save**.
5. Wait a minute or two, then refresh. GitHub will show your address, something like:
   `https://yourname.github.io/tardy-kiosk/`

That address is your kiosk. Bookmark it.

**Updating later:** upload the changed file to the same repository, and the kiosk picks it up the next time it loads with internet.

---

## Step 3: Set up a kiosk device

1. On the Chromebook or tablet, open your kiosk address.
2. **Create a 4-digit teacher PIN** (you enter it twice). Tap the number pad, or type it on the keyboard: number keys enter digits, Backspace erases one, and Esc cancels. Pick one students won't guess.
3. In **Teacher setup**:
   - **1. Connect your Google Form:** paste the pre-filled link and click **Read link**. Each answer box is listed with a guess at which question it belongs to. Check the guesses, then click **Save form connection**.
   - **2. This room:** type the room name, like `Room 14`. **Type it exactly the same way every time.** The office and teacher reports sort by this name.
   - **3. Class lists:** click **Add a class**, pick the **Period**, and for Period 4 pick the **grade** (6th grade and 7th/8th grade have different Period 4 times). The class name is optional; it says "Period 3" if you leave it blank. Paste the student names (one per line). "Maya Rivera" and "Rivera, Maya" both work, or upload a CSV with First and Last name columns, like `sample-class-list.csv`. Repeat for each class, including Advisory and electives.
     The times come from the school bell schedule, so you never type them. The editor shows the period's times on each schedule so you can check them. For an unusual class that doesn't follow the bells, choose **Custom times** at the bottom of the Period list.
   - **Which class shows on the kiosk:** "Switch automatically by bell schedule" shows the class that's in session (or starting within 5 minutes). Between classes, during break, lunch, your prep period, and before or after school, the kiosk shows a large clock with "No class right now" and the next class, with no names. You can also choose to always show one class.
     Each period can only have one class. Periods that are already used are grayed out in the list. For Period 4, each grade counts separately.
4. Click **Save & back to kiosk**.

To get back into setup, tap or click the small **gear** in the top corner and enter your PIN. Setup locks itself after 5 idle minutes.

---

## Step 4: Send a test, and check the sign-in setting

1. In setup, click **Send a test entry**.
2. Open the Google Sheet. Within a minute, you should see a new row with Student = `TEST`.

**If the test shows up:** you're done. Delete the TEST row whenever you like.

**If the test doesn't show up,** check these in order:

1. **Is the form published?** The Publish button is top right in the form editor.
2. **Collect email addresses** must be **Do not collect**, not "Verified."
3. **Who can respond** (in the Publish settings, or Settings › Responses › "Restrict to users in [your school]") should allow **anyone with the link**. The kiosk sends in the background without signing in, so a school-only form quietly turns it away.
4. **No question is marked Required.**
5. The form says **Accepting responses** on its Responses tab.
6. You're looking at the right Sheet: on the form's Responses tab, click **View in Sheets**.

A handy check: open the form's normal link in an **Incognito window** (Ctrl+Shift+N). If it asks you to sign in, so will the kiosk.

**The trade-off:** with "anyone with the link," someone who found the form's address could submit junk entries. The risk is small, since the address isn't shown anywhere students can see, and junk rows are easy to spot and delete.

---

## Everyday use

- Students tap their name, choose why they're late, and tap **I'm late** (or, for Office, Nurse, Counselor, and Another teacher, **I have a pass** or **No pass**). A green screen confirms the time and resets after 4 seconds. (With hall passes turned on, they tap **I'm late** first.)
- **"Not on the list?"** lets a student type their name. Those rows say "(typed in)" in the Sheet.
- If a student taps their name again within 10 minutes, the kiosk shows "You already checked in" and doesn't send a second row.
- The **status light** in the top bar:
  - **All check-ins sent:** everything has gone to Google.
  - **No internet · 3 saved, will send** (gold): check-ins are saved on the device and retried every 30 seconds until the internet is back. Don't erase the device while this is showing.
  - **Not connected to a form** (red): finish setup step 1.
- **Today on this device** (in setup) lists today's check-ins on that kiosk, marked Sent or Waiting.

**Important:** "Sent" means the device handed the check-in to Google. Google doesn't send a reply back, so the kiosk can't confirm it arrived. The Sheet is always the real record.

---

## Tardy reasons and the pass question

These are set once for the whole school in **`settings.js`**, so every room records the same categories and the office's reports line up. To change them, open `settings.js` on GitHub, click the **pencil icon**, edit, and **Commit changes**.

| Setting | Now | What it does |
|---|---|---|
| `reasonsThatAskAboutPass` | Office, Nurse, Counselor, Another teacher | The **top row** of reason buttons. Picking one asks "Did they give you a pass?" with **I have a pass** / **No pass**. |
| `otherReasons` | Bus, Bathroom, Locker, Other | The **bottom row**. Picking one shows a single **I'm late** button. |
| `requireReason` | `true` | Students must pick a reason. Set to `false` to make it optional. |
| `otherAsksForDetails` | `true` | Choosing **Other** shows a small optional box to type a few words. |

Four buttons per row fit best. To stop asking about passes entirely, move everything into `otherReasons` and leave `reasonsThatAskAboutPass` empty: `[]`.

In the Sheet, Reason shows the button they chose, or "Other: forgot binder" if they typed something. Pass shows Yes or No for top-row reasons, and is blank for bottom-row reasons (the question wasn't asked). If your form doesn't have a Pass question, "(has pass)" is added to the Reason instead, so the answer isn't lost.

"Not on the list?" students also see the reasons screen after typing their name.

---

## The bell schedule

The school's bell times live in **`schedule.js`**, and every kiosk reads them from the website. It already has your two schedules:

- **Regular Day:** Monday, Tuesday, Thursday, Friday
- **Early Release:** Wednesday. Period 5 comes before Period 4 that day, and the kiosk handles that.
- **Period 4 and lunch** are different for 6th grade and 7th/8th grade, which is why Period 4 classes ask for the grade.

**Bells ring one minute early.** The real bells ring 1 minute before the printed times, so `schedule.js` has a setting at the top, `bellOffsetMinutes: -1`, that moves every start and end time 1 minute earlier. The printed times in the file stay the same as the official schedule. The kiosk switches classes, counts Minutes late, and applies hall pass rules from the real bells. If the bells are ever fixed, change `-1` to `0`. (Classes with **Custom times** use exactly the times typed in setup.)

**Changing times for every kiosk:** on GitHub, open `schedule.js`, click the **pencil icon** (Edit), change the times, and click **Commit changes**. Times can be written like `8:20 AM`. Each kiosk uses the new times the next time it loads (restart the browser or refresh the page to make it immediate).

**Special days you know ahead of time** (early release on a different day, no school, a new assembly schedule): in `schedule.js`, add the date under `specialDays`, for example:

```
specialDays: {
  "2026-11-25": "early",
  "2026-12-18": "none"
}
```

To add a new schedule, like an assembly day, copy the `early: { ... }` block, rename it (for example `assembly`), and change its times. The comments in the file explain each step.

**A surprise schedule change today:** in a kiosk's setup, section 2, set **Today's bell schedule** to the one you need. It only affects that device, and it goes back to automatic tomorrow.

On days that aren't the normal weekday schedule, the top bar shows the schedule's name (for example "· Early Release").

---

## How "Minutes late" is figured

When a student taps **I'm late**, the kiosk counts the whole minutes since that class's **start time** on today's bell schedule. A student who taps at 9:21:40 for a class starting at 9:15 is **6** minutes late. The green screen shows it too ("6 minutes late · Bus").

- It's only as accurate as the times in `schedule.js` (or a class's custom times), so double-check them.
- If the kiosk doesn't know which class is in session right now, Minutes late is left blank rather than guessed. That happens with a class that doesn't meet on today's schedule, or "Always show" used outside that class's hours.
- Tapping during the 5 minutes before the bell, or within the first minute, counts as 0.
- Check-ins that wait for the internet keep the minutes figured when the student tapped.

---

## Hall passes

Hall passes are **off** until you turn them on in setup, section **6. Hall passes**.

**What students do**

- **Going out:** tap your name › **Hall pass: going out** › tap where you're going. The green screen says "You're signed out at 10:31."
- **Coming back:** tap your name in the **Out now** strip at the top of the name screen (or in the name grid) › **I'm back**. The screen says how long they were out.
- With hall passes on, the name screen says "Tap your name." and shows three buttons: I'm late, Hall pass: going out, and I'm back. "I'm back" only works for a student who is out.

**Rules you can set** (section 6)

| Setting | Default |
|---|---|
| Students out at once | 1 |
| Passes per student per week (0 = no limit) | 0 |
| Timer turns gold after | 5 minutes |
| Timer turns red after | 10 minutes |
| No passes in the first ___ minutes of class | 10 |
| No passes in the last ___ minutes of class | 10 |
| Show who is out on the kiosk | On (first name + last initial) |
| Beep once when a timer turns red | Off |
| Places students can go | Bathroom, Water fountain, Nurse, Office, Locker, Another teacher |

When a rule blocks a pass, the "going out" button is grayed out and the kiosk says why (for example, "Wait until Jordan T. is back."). For emergencies, like a student who needs the nurse during a blocked time, use a paper pass or your usual process.

**Forgot to sign back in?** The pass closes itself at the end of the class (or after an hour if no class is set) and the Sheet records **Not signed back in**. In setup, **Out right now** lists everyone out with a **Mark back** button; those rows say "(marked back by teacher)."

**What goes in the Sheet**

| Type | Reason | Minutes out |
|---|---|---|
| Hall pass out | where they went | blank |
| Back | where they went | minutes |
| Not signed back in | where they went | minutes until the pass closed |

**Limits to know about:** each kiosk only knows its own room's passes. It can't see that a student is out from another room, and the weekly limit only counts passes from this device. Hall pass settings are per device, and they're not included in setup codes.

---

## Adding beta-tester rooms (and later the whole school)

Every room uses the **same form and Sheet**, so you don't make a new form per teacher.

1. On a kiosk that's already working, open setup › **5. Copy setup to another device** › **Make setup code**. The code includes the form connection and, if the box is checked, the classes (periods and class names). Send it to the other teacher.
2. On the new device, open the kiosk address, create a PIN, paste the code into **Paste a setup code**, and click **Use this code**.
3. That teacher sets their **room name**, adds student names to each class, and sends a test.

**Moving a roster you typed on a different device:** on the device that has the names, check **Also include student names** before making the code. Paste the code into the kiosk that needs them. If that kiosk already has a class in the same period, it asks whether to replace it with the code's version. A code with names contains real student names, so paste it directly between devices; don't email it widely or post it where others can see.

---

## Who sees the records

**The office** owns the main Sheet and sees every room. Sort or filter by the Room column.

**Each teacher** should see only their own room. Teachers shouldn't get direct access to the main Sheet, because it shows every room's tardies. Instead, the office makes a small Sheet for each teacher that pulls in only that room's rows. This uses a regular Sheets formula, not Apps Script.

1. The office creates a new, blank Google Sheet named, for example, "Tardies – Room 14."
2. In cell A1, paste this (replace the link with the main Sheet's address and the room name with the teacher's):

   ```
   =QUERY(IMPORTRANGE("PASTE-MAIN-SHEET-LINK-HERE", "Form Responses 1!A:J"), "select * where Col2 = 'Room 14'", 1)
   ```

   `Col2` means the second column. That's Room if Room is the first question on the form (the first column is always Google's timestamp). If you added the questions in a different order, change the number.
3. The first time, click the cell and choose **Allow access**.
4. Share the teacher Sheet with that teacher as **Viewer**, so they can't change the formula to see other rooms.

For your pilot, you can just use the main Sheet yourself.

**Moving the form to the office later:** if you pilot with a form under your own account and later switch to an office-owned form, each kiosk needs the new form's pre-filled link pasted into setup step 1 (or a new setup code). Old rows stay in your pilot Sheet.

---

## Locking the device

A web page can't fully lock a device. Browsers deliberately stop websites from preventing someone from closing a tab or going to another site. The kiosk does what a page can, and the device itself does the rest.

**What the kiosk does: Lock-down mode** (setup, section 2)

- Keeps the kiosk **full screen**. If a student exits full screen, the next tap brings it back.
- In Chrome, **Esc must be held down** for a couple of seconds to exit full screen, instead of a quick press.
- If someone tries to close the tab or leave, the browser asks **"Leave site?"**.
- **Reload, back, print, and similar keys** are blocked, and right-click is turned off.
- None of this applies on the teacher setup screen.

A determined student could still get around it (for example, by holding Esc, then closing the tab). So pair it with one of these:

**What the device can do (the real lock)**

- **Chromebook:** district IT can set the device up in **kiosk mode** from the Google Admin console, with your kiosk's web address as the only thing it runs. Students can't close it, open other tabs, or sign out. Ask for a "web kiosk app" pointed at your kiosk address.
- **iPad:** use **Guided Access**, which you can turn on yourself without IT: Settings › Accessibility › Guided Access. Open the kiosk in Safari, triple-click the side or home button, and tap Start. Only your passcode ends it.
- **Android tablet:** use **App pinning** (Settings › Security › App pinning).

---

## Asking district IT

Things to request:

- **Kiosk mode** on the dedicated Chromebook, showing only your kiosk address (a "web kiosk app" in the Google Admin console). This is the only true lock on a Chromebook.
- That **docs.google.com** is reachable from that device (it almost always is).
- That the device **doesn't go to sleep** during school hours. The page also asks the screen to stay awake where the browser allows it.
- That the device's browser data **isn't wiped on sign-out** or restart. Class lists and waiting check-ins live there. (Kiosk-mode Chromebooks normally keep it.)

Synergy's own KioskVUE is worth asking about too. If your district already supports it, it writes straight into Synergy.

---

## Privacy notes

- The website has no student names. Names live only in each device's browser and in the school-owned Google Sheet.
- Name buttons show first name + last initial (or the full last name if two students share a first name and initial).
- Use **Erase everything on this device** (setup section 7) before reassigning or recycling a device.

---

## If it stops working

Sending to a Google Form's response address is a long-standing method, but it isn't an official Google feature. If Google ever changes it, test entries will stop appearing in the Sheet. The fallback: post a QR code or link to the **Google Form itself** by the door and have students fill it out directly. Your Sheet and reports keep working.

---

## Small changes you can make yourself

At the top of `app.js` there's a short "Settings you might want to change" list: how long each screen waits before resetting, the 10-minute duplicate window, and how often it retries. Change a number, upload the file to GitHub, and you're done.

The late reasons (Bus, Office, Another teacher, Other) are the four buttons in `index.html`; search for `data-reason`. Hall pass destinations are set in the setup screen, no file editing needed.
