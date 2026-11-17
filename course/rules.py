"""Course plan, XP, levels, badges and avatar parts. Everything a teacher might want to tune lives here.

The build (tools/build.py) copies these into Data.gs for the Apps Script app.
"""

# ---------------------------------------------------------------- the course: 12 projects, in order
# From low level (a circuit) to high level (a robot that drives itself). Lesson 7 is the Battle Bot Challenge
# (driver control) and lesson 12 is the Autonomy Challenge (no driver).
# id, number, title, icon, banner color, big idea, hardware, skill-tree position (column, row)
COURSE = [
    ("light-it-up",          1, "Light It Up",          "💡", "gold",   "Circuits: input → decide → output",       "micro:bit, LED, resistor, button",   (1, 0)),
    ("motors-and-gears",     2, "Motors and Gears",     "⚙️", "orange", "Gear ratios: speed or strength",          "Smart Motor, gears, shafts",         (0, 1)),
    ("drive-base",           3, "Build the Drive Base", "🛠️", "blue",   "Structure, bracing and Smart Ports",      "VEX IQ kit, 2 motors, Brain",        (2, 1)),
    ("hello-brain",          4, "Hello, Brain",         "👋", "green",  "A C++ program runs in order",             "Drive base + USB cable",             (1, 2)),
    ("take-the-wheel",       5, "Take the Wheel",       "🎮", "purple", "Loops · joystick numbers → motor speed",  "Controller",                         (1, 3)),
    ("battle-bot-design",    6, "Battle Bot Design",    "🛡️", "red",    "if / else · buttons run a mechanism",     "Extra motor, beams for a wedge",     (1, 4)),
    ("battle-bot-challenge", 7, "Battle Bot Challenge", "🏆", "gold",   "Test, improve, compete",                  "Your battle bot + the ring",         (1, 5)),
    ("drive-by-code",        8, "Drive by Code",        "🧭", "teal",   "Sequences and for loops",                 "Drive base + Gyro Sensor",           (1, 6)),
    ("feel-the-wall",        9, "Feel the Wall",        "🧱", "orange", "if / else with a sensor",                 "Bumper Switch + Touch LED",          (0, 7)),
    ("see-it-coming",       10, "See It Coming",        "🦇", "blue",   "while loops with a sensor",               "Distance Sensor",                    (2, 7)),
    ("follow-the-line",     11, "Follow the Line",      "🛤️", "pink",   "Functions and thresholds",                "Color Sensor",                       (1, 8)),
    ("autonomy-challenge",  12, "Autonomy Challenge",   "🚀", "purple", "Sense → decide → act, all together",      "Your robot + the course",            (1, 9)),
]
# what has to be finished before a lesson unlocks on the skill tree (any one of them)
REQUIRES = {
    "motors-and-gears": ["light-it-up"], "drive-base": ["light-it-up"],
    "hello-brain": ["motors-and-gears", "drive-base"],
    "take-the-wheel": ["hello-brain"], "battle-bot-design": ["take-the-wheel"], "battle-bot-challenge": ["battle-bot-design"],
    "drive-by-code": ["battle-bot-challenge"],
    "feel-the-wall": ["drive-by-code"], "see-it-coming": ["drive-by-code"],
    "follow-the-line": ["feel-the-wall", "see-it-coming"], "autonomy-challenge": ["follow-the-line"],
}

# ---------------------------------------------------------------- XP
XP = {
    "mission": 10,        # read the mission, answered the partner question
    "step": 10,           # every build step with all its tests checked
    "quiz": 30,           # passed the quiz (3 of 4, or better)
    "quiz_perfect": 20,   # every quiz answer right
    "quiz_first_try": 10,  # ...on the first try
    "extension": 25,      # each extension you add
    "ship": 50,           # turned in your project
    "complete": 50,       # whole lesson finished
    "badge": 25,          # every badge is also worth XP
}
LABELS = {"mission": "Mission accepted", "step": "Step done", "quiz": "Quiz passed", "quiz_perfect": "Perfect quiz",
          "quiz_first_try": "Perfect on the first try", "extension": "Extension added", "ship": "Project shipped",
          "complete": "Lesson complete!"}
QUIZ_PASS = 0.75

# ---------------------------------------------------------------- levels
LEVELS = [  # (XP needed, title)
    (0, "Spark"), (100, "Wire Wrangler"), (250, "Gear Head"), (450, "Builder"),
    (700, "Code Cadet"), (1000, "Driver"), (1350, "Bug Hunter"),
    (1750, "Battle Bot Boss"), (2200, "Sensor Sleuth"), (2700, "Engineer"),
    (3250, "Autonomy Ace"), (3850, "Robotics Legend"),
]

# ---------------------------------------------------------------- badges
# id, icon, name, description, rule. Rules are checked by apps_script/server/30_rewards.js:
#   ["steps", n] build steps done · ["lesson", id] that lesson complete · ["lessons", n] lessons complete
#   ["wired", n] lessons complete that have wiring · ["perfect", n] perfect quizzes · ["first_try", n]
#   ["extensions", n] · ["shipped", n] · ["partner", n] lessons complete with a partner
#   ["avatar"] customized the robot · ["early"] finished an assignment before it was due · ["teacher"] given by the teacher
BADGES = [
    ("first-step", "⚡", "First Step", "Finish your first build step.", ["steps", 1]),
    ("finisher", "🏁", "Finisher", "Complete a whole lesson.", ["lessons", 1]),
    ("shipper", "📦", "Shipper", "Turn in your first project.", ["shipped", 1]),
    ("circuit-builder", "💡", "Circuit Builder", "Complete Light It Up.", ["lesson", "light-it-up"]),
    ("gear-head", "⚙️", "Gear Head", "Complete Motors and Gears.", ["lesson", "motors-and-gears"]),
    ("robot-builder", "🤖", "Robot Builder", "Complete Build the Drive Base.", ["lesson", "drive-base"]),
    ("first-program", "👋", "First Program", "Complete Hello, Brain.", ["lesson", "hello-brain"]),
    ("driver", "🎮", "Driver", "Complete Take the Wheel.", ["lesson", "take-the-wheel"]),
    ("gladiator", "🏆", "Gladiator", "Complete the Battle Bot Challenge.", ["lesson", "battle-bot-challenge"]),
    ("echo-hunter", "🦇", "Echo Hunter", "Complete See It Coming.", ["lesson", "see-it-coming"]),
    ("line-tracker", "🛤️", "Line Tracker", "Complete Follow the Line.", ["lesson", "follow-the-line"]),
    ("autonomous", "🚀", "Autonomous", "Complete the Autonomy Challenge.", ["lesson", "autonomy-challenge"]),
    ("quiz-whiz", "🧠", "Quiz Whiz", "Get a perfect quiz score.", ["perfect", 1]),
    ("sharpshooter", "🎯", "Sharpshooter", "Get 3 quizzes perfect on the first try.", ["first_try", 3]),
    ("remixer", "🎨", "Remixer", "Add 5 extensions to your projects.", ["extensions", 5]),
    ("teamwork", "🤝", "Teamwork", "Complete a lesson with a partner.", ["partner", 1]),
    ("halfway", "⭐", "Halfway There", "Complete 6 lessons.", ["lessons", 6]),
    ("graduate", "🎓", "Graduate", "Complete all 12 lessons.", ["lessons", 12]),
    ("early-bird", "🐦", "Early Bird", "Finish an assignment before it's due.", ["early"]),
    ("robot-stylist", "🤖", "Robot Stylist", "Customize your robot.", ["avatar"]),
    ("teachers-pick", "🍎", "Teacher's Pick", "Given by your teacher for great work.", ["teacher"]),
]

# ---------------------------------------------------------------- avatar parts
# unlock: None (free), ("level", n), ("badge", id) or ("cost", n): bought in the shop with XP to spend.
# Spending never lowers a level: levels count all the XP ever earned; the shop spends from "XP to spend".
AVATAR_PARTS = {"body": "Body", "color": "Color", "eyes": "Eyes", "mouth": "Mouth",
                "antenna": "Antenna", "accessory": "Accessory", "bg": "Background"}
DEFAULT_AVATAR = {"body": "box", "color": "teal", "eyes": "round", "mouth": "smile",
                  "antenna": "ball", "accessory": "none", "bg": "sky", "name": ""}
AVATAR_OPTIONS = {
    "body": [("box", "Boxy", None), ("round", "Dome", None), ("tall", "Tall", ("level", 3)),
             ("tank", "Tank treads", ("level", 6)), ("hover", "Hover jets", ("badge", "robot-builder"))],
    "color": [("teal", "Teal", None), ("red", "Red", None), ("orange", "Orange", None),
              ("yellow", "Yellow", None), ("green", "Green", None), ("blue", "Blue", None),
              ("purple", "Purple", None), ("pink", "Pink", None), ("white", "White", None),
              ("chrome", "Chrome", ("level", 8)), ("gold", "Gold", ("badge", "halfway")),
              ("lime", "Neon lime", ("cost", 100)), ("galaxy", "Galaxy", ("cost", 250))],
    "eyes": [("dots", "Dots", None), ("round", "Round", None), ("visor", "Visor", ("level", 2)),
             ("cyclops", "Cyclops", ("level", 4)), ("hearts", "Hearts", ("badge", "quiz-whiz")),
             ("leds", "LED grid", ("level", 5)), ("happy", "Happy", ("badge", "finisher")),
             ("shades", "Sunglasses", ("cost", 150)), ("star", "Star eyes", ("cost", 150))],
    "mouth": [("smile", "Smile", None), ("flat", "Flat", None), ("open", "Open", None),
              ("grille", "Grille", ("level", 3)), ("zigzag", "Zigzag", ("badge", "remixer")),
              ("fangs", "Fangs", ("cost", 100)), ("mustache", "Mustache", ("cost", 150))],
    "antenna": [("none", "None", None), ("ball", "Ball", None), ("double", "Double", ("level", 2)),
                ("bolt", "Lightning", ("level", 4)), ("dish", "Radar dish", ("badge", "echo-hunter")),
                ("propeller", "Propeller", ("level", 7)),
                ("flower", "Flower", ("cost", 100)), ("halo", "Halo", ("cost", 200))],
    "accessory": [("none", "None", None), ("bowtie", "Bow tie", None), ("cap", "Cap", ("level", 3)),
                  ("headphones", "Headphones", ("badge", "driver")),
                  ("goggles", "Safety goggles", ("badge", "circuit-builder")),
                  ("cape", "Cape", ("level", 9)), ("crown", "Crown", ("badge", "graduate")),
                  ("scarf", "Scarf", ("cost", 120)), ("wizard", "Wizard hat", ("cost", 250)), ("jetpack", "Jetpack", ("cost", 300))],
    "bg": [("sky", "Sky", None), ("mint", "Mint", None), ("sun", "Sunny", None), ("lilac", "Lilac", None),
           ("night", "Night", None), ("circuit", "Circuit board", ("level", 5)),
           ("stars", "Starfield", ("level", 10)),
           ("ocean", "Ocean", ("cost", 150)), ("lava", "Volcano", ("cost", 150)), ("rainbow", "Rainbow", ("cost", 250))],
}

# ---------------------------------------------------------------- Robot Rush (the arcade game)
# Closed unless the teacher opens the arcade for a class. Finishing a lesson earns "minutes" of play time;
# each race uses "race_seconds" of it (more with the Overtime power-up).
ARCADE = {"minutes": 5, "race_seconds": 45}
# Power-ups bought with XP to spend: id, icon, name, what it does, cost of each level
POWERUPS = [
    ("turbo", "⚡", "Turbo", "Your robot runs faster.", [100, 200, 350]),
    ("shield", "🛡️", "Shield", "Start each race with a shield that blocks one hit. More levels, more shields.", [120, 240, 400]),
    ("magnet", "🧲", "Bolt magnet", "Pull in bolts from farther away.", [80, 160, 300]),
    ("dash", "🚀", "Rocket dash", "Press Space for a burst of speed that smashes through bugs. One dash per level.", [100, 200, 350]),
    ("time", "⏱️", "Overtime", "5 more seconds on the race clock for each level.", [150, 300]),
]

# ---------------------------------------------------------------- the other apps students use (each opens in its own tab)
MAKECODE_URL = "https://makecode.microbit.org/"          # lesson 1 only
VEXCODE_URL = "https://codeiq.vex.com/"                  # puts C++ programs on the real Brain
# VEX IQ CAD Studio, the teacher's 3D building app (its own Apps Script project). "" hides the button.
CAD_STUDIO_URL = "https://script.google.com/a/macros/holliston.k12.ma.us/s/AKfycbwBgf4p4ZOCFAMai8HSgooMJF6lEl5Q1HkMNtp7_zfF8ZxqQruKpXK23X_z-u8CeOeo/exec"
