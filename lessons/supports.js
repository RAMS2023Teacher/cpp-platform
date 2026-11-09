// Student supports and standards for each lesson, merged into the lessons at build time.
//   standards: MA 2016 DLCS codes. anchor = taught and assessed here; supporting = practiced here.
//   think:  a question to hold in mind while reading.
//   brief:  an informational passage aimed at grades 7-8 (checked with Flesch-Kincaid). Lesson directions stay short and plain on purpose.
//   visual: a diagram with alt text (see public/js/visuals.js).
//   frames: sentence starters for the written reflection.
//   worked: a solved example that is similar to, but not the same as, the code challenge.
// Device names follow the 2nd gen lesson names; students see them adapted to their kit.
const x = (...codes) => codes.map(c => '6-8.' + c);

module.exports = {
  u1l1: {
    standards: { anchor: x('CS.a.4'), supporting: [] },
    think: 'What makes a machine a robot instead of just a tool?',
    brief: `A robot is a machine that gathers information about the world and responds on its own. Engineers call this process the Sense-Think-Act loop. Sensors measure things like distance, color, or pressure. The Brain then compares those readings with the instructions in its program. Finally, motors and other actuators make something happen. This cycle repeats many times each second, so the robot can react when things change. A remote-control car is not a true robot, because a person makes all of its choices. Automatic doors and warehouse robots use the same basic loop, even though their sensors and motors are very different.`,
    visual: { type: 'flow', loop: 'Repeats many times per second', items: ['SENSE: sensors measure the world', 'THINK: the Brain runs your program', 'ACT: motors move the robot'], alt: 'A cycle diagram. Sense leads to Think, Think leads to Act, and Act loops back to Sense many times per second.' },
    frames: ['A machine counts as a robot when…', 'One example of the Sense-Think-Act loop is…, because…'],
    worked: { code: `int main() {\n  Brain.Screen.print("Team Rocket");\n  Brain.Screen.newLine();\n  Brain.Screen.print("Ready to roll");\n  return 0;\n}`, notes: ['Everything the robot does starts inside main().', 'print shows text, and the quotation marks surround that text.', 'newLine moves down, so the next print starts on a new row.'] }
  },
  u1b1: {
    standards: { anchor: x('CS.a.5'), supporting: [] },
    think: 'Why would engineers want every part in a system to follow the same measurements?',
    brief: `Companies often make parts to a standard size so that pieces designed separately will still fit together. VEX IQ does this with its pitch, the 12.7-millimeter distance between the centers of two holes. Every beam and plate follows that grid, so you can predict how pieces will line up before you join them. Part names also provide clues, since a 2x8 beam is two holes wide and eight holes long. Connector pins fasten layers together, and standoffs maintain a gap between them. The number of pins matters, because one pin lets two parts swing like a hinge while a second pin locks the joint in place.`,
    visual: { type: 'beam', alt: 'A beam drawn as a row of eight holes, two holes wide. An arrow marks 12.7 millimeters between hole centers. Beside it, one pin lets a joint swing, while two pins lock the joint.' },
    frames: ['My stand stayed stable because…', 'If I built it again, I would change…, so that…']
  },
  u1b2: {
    standards: { anchor: x('CT.d.6'), supporting: x('CS.a.5') },
    think: 'How can you tell which part of a structure is doing the most work?',
    brief: `When a force pushes on a structure, the frame must either resist the force or change shape. A rectangle joined at its corners can fold into a diamond because its angles are free to change. A triangle is different because its three sides lock its three angles, so it keeps its shape unless a side bends or breaks. Engineers use this idea when they add braces across open frames. They also layer beams to stop bending and join two frames to form a stiff box. Every additional part increases weight, so strength must go where it is needed, and testing reveals the weakest spot, where the next improvement belongs.`,
    visual: { type: 'shapes', alt: 'Two frames under a sideways push. The square leans into a diamond. The triangle keeps its shape.' },
    frames: ['The weakest part of our bridge was…, which we noticed when…', 'We changed… and the result was…']
  },
  u1b3: {
    standards: { anchor: x('CS.a.4'), supporting: x('CT.b.2') },
    think: 'What does a machine give up when it gains strength?',
    brief: `A motor produces rotation, but a machine rarely uses that rotation directly, so shafts carry it to wheels and gears that change it. When a small gear turns a larger gear, the larger gear spins more slowly but with more torque, or turning force. To find the gear ratio, divide the teeth on the driven gear by the teeth on the driving gear. A 12-tooth gear turning a 36-tooth gear makes a 3:1 ratio, which gives three times the torque at one-third of the speed. If you swap the gears, you get the opposite trade. Designers choose a ratio to fit the job, since lifting requires torque and crossing open ground requires speed.`,
    visual: { type: 'gears', alt: 'A small 12-tooth driving gear meshed with a large 36-tooth driven gear. The small gear turns three times for each turn of the large gear, in the opposite direction, giving three times the torque at one third of the speed.' },
    frames: ['A robot that needs torque could…, so I would…', 'A robot that needs speed could…, so I would…']
  },
  u1l2: {
    standards: { anchor: x('CS.a.5', 'CS.a.7'), supporting: x('CS.a.4', 'CT.d.3') },
    think: 'If a robot misbehaves, how would you decide whether the problem is in the hardware or the code?',
    brief: `A program can control hardware only when it knows how that hardware is connected. The Brain has twelve numbered Smart Ports, and each device uses one port. Configuration is the step where you tell your project which device is in which port and what to call it in your code. If the real cable and the configuration do not match, your instruction goes to the wrong place, and the robot may sit still or spin in circles. Good builders find problems in an orderly way, checking power, cables, and ports before they examine the program. Teams also split up the work, because an inspector can catch a backward motor early.`,
    visual: { type: 'flow', items: ['Plug the device into a Smart Port', 'Add it in Robot Setup with the same port', 'Use its name in your code'], alt: 'Three steps in order: plug the device into a Smart Port, add it in Robot Setup with the same port number, then use its name in your code.' },
    frames: ['Our team found a problem when…, and we fixed it by…', 'Port numbers matter because…'],
    worked: { code: `int main() {\n  Drivetrain.driveFor(forward, 10, inches);\n  Drivetrain.driveFor(reverse, 10, inches);\n  return 0;\n}`, notes: ['Drivetrain only works after you add it in Robot Setup.', 'The three inputs are direction, distance, and units.', 'Going forward and then in reverse brings the robot back to its start.'] }
  },
  u1l3: {
    standards: { anchor: x('CT.d.5', 'CT.d.6'), supporting: x('CT.d.3') },
    think: 'Why is a computer so much less forgiving than a person reading your instructions?',
    brief: `A program is an exact list of statements, and a computer carries them out one at a time from top to bottom. This order is called sequence. C++ has strict grammar rules, known as syntax. A missing semicolon or quotation mark can stop a program from running at all. That mistake is a syntax error, and the error message usually points near the problem. A logic error is harder to spot, because the program runs but does the wrong thing. Programmers find both kinds by reading slowly and predicting what each line will do. Comments are notes the computer ignores, and they explain your thinking to other people.`,
    visual: { type: 'flow', items: ['#include brings in the VEX tools', 'int main() is where the robot starts', 'Statements run from top to bottom', 'return 0; ends the program'], alt: 'The parts of a C++ program in order: include brings in the VEX tools, int main is where the robot starts, statements run from top to bottom, and return 0 ends the program.' },
    frames: ['The most common error I made was…, and I can spot it by…', 'Order matters in a program because…'],
    worked: { code: `int main() {\n  // Say hello, then move\n  Brain.Screen.print("Hello!");\n  Drivetrain.driveFor(forward, 6, inches);\n  return 0;\n}`, notes: ['The line starting with // is a comment, so the robot ignores it.', 'Every statement ends with a semicolon.', 'The robot prints first and moves second, because that is the order of the lines.'] }
  },
  u1l4: {
    standards: { anchor: x('CT.d.3'), supporting: x('CT.b.2') },
    think: 'How could you check a path before the robot ever moves?',
    brief: `An algorithm is a set of steps that reaches a goal, and a robot's route is a simple example. Each move needs three pieces of information: a direction, an amount, and a unit. Without the unit, the amount means nothing, since twelve inches is very different from twelve millimeters. Velocity sets how fast a move happens, and slower moves are often more accurate. Careful planners sketch a path first and work out each distance and angle. Then they compare where the robot really stopped with where they predicted it would stop. Any difference is useful evidence, because it points to the step that needs to change.`,
    visual: { type: 'flow', loop: 'Do this 4 times to make a square', items: ['Drive forward 12 inches', 'Turn right 90 degrees'], alt: 'A two-step cycle: drive forward 12 inches, then turn right 90 degrees. Doing this four times makes a square.' },
    frames: ['I predicted the robot would…, but it…', 'To make the path more accurate, I…'],
    worked: { code: `int main() {\n  Drivetrain.setDriveVelocity(40, percent);\n  Drivetrain.driveFor(forward, 18, inches);\n  Drivetrain.turnFor(left, 180, degrees);\n  Drivetrain.driveFor(forward, 18, inches);\n  return 0;\n}`, notes: ['Setting the velocity first affects every drive after it.', 'A 180-degree turn makes the robot face the way it came.', 'Driving the same distance again returns it to the start.'] }
  },
  u2l1: {
    standards: { anchor: x('CT.d.4'), supporting: x('CT.b.2') },
    think: 'What becomes easier to change when a value has a name?',
    brief: `A variable is a named spot in memory that holds a value your program can read or change. Each variable has a data type, which sets the kind of information it can hold. In C++, an int holds whole numbers, a double holds decimals, a bool holds true or false, and a string holds text. Your choice of type matters, because dividing one int by another throws away the decimal part, so 7 / 2 gives 3. Variables also make programs easier to change, since if a number appears in many places, you can update it once instead of hunting through every line and maybe missing one.`,
    visual: { type: 'parts', items: [['int sides = 4;', 'whole number'], ['double inches = 12.5;', 'decimal number'], ['bool done = false;', 'true or false'], ['string name = "Rex";', 'text']], alt: 'Four labeled boxes showing data types: int sides equals 4 is a whole number, double inches equals 12.5 is a decimal, bool done equals false is true or false, and string name equals Rex is text.' },
    frames: ['A variable helped my program because…', 'I chose the data type… because…'],
    worked: { code: `int main() {\n  double side = 15;\n  double total = side * 2;\n  Drivetrain.driveFor(forward, total, inches);\n  Brain.Screen.print("%f", total);\n  return 0;\n}`, notes: ['side stores a measurement in one place.', 'total is calculated from side, so changing side changes total.', 'driveFor can use a variable in place of a typed number.'] }
  },
  u2l2: {
    standards: { anchor: x('CT.b.1', 'CT.d.5'), supporting: x('CT.d.4') },
    think: 'How can you tell that a set of instructions should become a loop?',
    brief: `Programs often need to repeat steps, and a loop does this without copying lines. A for loop has three parts: a starting value for its counter, a condition checked before each repeat, and an update that changes the counter. The code inside runs only while the condition is true. Tracing means following those values step by step to predict what the program will do. Loops can also show patterns in math. A robot driving any regular polygon turns 360 degrees in all, so each turn is 360 divided by the number of sides. By changing one number, you can turn a square into a hexagon.`,
    visual: { type: 'flow', loop: 'Goes back and checks again', items: ['Start: int i = 0', 'Check: is i < n?', 'Run the code inside', 'Update: i++'], alt: 'How a for loop runs: start with i equal to 0, check whether i is less than n, run the code inside, update i, and go back to check again.' },
    frames: ['A loop is better than repeated lines here because…', 'When I traced my loop, i changed from… to…'],
    worked: { code: `int main() {\n  for (int i = 0; i < 3; i++) {\n    Drivetrain.driveFor(forward, 6, inches);\n    Drivetrain.turnFor(right, 120, degrees);\n  }\n  return 0;\n}`, notes: ['i takes the values 0, 1, and 2, so the body runs 3 times.', 'Three sides need three turns of 360 / 3 = 120 degrees.', 'To change the shape, you would change the 3 and the 120.'] }
  },
  u2l3: {
    standards: { anchor: x('CT.b.1', 'CS.a.4'), supporting: x('CT.b.2', 'CT.d.4') },
    think: 'What questions does a robot need to be able to answer in order to choose?',
    brief: `Without conditionals, a program would do the same thing every time it ran. A conditional lets it respond to what is happening by testing a Boolean expression, which is either true or false. Comparison operators such as == and < create those values. Logical operators join them: && needs both sides to be true, and || needs only one. Conditions are checked in order, so only the first true branch of an if / else if chain will run. Sensors give a robot much of the information it tests. A reading only means something once the program compares it with a value and picks an action.`,
    visual: { type: 'tree', q: 'Does the sensor see red?', yes: 'Turn left', no: 'Keep driving', alt: 'A decision diagram. If the sensor sees red, turn left. If not, keep driving.' },
    frames: ['My robot chooses between… by checking…', 'The condition is true when…'],
    worked: { code: `int main() {\n  if (BumperA.pressing()) {\n    Brain.Screen.print("Ouch!");\n  } else {\n    Drivetrain.driveFor(forward, 5, inches);\n  }\n  return 0;\n}`, notes: ['The condition goes inside the parentheses.', 'Only one branch runs each time.', 'This checks the bumper once, right when the line runs.'] }
  },
  u2l4: {
    standards: { anchor: x('CT.b.1', 'CS.a.4'), supporting: x('CT.b.5', 'CT.d.4') },
    think: 'When do you know how long a task will take, and when do you not?',
    brief: `A for loop works well when you know how many times to repeat, but many robot jobs are not like that. A while loop keeps going as long as its condition stays true, so a robot can drive until a sensor finds a wall. Checking a sensor over and over like this is called polling. A short wait between checks gives the hardware time to respond. You must also make sure the condition can eventually become false, or you will create an infinite loop. Pay attention to the boundaries of a problem too, because a robot that starts too close to a wall may never enter the loop.`,
    visual: { type: 'flow', loop: 'Keep checking', items: ['Read the sensor', 'Is the wall farther than 6 inches?', 'Keep driving', 'Wait a moment'], alt: 'A while loop as a cycle: read the sensor, check whether the wall is farther than 6 inches, keep driving, wait a moment, and check again. When the answer is no, the loop ends.' },
    frames: ['I would use a while loop instead of a for loop when…', 'My loop ends when…'],
    worked: { code: `int main() {\n  while (!BumperA.pressing()) {\n    Drivetrain.drive(forward);\n    wait(20, msec);\n  }\n  Drivetrain.stop();\n  return 0;\n}`, notes: ['The ! means "not", so the loop runs until the bumper is pressed.', 'wait gives the sensor a short pause between checks.', 'stop comes after the loop, once the condition has changed.'] }
  },
  u2l5: {
    standards: { anchor: x('CT.a.2', 'CT.d.2'), supporting: x('CT.d.4', 'CT.b.3') },
    think: 'What can you ignore once a job has a good name?',
    brief: `As programs grow, long lists of commands get hard to follow. A function fixes this by grouping statements under a clear name. You can then call that name whenever you need the behavior. This is a kind of abstraction, because you can think about what a function does without thinking about each step inside it. Parameters make a function flexible by giving it different inputs on each call. A return value sends an answer back to the code that called it. Functions also make bugs easier to fix. If a robot turns the wrong way, one fix inside a function repairs every place that uses it.`,
    visual: { type: 'flow', items: ['Define it once: void wiggle(int times)', 'Call it: wiggle(2);', 'Call it again: wiggle(5);'], alt: 'A function is defined once, as void wiggle with a parameter called times, and can then be called many times with different values such as 2 and 5.' },
    frames: ['I made a function for… because…', 'The parameter lets my function…'],
    worked: { code: `void wiggle(int times) {\n  for (int i = 0; i < times; i++) {\n    Drivetrain.turnFor(right, 20, degrees);\n    Drivetrain.turnFor(left, 20, degrees);\n  }\n}\n\nint main() {\n  wiggle(3);\n  return 0;\n}`, notes: ['void means the function does not send a value back.', 'times is a parameter, so each call can use a different number.', 'Functions go above main() so main() can find them.'] }
  },
  u3l1: {
    standards: { anchor: x('CT.b.4', 'CT.d.1'), supporting: x('CT.d.3') },
    think: 'What makes one correct solution better than another correct solution?',
    brief: `An algorithm must be clear, which means each step can be understood in only one way. People quietly fill in missing details, but machines cannot. Before writing code, programmers often describe their plan in pseudocode, a structured form of plain language, or draw a flowchart to show decisions and paths. Most problems can be solved by more than one algorithm. To compare them, you need clear measures, such as the number of steps or the time needed. A method that is fast in one case may be slow in another. Selecting an algorithm is a decision engineers make, not a hunt for one perfect answer.`,
    visual: { type: 'compare', left: { title: 'Pseudocode', items: ['Written in plain words', 'Easy to write quickly', 'Reads from top to bottom'] }, right: { title: 'Flowchart', items: ['Drawn with shapes and arrows', 'Shows decisions clearly', 'Good for seeing branches'] }, alt: 'A comparison. Pseudocode is written in plain words, is quick to write, and reads top to bottom. A flowchart uses shapes and arrows, shows decisions clearly, and is good for seeing branches.' },
    frames: ['The two solutions differ because…', 'I think the better algorithm is… based on…'],
    worked: { code: `void forwardAndRight(int inches_) {\n  Drivetrain.driveFor(forward, inches_, inches);\n  Drivetrain.turnFor(right, 90, degrees);\n}\n\nint main() {\n  forwardAndRight(12);\n  forwardAndRight(24);\n  return 0;\n}`, notes: ['Each maze section is one drive plus one turn.', 'A function avoids retyping that pair of steps.', 'Count the moves in two routes to compare how efficient they are.'] }
  },
  u3l2: {
    standards: { anchor: x('CT.d.3', 'CS.a.6'), supporting: x('CT.b.5') },
    think: 'How can a single number turn the world into two categories?',
    brief: `Sensors give numbers across a wide range, but a robot often needs a simple answer, such as on the line or off the line. A threshold makes this possible. To find one, measure the brightness of each surface and pick the middle value. This step is called calibration, and you must repeat it whenever the lighting or the floor changes. A bang-bang controller then selects one of two actions, turning one way if the reading is below the threshold and the other way if it is not. By following the edge of the line and not its center, the robot always knows which way to correct.`,
    visual: { type: 'tree', q: 'Is brightness below the threshold?', yes: 'On the line: turn left', no: 'Off the line: turn right', alt: 'A decision diagram. If brightness is below the threshold, the robot is on the line and turns left. If not, it is off the line and turns right.' },
    frames: ['We chose a threshold of… because we measured…', 'Our robot moved off the line when…'],
    worked: { code: `int main() {\n  int black = 10;\n  int white = 90;\n  int threshold = (black + white) / 2;\n  Brain.Screen.print("%d", threshold);\n  return 0;\n}`, notes: ['Use your own measured values in place of 10 and 90.', 'The midpoint of two readings is their sum divided by 2.', 'Print the result so you can check it.'] }
  },
  u3l3: {
    standards: { anchor: x('CT.d.1', 'CT.d.3'), supporting: x('CT.b.4') },
    think: 'What does it take to find something quickly in a huge collection?',
    brief: `An array stores a list of values under one name, and an index marks each spot, starting at zero. Finding a value in an array is called searching. A linear search checks items in order until it finds the target. It works on any list, but it may have to examine every item, whereas a binary search checks the middle of a sorted list and throws out half of what is left each time. The difference grows quickly as lists get longer, so in a sorted list of one million items, a binary search needs only about twenty comparisons. That speed has a cost, since the list must already be in order.`,
    visual: { type: 'array', caption: 'Binary search for 42: check the middle, then discard half', values: [3, 8, 15, 23, 42, 57, 71], highlight: [3, 4], fade: [0, 1, 2], alt: 'A sorted list of 3, 8, 15, 23, 42, 57, and 71. Binary search checks the middle value, 23, discards 3, 8, and 15, and moves right toward 42.' },
    frames: ['Linear search works better when…', 'Binary search needs… because…'],
    worked: { code: `int main() {\n  int scores[4] = {7, 2, 9, 4};\n  int biggest = scores[0];\n  for (int i = 1; i < 4; i++) {\n    if (scores[i] > biggest) {\n      biggest = scores[i];\n    }\n  }\n  Brain.Screen.print("%d", biggest);\n  return 0;\n}`, notes: ['Start by assuming the first item is the biggest.', 'The loop compares each remaining item with the best so far.', 'After the last comparison, biggest holds the answer.'] }
  },
  u3l4: {
    standards: { anchor: x('CT.d.3', 'CT.d.5'), supporting: x('CT.b.4') },
    think: 'How can many small comparisons produce order?',
    brief: `Sorting puts data in order by a rule, and sorted data is easier to search and understand. Bubble sort is a simple method that compares two neighbors and swaps them if they are out of order. Each full pass moves the largest value left to its final spot, like a bubble rising in water. A swap needs a temporary variable, or the first step would erase one of the two values. One loop controls the passes and another controls the comparisons, so the code uses nested loops. Bubble sort is easy to trace, but it is slow on long lists, so most professional software uses faster methods.`,
    visual: { type: 'array', caption: 'One comparison: 8 and 3 are out of order, so they swap', values: [8, 3, 5, 1], highlight: [0, 1], after: [3, 8, 5, 1], alt: 'A list of 8, 3, 5, and 1. The first two values, 8 and 3, are out of order and swap, giving 3, 8, 5, and 1.' },
    frames: ['During each pass, the program…', 'The temporary variable is needed because…'],
    worked: { code: `int main() {\n  int a = 8;\n  int b = 3;\n  if (a > b) {\n    int temp = a;\n    a = b;\n    b = temp;\n  }\n  Brain.Screen.print("%d %d", a, b);\n  return 0;\n}`, notes: ['temp saves a before a is overwritten.', 'Without temp, the 8 would be lost.', 'This is the swap at the center of bubble sort.'] }
  },
  u3l5: {
    standards: { anchor: x('CT.b.3', 'CS.a.5'), supporting: x('CT.a.2', 'CT.d.2', 'CT.d.4') },
    think: 'How would you split a big job so that each piece can be tested alone?',
    brief: `Big jobs get easier through decomposition, which means splitting a problem into smaller parts you can solve one at a time. A cube-sorting robot must reach a cube, grab it, read its color, drive to the right zone, and let go. Each of those steps can become a helper function that you test on its own. Once every part works, your main program can read almost like a plain description of the mission. This also helps teams, because different people can build different functions. Warehouses and recycling centers use the same strategy on a much larger scale, sorting huge numbers of items each day.`,
    visual: { type: 'tree', q: 'What color is the cube?', yes: 'Red: deliver to the left zone', no: 'Blue: deliver to the right zone', yesLabel: 'red', noLabel: 'blue', alt: 'A decision diagram. If the cube is red, deliver it to the left zone. If it is blue, deliver it to the right zone.' },
    frames: ['We split the job into…', 'The helper function… made our program easier because…'],
    worked: { code: `void grab() {\n  ClawMotor.spinFor(forward, 90, degrees);\n}\n\nvoid release() {\n  ClawMotor.spinFor(reverse, 90, degrees);\n}\n\nint main() {\n  grab();\n  Drivetrain.driveFor(forward, 6, inches);\n  release();\n  return 0;\n}`, notes: ['Each helper does one job and has a clear name.', 'main() now reads like a description of the task.', 'You can test grab() by itself before using it.'] }
  },
  u3l6: {
    standards: { anchor: x('CT.d.3'), supporting: x('CT.e.1', 'CT.b.4') },
    think: 'What details about a real place can a map safely leave out?',
    brief: `Navigation software turns the world into a simplified model. A maze, for example, can become a grid where each cell is either open or blocked. Details such as wall color are left out because they do not change the route. Breadth-First Search explores this grid in growing rings around the start. It uses a queue to visit the closest cells first, and every cell one step away is checked before any cell two steps away, so the first path to reach the goal is one of the shortest. Once the route is known, a robot can store it as a list of moves and follow it.`,
    visual: { type: 'flow', items: ['Start at the robot’s cell', 'Visit all neighbors 1 step away', 'Then all cells 2 steps away', 'Stop when the goal is reached'], alt: 'Breadth-First Search in order: start at the robot’s cell, visit all neighbors one step away, then all cells two steps away, and stop when the goal is reached.' },
    frames: ['Our grid left out… because…', 'BFS finds a shortest path because…'],
    worked: { code: `int main() {\n  int moves[3] = {12, 24, 12};\n  for (int i = 0; i < 3; i++) {\n    Drivetrain.driveFor(forward, moves[i], inches);\n    Drivetrain.turnFor(right, 90, degrees);\n  }\n  return 0;\n}`, notes: ['The array stores the route as data.', 'The loop acts on each stored value in order.', 'Changing the route means changing only the array.'] }
  },
  u3l7: {
    standards: { anchor: x('CS.a.4', 'CT.e.2'), supporting: x('CT.d.6') },
    think: 'Why do good drivers slow down before they reach a stop sign?',
    brief: `A bang-bang controller jumps between two actions, which can make a robot jerky. Proportional control is smoother because its output depends on the size of the error. The error is the difference between a target and the current reading. The formula multiplies that error by a number called Kp, or gain. When the robot is far away, the large error gives it high speed, and as it approaches, the speed gradually drops. Engineers tune Kp by testing, because a value that is too small leaves the robot slow and one that is too large makes it overshoot. Cruise control and thermostats work in a similar way.`,
    visual: { type: 'flow', loop: 'Feedback loop', items: ['Measure the distance', 'error = target - reading', 'speed = Kp * error', 'Drive at that speed'], alt: 'A feedback loop: measure the distance, calculate error as target minus reading, calculate speed as Kp times error, drive at that speed, and measure again.' },
    frames: ['When Kp was too large, the robot…', 'The best Kp we found was…, because…'],
    worked: { code: `int main() {\n  double target = 6;\n  double reading = 26;\n  double error = reading - target;\n  double speed = 2 * error;\n  Brain.Screen.print("%f", speed);\n  return 0;\n}`, notes: ['error is how far the robot still has to go.', 'Here Kp is 2, so speed is 2 times error.', 'As reading gets closer to target, error and speed shrink.'] }
  },
  u4l1: {
    standards: { anchor: x('CS.a.4', 'CT.d.4'), supporting: x('CAS.c.1', 'CS.b.1') },
    think: 'Is a machine intelligent if it only appears to be?',
    brief: `Artificial intelligence means computer systems that do tasks we connect with human judgment, such as recognizing pictures or making suggestions. Some systems follow rules written by programmers. Others use machine learning, where software finds patterns in examples and no person writes the rules. Robots add perception, which means making sense of sensor data. An autonomous robot can act without a person guiding each move, and reactive behaviors let it respond right away to what is around it. People and computers have different strengths. Computers can process huge amounts of data quickly. People bring context, common sense, and values to hard choices.`,
    visual: { type: 'compare', left: { title: 'Rule-based program', items: ['A person writes the rules', 'Does exactly what it was told', 'Example: if wall, then turn'] }, right: { title: 'Machine learning', items: ['Finds patterns in examples', 'Improves with more data', 'Example: recognizing photos'] }, alt: 'A comparison. In a rule-based program, a person writes the rules and it does exactly what it was told, such as if wall, then turn. Machine learning finds patterns in examples and improves with more data, such as recognizing photos.' },
    frames: ['I think… counts as AI because…', 'A computer is better at…, but a person is better at…'],
    worked: { code: `int main() {\n  for (int i = 0; i < 50; i++) {\n    if (DistanceSensor.objectDistance(inches) < 8) {\n      Drivetrain.turnFor(right, 45, degrees);\n    } else {\n      Drivetrain.driveFor(forward, 2, inches);\n    }\n  }\n  return 0;\n}`, notes: ['Each time through the loop is one Sense-Think-Act cycle.', 'Nobody is driving, because the program decides.', 'These are rules a person wrote, so this robot does not learn.'] }
  },
  u4l2: {
    standards: { anchor: x('CT.a.3'), supporting: x('CT.b.2', 'CT.d.4') },
    think: 'What makes one question more useful than another?',
    brief: `A decision tree sorts things by asking a series of questions, and each answer narrows the choices. The first question is the root, each branch is an answer, and each leaf holds a final label. The properties being checked are called features. Designers try to put the most useful questions near the top, because a good first question shortens every path below it. Decision trees are easier to understand than many other kinds of AI, since anyone can follow the path to a result. They also turn neatly into nested if statements, which links the idea of sorting to the code you already know.`,
    visual: { type: 'tree', q: 'Is the tile bright?', yes: 'Label: sand', no: { q: 'Is it red?', yes: 'Label: rock', no: 'Label: shadow' }, alt: 'A decision tree. If the tile is bright, label it sand. If not, ask whether it is red. If red, label it rock. If not, label it shadow.' },
    frames: ['The most useful question in our tree was…, because…', 'Our tree made a mistake when…'],
    worked: { code: `string label(int brightness) {\n  if (brightness > 70) {\n    return "sand";\n  } else if (brightness > 30) {\n    return "rock";\n  }\n  return "shadow";\n}\n\nint main() {\n  Brain.Screen.print("%s", label(50));\n  return 0;\n}`, notes: ['Each if is one question in the tree.', 'return gives the leaf’s label back.', 'Trace it with 50: the first test fails and the second passes.'] }
  },
  u4l3: {
    standards: { anchor: x('CT.d.3', 'CT.e.1'), supporting: x('CT.b.1') },
    think: 'How does a robot remember what it is in the middle of doing?',
    brief: `Some robot behaviors depend on what the robot is doing right now, as well as on what it senses. A finite state machine handles this by listing a small set of states and the changes between them. A traffic light is a familiar example. It is in one state at a time, and a timer triggers each change. Engineers often draw state diagrams before they write code, with circles for states and arrows for changes. The diagram is a model that keeps what matters and leaves out the rest. In a program, a variable remembers the current state, and a switch statement picks the right actions.`,
    visual: { type: 'flow', items: ['SEARCH: turn and look', 'APPROACH: drive to the target', 'DONE: stop and signal'], alt: 'A state diagram with three states. Search, where the robot turns and looks, changes to Approach, where it drives to the target, which changes to Done, where it stops and signals.' },
    frames: ['The states of my robot are…', 'The robot changes from… to… when…'],
    worked: { code: `int main() {\n  int state = 0;\n  for (int i = 0; i < 3; i++) {\n    switch (state) {\n      case 0:\n        Brain.Screen.print("Searching");\n        state = 1;\n        break;\n      case 1:\n        Brain.Screen.print("Done");\n        break;\n    }\n  }\n  return 0;\n}`, notes: ['state remembers which part of the job is happening.', 'Changing state is a transition.', 'break ends the current case.'] }
  },
  u4l4: {
    standards: { anchor: x('CT.c.5'), supporting: x('CS.a.6', 'CS.b.2') },
    think: 'How could you know whether a system really learned or just memorized?',
    brief: `Machine learning systems build models from data. In one common method, each training example has features, which are things you can measure, and a label, which is the right answer. The computer searches those examples for a pattern that links the features to the labels. You cannot fairly judge a model with the same examples it studied. A student who has seen the exact test questions may not really understand the topic. So developers save separate test data and work out the accuracy, the percentage of correct predictions. Good data matters as much as a lot of data, because bad examples teach the wrong patterns.`,
    visual: { type: 'flow', items: ['Collect data', 'Add labels', 'Train on some data', 'Test on new data', 'Measure accuracy'], alt: 'The machine learning process in order: collect data, add labels, train on some of the data, test on new data, and measure accuracy.' },
    frames: ['Our features were… and our labels were…', 'We kept separate test data because…'],
    worked: { code: `int main() {\n  int correct = 0;\n  int guesses[4] = {1, 0, 1, 1};\n  int answers[4] = {1, 0, 0, 1};\n  for (int i = 0; i < 4; i++) {\n    if (guesses[i] == answers[i]) {\n      correct++;\n    }\n  }\n  Brain.Screen.print("%d of 4", correct);\n  return 0;\n}`, notes: ['Compare each guess with the correct answer.', 'correct counts how many matched.', 'Accuracy here is 3 out of 4, or 75 percent.'] }
  },
  u4l5: {
    standards: { anchor: x('CT.d.6', 'CT.b.1'), supporting: x('CT.c.5') },
    think: 'How do you get better at something nobody can explain to you?',
    brief: `Not every skill can be taught with labeled examples. In reinforcement learning, a system tries an action, gets a score, and slowly favors whatever earns better scores. The score might reward reaching a target or take away points for being far from it. Hill climbing is a related method. A program changes a value slightly and keeps the change if the result gets better, like walking uphill in fog by testing each step. This method has limits, since a small hill can be mistaken for the tallest one. Trial and error also wears out real machines, so engineers often train robots in a simulation first.`,
    visual: { type: 'flow', loop: 'Try again with a new option', items: ['Try an option', 'Measure the score', 'Better than the best so far?', 'Remember the best'], alt: 'A learning cycle: try an option, measure the score, check whether it is better than the best so far, remember the best, and try again with a new option.' },
    frames: ['The robot improved when…', 'I measured success by…'],
    worked: { code: `int main() {\n  int scores[3] = {40, 75, 60};\n  int best = 0;\n  for (int i = 1; i < 3; i++) {\n    if (scores[i] > scores[best]) {\n      best = i;\n    }\n  }\n  Brain.Screen.print("Best try: %d", best);\n  return 0;\n}`, notes: ['Each number is the score from one attempt.', 'best remembers the position of the top score.', 'A learning loop would try the best option next time.'] }
  },
  u4l6: {
    standards: { anchor: x('CAS.c.1'), supporting: x('CAS.c.3', 'CT.e.2') },
    think: 'Who should be responsible when an automated decision harms someone?',
    brief: `Computer systems can seem fair, but they carry the assumptions of the people who built them. When training data leaves out certain groups or situations, a model may work well for some people and poorly for others. This problem is called bias, and it has appeared in face recognition and hiring tools. Better data can reduce bias, but it cannot settle every question of right and wrong. Accountability asks who must answer for a harmful result. Transparency asks whether people can understand how a choice about them was made. Not everyone has equal access to technology, so these choices affect whole communities.`,
    visual: { type: 'compare', left: { title: 'Representative data', items: ['Includes many situations', 'Works for more people', 'Mistakes are easier to find'] }, right: { title: 'Unbalanced data', items: ['Leaves out some situations', 'Fails for some people', 'Can look accurate overall'] }, alt: 'A comparison. Representative data includes many situations, works for more people, and makes mistakes easier to find. Unbalanced data leaves out some situations, fails for some people, and can still look accurate overall.' },
    frames: ['This could be unfair to… because…', 'I think… should be responsible because…'],
    worked: { code: `int main() {\n  int groupA = 90;\n  int groupB = 50;\n  int gap = groupA - groupB;\n  if (gap > 10) {\n    Brain.Screen.print("Check for bias");\n  }\n  return 0;\n}`, notes: ['Checking one overall score can hide a problem.', 'Measure how accurate the system is for each group.', 'A large gap is a sign to review the training data.'] }
  },
  u5l1: {
    standards: { anchor: x('CT.b.3', 'CS.a.5'), supporting: x('CT.d.1', 'CT.a.2') },
    think: 'What should a team decide before anyone touches a part?',
    brief: `Engineers start with the problem, not the solution. A design brief states the goal and the constraints, which are limits such as time, materials, or safety. Teams come up with several ideas before they judge any of them. A decision matrix helps by scoring each idea on the same criteria, so a group picks a design for clear reasons and does not just follow its loudest member. Next, the team divides its big goal into smaller goals. In code, a function stub reserves a named spot for work to finish later, which lets a team set up the whole mission before every detail exists.`,
    visual: { type: 'flow', loop: 'Improve and repeat', items: ['Ask', 'Imagine', 'Plan', 'Create', 'Test'], alt: 'The engineering design process as a cycle: ask, imagine, plan, create, test, then improve and repeat.' },
    frames: ['Our biggest constraint is…', 'We chose this design because it scored higher on…'],
    worked: { code: `void goToBase() {\n  // TODO: fill this in next\n}\n\nvoid signalDone() {\n  Brain.Screen.print("Done");\n}\n\nint main() {\n  goToBase();\n  signalDone();\n  return 0;\n}`, notes: ['goToBase is a stub: it has a name but no work yet.', 'The program still runs, so you can test its structure.', 'Fill in one stub at a time and test after each.'] }
  },
  u5l2: {
    standards: { anchor: x('CT.d.6', 'CS.a.5'), supporting: x('CT.d.4', 'CS.a.7') },
    think: 'How does a failed test move a project forward?',
    brief: `Few complex systems work on the first try, so engineers plan to test again and again. In iterative work, a team changes one thing, watches what happens, and writes it down. If you change several things at once, you cannot tell which change mattered. A testing log keeps this evidence and stops a team from repeating ideas that failed. Debugging tools help you find faults. Print statements show the values inside your program. Explaining your code out loud, called rubber duck debugging, often reveals a wrong idea. Teams should also test edge cases, the unusual conditions where hidden problems tend to appear.`,
    visual: { type: 'flow', loop: 'Repeat until it works', items: ['Change one thing', 'Test it', 'Write down what happened', 'Decide what is next'], alt: 'A testing cycle: change one thing, test it, write down what happened, decide what is next, and repeat until it works.' },
    frames: ['Our test showed that…, so next we…', 'The hardest bug was…, and we found it by…'],
    worked: { code: `int main() {\n  double start = 22;\n  std::cout << "Driving " << start << std::endl;\n  Drivetrain.driveFor(forward, start, inches);\n  std::cout << "Arrived" << std::endl;\n  return 0;\n}`, notes: ['Printing before a step shows the value being used.', 'Printing after a step shows that the program got that far.', 'Remove extra prints once the bug is fixed.'] }
  },
  u5l3: {
    standards: { anchor: x('CS.a.5'), supporting: x('DTC.b.1', 'CT.d.2') },
    think: 'What does your audience need to know in order to understand your work?',
    brief: `Sharing results is part of an engineer's job, since an invention helps no one if others cannot understand or trust it. A strong demonstration states the problem, shows the solution, and explains one important choice. It also admits what did not work, because explaining a failure can show as much understanding as a perfect run. Good feedback is specific and useful. In place of general praise, a reviewer names one strength and suggests one change. Reflection finishes the process by linking what happened with what comes next. Engineers who look back at their own choices carry those lessons into new projects, and that is how skill grows.`,
    visual: { type: 'compare', left: { title: 'Glow', items: ['Name a specific strength', 'Say why it worked', '"Your claw grip never slipped."'] }, right: { title: 'Grow', items: ['Suggest one specific change', 'Be kind and useful', '"Try slowing down before the turn."'] }, alt: 'A comparison of feedback types. A glow names a specific strength and says why it worked. A grow suggests one specific change in a kind and useful way.' },
    frames: ['What I can do now that I could not do before is…', 'The feedback that helped most was…, because…'],
    worked: { code: `void spin() {\n  for (int i = 0; i < 2; i++) {\n    Drivetrain.turnFor(right, 180, degrees);\n  }\n}\n\nint main() {\n  spin();\n  Brain.Screen.print("Ta-da!");\n  return 0;\n}`, notes: ['The function packages the whole spin under one name.', 'Two 180-degree turns add up to one full circle.', 'During your demo, explain one part of your code like this.'] }
  }
};
