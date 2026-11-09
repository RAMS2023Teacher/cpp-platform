// Code-reading questions added to each code lesson's exit ticket: "What does this code print?"
// [program, correct output, three wrong outputs]. The test suite runs each program to confirm its answer.
const main = (...lines) => `int main() {\n  ${lines.join('\n  ')}\n  return 0;\n}`;
const P = t => `Brain.Screen.print("${t}");`, N = (v, f = '%d') => `Brain.Screen.print("${f}", ${v});`;

module.exports = {
  u1l1: [main(P('Go'), P('Bot')), 'GoBot', ['BotGo', 'Go', 'Bot']],
  u1l2: [main(P('Port '), P('1')), 'Port 1', ['1 Port', 'Port', '1']],
  u1l3: [main('// ' + P('A'), P('B')), 'B', ['A', 'AB', 'BA']],
  u1v1: [main(P('Save'), 'wait(1, seconds);', P('Run')), 'SaveRun', ['RunSave', 'Save', 'Run']],
  u1l4: [main(P('1'), 'Drivetrain.driveFor(forward, 5, inches);', P('2')), '12', ['21', '1', '2']],
  u2l1: [main('int a = 7;', 'int b = 2;', N('a / b')), '3', ['3.5', '4', '9']],
  u2l2: [main('int total = 0;', 'for (int i = 0; i < 4; i++) {', '  total = total + 2;', '}', N('total')), '8', ['2', '4', '6']],
  u2l3: [main('int x = 5;', 'if (x > 7) {', '  ' + P('A'), '} else if (x > 3) {', '  ' + P('B'), '} else {', '  ' + P('C'), '}'), 'B', ['A', 'C', 'BC']],
  u2l4: [main('int n = 0;', 'while (n < 3) {', '  n = n + 2;', '}', N('n')), '4', ['2', '3', '6']],
  u2l5: [`int twice(int n) {\n  return n * 2;\n}\n\n` + main(N('twice(3) + 1')), '7', ['4', '6', '8']],
  u3l1: [main('int steps = 0;', 'for (int i = 0; i < 3; i++) {', '  steps++;', '}', 'steps = steps + 1;', N('steps')), '4', ['1', '3', '5']],
  u3l2: [main('int threshold = (10 + 70) / 2;', 'int reading = 30;', 'if (reading < threshold) {', '  ' + P('dark'), '} else {', '  ' + P('light'), '}'), 'dark', ['light', '30', '40']],
  u3l3: [main('int a[4] = {9, 3, 7, 5};', N('a[2]')), '7', ['3', '5', '9']],
  u3l4: [main('int a = 6;', 'int b = 2;', 'if (a > b) {', '  int temp = a;', '  a = b;', '  b = temp;', '}', 'Brain.Screen.print("%d %d", a, b);'), '2 6', ['6 2', '2 2', '6 6']],
  u3l5: [main('bool goLeft = false;', 'if (goLeft) {', '  ' + P('Left'), '} else {', '  ' + P('Right'), '}'), 'Right', ['Left', 'LeftRight', 'false']],
  u3l6: [main('int moves[3] = {12, 24, 12};', 'int total = 0;', 'for (int i = 0; i < 3; i++) {', '  total = total + moves[i];', '}', N('total')), '48', ['12', '24', '36']],
  u3l7: [main('int target = 6;', 'int reading = 16;', 'int error = reading - target;', N('3 * error')), '30', ['10', '16', '48']],
  u4l1: [main('int d = 4;', 'if (d < 8) {', '  ' + P('Turn'), '} else {', '  ' + P('Drive'), '}'), 'Turn', ['Drive', 'TurnDrive', '8']],
  u4l2: [main('int b = 20;', 'if (b > 70) {', '  ' + P('sand'), '} else if (b > 30) {', '  ' + P('rock'), '} else {', '  ' + P('shadow'), '}'), 'shadow', ['sand', 'rock', '20']],
  u4l3: [main('int state = 0;', 'state = 1;', 'switch (state) {', '  case 0:', '    ' + P('A'), '    break;', '  case 1:', '    ' + P('B'), '    break;', '}'), 'B', ['A', 'AB', '1']],
  u4l4: [main('int guess[3] = {1, 0, 1};', 'int real[3] = {1, 1, 1};', 'int correct = 0;', 'for (int i = 0; i < 3; i++) {', '  if (guess[i] == real[i]) {', '    correct++;', '  }', '}', N('correct')), '2', ['0', '1', '3']],
  u4l5: [main('int s[3] = {4, 9, 6};', 'int best = s[0];', 'for (int i = 1; i < 3; i++) {', '  if (s[i] > best) {', '    best = s[i];', '  }', '}', N('best')), '9', ['4', '6', '19']],
  u4l6: [main('int groupA = 90;', 'int groupB = 60;', N('groupA - groupB')), '30', ['60', '90', '150']],
  u5l1: [`void a() {\n  ${P('A')}\n}\n\nvoid b() {\n  // TODO\n}\n\n` + main('b();', 'a();'), 'A', ['B', 'AB', 'BA']],
  u5l2: [main('int x = 3;', N('x'), 'x = x * 2;', N('x')), '36', ['33', '66', '6']],
  u5l3: [main('for (int i = 0; i < 2; i++) {', '  ' + P('Hi'), '}'), 'HiHi', ['Hi', 'HiHiHi', 'iH']]
};
