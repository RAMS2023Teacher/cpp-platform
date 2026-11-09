// Which lessons make up a term, and what each extra lesson needs first.
// Every plan includes an algorithms lesson and ends with the rescue capstone. The 12- and 15-lesson terms add AI.
// Each shorter plan is contained in the next, so a class can change plans without losing anyone's progress.
const ten = ['u1l1', 'u1b1', 'u1l2', 'u1l3', 'u1v1', 'u1l4', 'u2l2', 'u2l5', 'u3l1', 'u5l1', 'u5l2'];
const twelve = [...ten, 'u2l3', 'u4l1'];
const fifteen = [...twelve, 'u2l1', 'u2l4', 'u5l3'];

module.exports = {
  plans: { 10: ten, 12: twelve, 15: fifteen },
  // Lessons that need a team photo of the robot before they count as complete.
  photos: {
    u1b1: 'Show your finished name tag stand.',
    u1b2: 'Show your bridge and where you made it stronger.',
    u1b3: 'Show your gear tester with both gears in place.',
    u1l2: 'Show your finished BaseBot with its cables plugged in.',
    u3l5: 'Show your robot with its claw and sorting station.',
    u5l2: 'Show your finished rescue robot.'
  },
  // Whole-class events. The main path pauses after the `after` lesson until the teacher finishes the event.
  events: {
    sumo: {
      title: 'Robot Sumo', icon: '🤼', kind: 'bracket', after: 'u1l4',
      photo: 'Show your robot ready for the sumo ring.',
      rules: ['Two robots start inside a taped circle, facing each other.', 'A robot loses the round when it leaves the circle or stops moving for 10 seconds.', 'The first robot to win 2 rounds wins the match.', 'Robots may push but may not lift, trap or damage each other.', 'Your teacher will say whether robots are driven or programmed.']
    },
    maze: {
      title: 'Maze Race', icon: '⏱️', kind: 'times', after: 'u2l5',
      photo: 'Show your robot ready for the maze.',
      rules: ['Your robot runs the taped maze on its own, with no controller and no hands.', 'The timer starts at "go" and stops when the robot crosses the finish.', 'Each touch of a wall adds 5 seconds to your time.', 'You may fix your code and try again. Only your best run counts.']
    }
  },
  // Lessons outside the term's main path open once these are complete.
  prereqs: {
    u1b2: ['u1b1'], u1b3: ['u1b1'],
    u2l1: ['u1l3'], u2l3: ['u2l2'], u2l4: ['u2l3'],
    u3l1: ['u2l5'], u3l2: ['u2l4'], u3l3: ['u3l1'], u3l4: ['u3l3'], u3l5: ['u2l3', 'u2l5'], u3l6: ['u3l4'], u3l7: ['u3l2'],
    u4l1: ['u2l4'], u4l2: ['u4l1'], u4l3: ['u4l1'], u4l4: ['u4l2'], u4l5: ['u4l4'], u4l6: ['u4l4'],
    u5l3: ['u5l2']
  }
};
