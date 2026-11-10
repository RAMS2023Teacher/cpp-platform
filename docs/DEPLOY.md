# Putting RoboCode Academy on Google Apps Script

Do this signed in to **your school Google account**. Whoever deploys it becomes the teacher and owns all the student data. Students must be on the same school domain, because that's how the app knows who they are.

You'll copy four files from the `apps-script/` folder. If you've changed anything, run `npm run build` first.

## 1. Create the project
1. Go to [script.google.com](https://script.google.com) and click **New project**. Name it `RoboCode Academy`.
2. Replace everything in `Code.gs` with the contents of `apps-script/Code.gs`.
3. Click **+** next to Files → **Script**, name it `Lessons`, and replace its contents with `apps-script/Lessons.gs`.
4. Click **+** → **HTML**, name it `Index`, and replace its contents with `apps-script/Index.html`.
5. Click **Save**.

### Turn on Google Classroom
1. In the script editor, click **+** next to **Services**.
2. Choose **Google Classroom API** and click **Add**. Leave its name as `Classroom`.

## 2. Run setup once
1. Choose `setup` in the function dropdown at the top and click **Run**.
2. Approve the permissions when Google asks.

This creates a private spreadsheet in your Drive called **RoboCode Academy Data**. Robot photos go in a private Drive folder called **RoboCode Academy Robot Photos**. Don't share it with students, and don't rearrange its rows or columns.

## 3. Deploy
1. Click **Deploy → New deployment**, then the gear icon → **Web app**.
2. Set **Execute as** to **Me**.
3. Set **Who has access** to **Anyone within [your school]**.
4. Click **Deploy** and copy the **Web app URL**. That's the link for your students.

## 4. Try it
Open the link yourself. You'll land on the Teacher Dashboard. Create a class, choose its term length and robot kit, then have one student open the link and enter the join code.

## Sending grades to PowerSchool
1. Link your Google Classroom class to its PowerSchool section once, using **SIS export** in Classroom. Only the primary teacher listed in PowerSchool can do this.
2. In RoboCode, open a class and choose **🎓 Google Classroom**. Pick the Classroom class and a due date inside the grading period, then press **Send grades**.
3. In Google Classroom, open **Grades** and choose **SIS export**.

RoboCode creates its own assignments, because Google only lets an app grade assignments that app made. Don't delete them or re-create them by hand. Your district may also require a grade category on each assignment, which you can set in Classroom. Only the teacher who deployed the app can send grades.

## Updating later
Paste in the changed files, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The link stays the same. Saving alone doesn't change what students see.

## Adding another teacher
Add their school email to the **Teachers** tab of the data spreadsheet, on a new row, before they first open the link. Each teacher sees only their own classes.

## Good to know
- **Backups:** everything is in the data spreadsheet. Use **File → Version history** to go back, or **File → Make a copy** for a snapshot.
- **Speed:** each save takes a second or two, slower than a normal website. Code drafts save every 20 seconds and stay in the browser in between.
- **Whole-class limit:** Apps Script handles about 30 requests at the same moment for one deployment. A class of 30 is normally fine. If students see "try again", it clears within seconds.
- **Code history:** the newest 10 code submissions are kept per student per lesson.
- **Blocked content:** if your school blocks Google Fonts, the site still works with standard fonts.
- **Photos:** students are told to photograph robots only. You can review and delete photos from the **📸 Photos** button on a class.
- **Student data:** names, school emails, work and robot photos are stored in your Google account. Check that this fits your school's student-data policy before using it with a class.
