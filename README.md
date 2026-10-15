# Tardy Sign-In Kiosk — Setup Guide

A free tardy sign-in page for a Chromebook or tablet by the classroom door. Students tap their name and "I'm late." Each check-in goes into a Google Form, and the form's Google Sheet becomes the record for every room.

Synergy stays the official attendance record. This is a convenience log.

---

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The kiosk page |
| `style.css` | Colors and layout (school green, gold, and white) |
| `app.js` | How the kiosk works |
| `sw.js` | Lets the page open even if the internet is down when the device restarts |
| `sample-class-list.csv` | A made-up class list you can use to practice importing |
| `README.md` | This guide |

The page contains **no student names**. Class lists are typed or imported on each device and stay in that device's browser.

---

## Step 1: Make the Google Form (about 10 minutes)

Use the school's Google account (or your own school account for the pilot; see "Moving the form to the office later" below).

1. Go to **forms.google.com** and start a blank form. Name it something like "Tardy Kiosk Log."
2. Add these questions. **Make every one a "Short answer" question**, not multiple choice. The kiosk fills them in for you, and short answer accepts anything it sends.
   - **Room**
   - **Student**
   - **Type** (the kiosk sends "Tardy." Later it will also send hall pass types.)
   - **Reason** (Bus, Office, Another teacher, Other, or blank)
   - **Class** *(recommended)*. The kiosk sends the class name, like "Period 3 – World History."
   - **Kiosk time** *(recommended)*. This is the time the student actually tapped. It matters because if the internet is down, a check-in might reach Google later, and Google's own timestamp would show that later time.
3. Leave every question **not required**.
4. Open the **Responses** tab and click **Link to Sheets** to create the Sheet. This Sheet is the shared record.
5. Open **Settings** (the gear at the top) › **Responses**. For the first test, leave the sign-in settings as they are. Step 4 explains what to change if the test doesn't arrive.

**Get the pre-filled link** (the kiosk reads its secret question codes from this link):

1. In the form editor, click the **⋮** menu (top right) › **Get pre-filled link**.
2. Type these exact words in the boxes: `room` in Room, `student` in Student, `type` in Type, `reason` in Reason, `class` in Class, and `time` in Kiosk time.
3. Click **Get link**, then **Copy link**. Paste it somewhere safe, like an email to yourself.

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
2. **Create a 4-digit teacher PIN** (you type it twice). Pick one students won't guess.
3. In **Teacher setup**:
   - **1. Connect your Google Form:** paste the pre-filled link and click **Read link**. Each answer box is listed with a guess at which question it belongs to. Check the guesses, then click **Save form connection**.
   - **2. This room:** type the room name, like `Room 14`. **Type it exactly the same way every time.** The office and teacher reports sort by this name.
   - **3. Class lists:** click **Add a class**, then enter the class name, start time, and end time, and paste the student names (one per line). "Maya Rivera" and "Rivera, Maya" both work. You can also upload a CSV with First and Last name columns, like `sample-class-list.csv`. Repeat for each class, including Advisory and electives.
   - **Which class shows on the kiosk:** "Switch automatically by bell schedule" shows the class that's in session (starting 5 minutes before the bell). Between classes, students see a "Which class are you late to?" screen. You can also choose to always show one class.
4. Click **Save & back to kiosk**.

To get back into setup, tap the small **gear** in the top corner and enter your PIN. Setup locks itself after 5 idle minutes.

---

## Step 4: Send a test, and check the sign-in setting

1. In setup, click **Send a test entry**.
2. Open the Google Sheet. Within a minute, you should see a new row with Student = `TEST`.

**If the test shows up:** you're done. Delete the TEST row whenever you like.

**If the test doesn't show up:**

The most likely cause is that the form only accepts people signed in to a school account. The kiosk sends in the background, and Google may quietly turn that away. Here's what to do:

1. In the form, go to **Settings › Responses** and turn off **"Restrict to users in [your school] and its trusted organizations."** Also make sure **"Collect email addresses"** is set to **Do not collect**, and **"Limit to 1 response"** is off.
2. Click **Send a test entry** again and check the Sheet.

**The trade-off:** with sign-in turned off, anyone who found the form's address could submit junk entries. The risk is small, since the address isn't shown anywhere students can see. Still, it's worth knowing about, and junk rows are easy to spot and delete. On a school-managed Chromebook signed into a school account, the restricted setting *sometimes* works. Test it on your actual device before deciding.

---

## Everyday use

- Students tap their name, can choose a reason, and tap **I'm late**. A green screen confirms the time and resets after 4 seconds.
- **"Not on the list?"** lets a student type their name. Those rows say "(typed in)" in the Sheet.
- If a student taps their name again within 10 minutes, the kiosk shows "You already checked in" and doesn't send a second row.
- The **status light** in the top bar:
  - **All check-ins sent:** everything has gone to Google.
  - **No internet · 3 saved, will send** (gold): check-ins are saved on the device and retried every 30 seconds until the internet is back. Don't erase the device while this is showing.
  - **Not connected to a form** (red): finish setup step 1.
- **Today on this device** (in setup) lists today's check-ins on that kiosk, marked Sent or Waiting.

**Important:** "Sent" means the device handed the check-in to Google. Google doesn't send a reply back, so the kiosk can't confirm it arrived. The Sheet is always the real record.

---

## Adding beta-tester rooms (and later the whole school)

Every room uses the **same form and Sheet**, so you don't make a new form per teacher.

1. On a kiosk that's already working, open setup › **5. Copy setup to another device** › **Make setup code**. The code includes the form connection and, if the box is checked, class names and times (no students). Send it to the other teacher.
2. On the new device, open the kiosk address, create a PIN, paste the code into **Paste a setup code**, and click **Use this code**.
3. That teacher sets their **room name**, adds student names to each class, and sends a test.

---

## Who sees the records

**The office** owns the main Sheet and sees every room. Sort or filter by the Room column.

**Each teacher** should see only their own room. Teachers shouldn't get direct access to the main Sheet, because it shows every room's tardies. Instead, the office makes a small Sheet for each teacher that pulls in only that room's rows. This uses a regular Sheets formula, not Apps Script.

1. The office creates a new, blank Google Sheet named, for example, "Tardies – Room 14."
2. In cell A1, paste this (replace the link with the main Sheet's address and the room name with the teacher's):

   ```
   =QUERY(IMPORTRANGE("PASTE-MAIN-SHEET-LINK-HERE", "Form Responses 1!A:G"), "select * where Col2 = 'Room 14'", 1)
   ```

   `Col2` means the second column. That's Room if Room is the first question on the form (the first column is always Google's timestamp). If you added the questions in a different order, change the number.
3. The first time, click the cell and choose **Allow access**.
4. Share the teacher Sheet with that teacher as **Viewer**, so they can't change the formula to see other rooms.

For your pilot, you can just use the main Sheet yourself.

**Moving the form to the office later:** if you pilot with a form under your own account and later switch to an office-owned form, each kiosk needs the new form's pre-filled link pasted into setup step 1 (or a new setup code). Old rows stay in your pilot Sheet.

---

## Asking district IT

Things to request:

- **Kiosk/locked mode** on the dedicated Chromebook, showing only your kiosk address. IT can do this through the Google Admin console.
- That **docs.google.com** is reachable from that device (it almost always is).
- That the device **doesn't go to sleep** during school hours. The page also asks the screen to stay awake where the browser allows it.
- That the device's browser data **isn't wiped on sign-out** or restart. Class lists and waiting check-ins live there. (Kiosk-mode Chromebooks normally keep it.)

Synergy's own KioskVUE is worth asking about too. If your district already supports it, it writes straight into Synergy.

---

## Privacy notes

- The website has no student names. Names live only in each device's browser and in the school-owned Google Sheet.
- Name buttons show first name + last initial (or the full last name if two students share a first name and initial).
- Use **Erase everything on this device** (setup section 6) before reassigning or recycling a device.

---

## If it stops working

Sending to a Google Form's response address is a long-standing method, but it isn't an official Google feature. If Google ever changes it, test entries will stop appearing in the Sheet. The fallback: post a QR code or link to the **Google Form itself** by the door and have students fill it out directly. Your Sheet and reports keep working.

---

## Small changes you can make yourself

At the top of `app.js` there's a short "Settings you might want to change" list: how long each screen waits before resetting, the 10-minute duplicate window, and how often it retries. Change a number, upload the file to GitHub, and you're done.

The reasons (Bus, Office, Another teacher, Other) are the four buttons in `index.html`; search for `data-reason`.
