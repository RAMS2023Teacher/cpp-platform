"""Course plan, XP, levels, badges and avatar parts. Everything a teacher might want to tune lives here.

The build (tools/build.py) copies these into Data.gs for the Apps Script app.
"""

# ---------------------------------------------------------------- the courses: one per grade
# Both run in the Circuit City Arena robot lab: students pick a ready-built chassis, modify it, learn one part of
# the robot each week, then compete in a scored arena challenge.
#   Grade 7 "Rookie Season": 10 lessons, mostly driver control, ending in a coded maze run.
#   Grade 8 "Pro Season": 11 lessons, from gears and driving to sensors and a robot that drives itself.
# id, number, title, icon, banner color, big idea, hardware, skill-tree position (column, row), grade
COURSE = [
    ("welcome-to-circuit-city", 1, "Welcome to Circuit City", "🏙️", "gold",   "Every robot design is a trade-off",        "The four chassis, parts bins",      (1, 0), 7),
    ("brain-song",              2, "Brain Song",              "🎵", "green",  "A C++ program runs in order",              "Brain + USB cable",                 (1, 1), 7),
    ("drivers-ed",              3, "Driver's Ed",             "🎮", "purple", "Loops · joystick numbers → motor speed",   "Your chassis + Controller",         (1, 2), 7),
    ("tune-your-bot",           4, "Tune Your Bot",           "🔧", "orange", "Traction, weight and balance",             "Wheels, Brain mounts",              (1, 3), 7),
    ("impossible-bridge",       5, "The Impossible Bridge",   "🌉", "red",    "Test, change one thing, test again",       "Your bot + the bridge",             (1, 4), 7),
    ("claws-and-arms",          6, "Claws and Arms",          "🦾", "blue",   "if / else · buttons run a mechanism",      "Extra motor, claw or arm parts",    (1, 5), 7),
    ("castle-crasher",          7, "Castle Crasher",          "🏰", "pink",   "Strategy: plan before you drive",          "Your bot + block towers",           (1, 6), 7),
    ("sumo-showdown",           8, "Sumo Showdown",           "🥋", "red",    "Pushing power: torque, grip, low weight",  "Your bot + the ring",               (1, 7), 7),
    ("robot-drive-yourself",    9, "Robot, Drive Yourself",   "🧭", "teal",   "Sequences: exact moves in order",          "Your chassis, tape measure",        (1, 8), 7),
    ("maze-runner",            10, "Maze Runner",             "🏁", "purple", "Plan, measure, code, debug",               "Your bot + the maze",               (1, 9), 7),

    ("motors-and-gears",     1, "Motors and Gears",     "⚙️", "orange", "Gear ratios: speed or strength",          "Smart Motor, gears, shafts",         (1, 0), 8),
    ("pick-your-chassis",    2, "Pick Your Chassis",    "🛠️", "blue",   "Drive trains, structure and Smart Ports", "The four chassis, parts bins",       (1, 1), 8),
    ("hello-brain",          3, "Hello, Brain",         "👋", "green",  "A C++ program runs in order",             "Your chassis + USB cable",           (1, 2), 8),
    ("take-the-wheel",       4, "Take the Wheel",       "🎮", "purple", "Loops · joystick numbers → motor speed",  "Controller",                         (1, 3), 8),
    ("battle-bot-design",    5, "Battle Bot Design",    "🛡️", "red",    "if / else · buttons run a mechanism",     "Extra motor, beams for a wedge",     (1, 4), 8),
    ("battle-bot-challenge", 6, "Battle Bot Challenge", "🏆", "gold",   "Test, improve, compete",                  "Your battle bot + the ring",         (1, 5), 8),
    ("drive-by-code",        7, "Drive by Code",        "🧭", "teal",   "Sequences and for loops",                 "Your chassis + Gyro Sensor",         (1, 6), 8),
    ("feel-the-wall",        8, "Feel the Wall",        "🧱", "orange", "if / else with a sensor",                 "Bumper Switch + Touch LED",          (0, 7), 8),
    ("see-it-coming",        9, "See It Coming",        "🦇", "blue",   "while loops with a sensor",               "Distance Sensor",                    (2, 7), 8),
    ("follow-the-line",     10, "Follow the Line",      "🛤️", "pink",   "Functions and thresholds",                "Color Sensor",                       (1, 8), 8),
    ("autonomy-challenge",  11, "Autonomy Challenge",   "🚀", "purple", "Sense → decide → act, all together",      "Your robot + the course",            (1, 9), 8),
]
GRADES = {7: "Grade 7 · Rookie Season", 8: "Grade 8 · Pro Season"}
DEFAULT_GRADE = 8
# what has to be finished before a lesson unlocks on the skill tree (any one of them)
REQUIRES = {
    "brain-song": ["welcome-to-circuit-city"], "drivers-ed": ["brain-song"], "tune-your-bot": ["drivers-ed"],
    "impossible-bridge": ["tune-your-bot"], "claws-and-arms": ["impossible-bridge"], "castle-crasher": ["claws-and-arms"],
    "sumo-showdown": ["castle-crasher"], "robot-drive-yourself": ["sumo-showdown"], "maze-runner": ["robot-drive-yourself"],

    "pick-your-chassis": ["motors-and-gears"], "hello-brain": ["pick-your-chassis"],
    "take-the-wheel": ["hello-brain"], "battle-bot-design": ["take-the-wheel"], "battle-bot-challenge": ["battle-bot-design"],
    "drive-by-code": ["battle-bot-challenge"],
    "feel-the-wall": ["drive-by-code"], "see-it-coming": ["drive-by-code"],
    "follow-the-line": ["feel-the-wall", "see-it-coming"], "autonomy-challenge": ["follow-the-line"],
}

# ---------------------------------------------------------------- the robot lab
# The ready-built chassis students choose from and modify: id, name, one line about it
CHASSIS = [
    ("2wd", "2WD Standard", "Two drive wheels and a caster. Quick turns, a good all-rounder."),
    ("2wd-lite", "2WD Lite", "A smaller, lighter 2WD. Fast and nimble, easy to push around."),
    ("3wd", "3WD Side Crawler", "Three wheels in a triangle. Climbs well, turns differently."),
    ("4wd", "4WD", "Four driven wheels. The most grip and pushing power, slower to turn."),
]

# ---------------------------------------------------------------- Circuit City Arena
# The scored challenges. The teacher types each student's points on the class page; the site ranks them and keeps
# season standings (placement points below), shown on the class display.
# id, grade, lesson id, icon, name, kind (driver / code), one line, scoring guide [(what, points)]
ARENA_EVENTS = [
    ("brain-song", 7, "brain-song", "🎵", "Brain Song", "code", "Program the Brain to play a song.",
     [("Plays 8 or more notes", 10), ("The class can name the tune", 10), ("Uses a loop to repeat a part", 5),
      ("Shows the song title on the screen", 5), ("Crowd favorite", 5)]),
    ("impossible-bridge", 7, "impossible-bridge", "🌉", "The Impossible Bridge", "driver", "Drive over the steep two-beam bridge.",
     [("Front wheels on the ramp", 5), ("Reached the top", 10), ("Crossed the beams", 15), ("Down the far side on its wheels", 10),
      ("Fastest crossing of the day", 10)]),
    ("castle-crasher", 7, "castle-crasher", "🏰", "Castle Crasher", "driver", "Knock down towers and collect blocks of your color.",
     [("Each tower knocked down", 5), ("Each block of your color brought home", 10), ("Each wrong-color block brought home", -5)]),
    ("sumo-showdown", 7, "sumo-showdown", "🥋", "Sumo Showdown", "driver", "Push the other bot out, or knock down its pillar.",
     [("Each match won", 10), ("Each match tied", 5), ("Won by knocking down the pillar", 5)]),
    ("maze-runner", 7, "maze-runner", "🏁", "Maze Runner", "code", "Code your bot through the maze. No driver.",
     [("Easy course: each checkpoint", 5), ("Easy course finished", 10), ("Hard course: each checkpoint", 10),
      ("Hard course finished", 20), ("No wall touches", 10)]),

    ("battle-bot-challenge", 8, "battle-bot-challenge", "🏆", "Battle Bot Challenge", "driver", "Sumo with the bot you designed.",
     [("Each match won", 10), ("Each match tied", 5), ("Won by knocking down the pillar", 5), ("Mechanism worked in a match", 5)]),
    ("wall-maze", 8, "feel-the-wall", "🧱", "Maze Runner Pro", "code", "Find the way through with the Bumper Switch. No driver.",
     [("Each checkpoint", 10), ("Finished the maze", 20), ("Used the sensor, not just measured moves", 10)]),
    ("autonomy-challenge", 8, "autonomy-challenge", "🚀", "Collection Run", "code", "Drive itself, collect a block, park.",
     [("Left the start box on its own", 5), ("Followed the line to the end", 10), ("Stopped before the wall", 10),
      ("Collected the block", 15), ("Parked in the zone", 10)]),
]
# season points for an event by place; everyone else who competed gets the last number
ARENA_PLACE_POINTS = [100, 80, 65, 50, 40]

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
#   ["steps", n] build steps done · ["lesson", id] that lesson complete · ["lesson_any", [ids]] any of them
#   ["lessons", n] lessons complete · ["course"] every lesson in the student's grade
#   ["arena_events", n] arena challenges scored in · ["arena_place", n] finished an arena challenge in the top n
#   ["wired", n] lessons complete that have wiring · ["perfect", n] perfect quizzes · ["first_try", n]
#   ["extensions", n] · ["shipped", n] · ["partner", n] lessons complete with a partner
#   ["avatar"] customized the robot · ["early"] finished an assignment before it was due · ["teacher"] given by the teacher
BADGES = [
    ("first-step", "⚡", "First Step", "Finish your first build step.", ["steps", 1]),
    ("finisher", "🏁", "Finisher", "Complete a whole lesson.", ["lessons", 1]),
    ("shipper", "📦", "Shipper", "Turn in your first project.", ["shipped", 1]),
        ("gear-head", "⚙️", "Gear Head", "Complete Motors and Gears.", ["lesson", "motors-and-gears"]),
    ("robot-builder", "🤖", "Robot Builder", "Complete Pick Your Chassis or Welcome to Circuit City.", ["lesson_any", ["pick-your-chassis", "welcome-to-circuit-city"]]),
    ("first-program", "👋", "First Program", "Complete Hello, Brain or Brain Song.", ["lesson_any", ["hello-brain", "brain-song"]]),
    ("driver", "🎮", "Driver", "Complete Take the Wheel or Driver's Ed.", ["lesson_any", ["take-the-wheel", "drivers-ed"]]),
    ("gladiator", "🏆", "Gladiator", "Complete the Battle Bot Challenge.", ["lesson", "battle-bot-challenge"]),
    ("echo-hunter", "🦇", "Echo Hunter", "Complete See It Coming.", ["lesson", "see-it-coming"]),
    ("line-tracker", "🛤️", "Line Tracker", "Complete Follow the Line.", ["lesson", "follow-the-line"]),
    ("autonomous", "🚀", "Autonomous", "Complete the Autonomy Challenge.", ["lesson", "autonomy-challenge"]),
    ("composer", "🎵", "Composer", "Complete Brain Song.", ["lesson", "brain-song"]),
    ("bridge-crosser", "🌉", "Bridge Crosser", "Complete The Impossible Bridge.", ["lesson", "impossible-bridge"]),
    ("castle-crasher", "🏰", "Castle Crasher", "Complete Castle Crasher.", ["lesson", "castle-crasher"]),
    ("sumo", "🥋", "Sumo Star", "Complete Sumo Showdown.", ["lesson", "sumo-showdown"]),
    ("maze-runner", "🏁", "Maze Runner", "Complete Maze Runner.", ["lesson", "maze-runner"]),
    ("arena-rookie", "🎟️", "Arena Rookie", "Score in your first Circuit City Arena challenge.", ["arena_events", 1]),
    ("arena-podium", "🥉", "On the Podium", "Finish in the top 3 of an arena challenge.", ["arena_place", 3]),
    ("arena-champion", "🥇", "Arena Champion", "Win an arena challenge.", ["arena_place", 1]),
    ("quiz-whiz", "🧠", "Quiz Whiz", "Get a perfect quiz score.", ["perfect", 1]),
    ("sharpshooter", "🎯", "Sharpshooter", "Get 3 quizzes perfect on the first try.", ["first_try", 3]),
    ("remixer", "🎨", "Remixer", "Add 5 extensions to your projects.", ["extensions", 5]),
    ("teamwork", "🤝", "Teamwork", "Complete a lesson with a partner.", ["partner", 1]),
    ("halfway", "⭐", "Halfway There", "Complete 5 lessons.", ["lessons", 5]),
    ("graduate", "🎓", "Graduate", "Complete every lesson in your course.", ["course"]),
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
             ("tank", "Tank treads", ("level", 6)), ("hover", "Hover jets", ("badge", "arena-rookie"))],
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
                  ("goggles", "Safety goggles", ("badge", "robot-builder")),
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
MAKECODE_URL = "https://makecode.microbit.org/"          # only for a lesson marked lang: python
VEXCODE_URL = "https://codeiq.vex.com/"                  # puts C++ programs on the real Brain
# VEX IQ CAD Studio, the teacher's 3D building app (its own Apps Script project). "" hides the button.
CAD_STUDIO_URL = "https://script.google.com/a/macros/holliston.k12.ma.us/s/AKfycbwBgf4p4ZOCFAMai8HSgooMJF6lEl5Q1HkMNtp7_zfF8ZxqQruKpXK23X_z-u8CeOeo/exec"
