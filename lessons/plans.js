// Which lessons make up a term, and what each extra lesson needs first.
// Every plan keeps the rescue capstone. Each shorter plan is contained in the next,
// so a class can change plans without losing anyone's progress.
const ten = ['u1l1', 'u1b1', 'u1l2', 'u1l3', 'u1l4', 'u2l2', 'u2l5', 'u5l1', 'u5l2', 'u5l3'];
const twelve = [...ten, 'u2l3', 'u3l5'];
const fifteen = [...twelve, 'u1b3', 'u2l1', 'u2l4'];

module.exports = {
  plans: { 10: ten, 12: twelve, 15: fifteen },
  // Lessons outside the term's main path open once these are complete.
  prereqs: {
    u1b2: ['u1b1'], u1b3: ['u1b1'],
    u2l1: ['u1l3'], u2l3: ['u2l2'], u2l4: ['u2l3'],
    u3l1: ['u2l5'], u3l2: ['u2l4'], u3l3: ['u3l1'], u3l4: ['u3l3'], u3l5: ['u2l3', 'u2l5'], u3l6: ['u3l4'], u3l7: ['u3l2'],
    u4l1: ['u2l4'], u4l2: ['u4l1'], u4l3: ['u4l1'], u4l4: ['u4l2'], u4l5: ['u4l4'], u4l6: ['u4l4']
  }
};
