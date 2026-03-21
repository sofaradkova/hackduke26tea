import type { AIFlag, ClassData, Student } from '@/lib/types'
import { generateWhiteboardSvg } from '@/lib/whiteboard-thumbnails'

function makeFlag(
  id: string,
  reason: string,
  category: AIFlag['category'],
  highlights: string[] = [],
): AIFlag {
  return {
    id,
    reason,
    category,
    confidenceScore: 0.85,
    triggeredAt: new Date(),
    confusionHighlights: highlights,
  }
}

function makeStudent(
  id: string,
  name: string,
  problemSet: string,
  progress: number,
  flag: AIFlag | null = null,
): Student {
  return {
    id,
    name,
    avatarUrl: null,
    thumbnailUrl: generateWhiteboardSvg(id, problemSet, progress, flag !== null),
    status: flag ? 'flagged' : 'ok',
    currentFlag: flag,
    problemSetTitle: problemSet,
    progressPercent: progress,
    lastCheckedAt: new Date(),
  }
}

const algebraStudents: readonly Student[] = [
  makeStudent('a1', 'Jamie Chen', 'Quadratic Equations', 45, makeFlag('f1', 'Off track: wrong formula applied in step 2', 'wrong-approach', ['Step 2: Used linear formula instead of quadratic'])),
  makeStudent('a2', 'Sam Park', 'Quadratic Equations', 72),
  makeStudent('a3', 'Maria Rodriguez', 'Quadratic Equations', 30, makeFlag('f2', 'Stuck: no progress for 3 minutes', 'stuck', ['Has not moved past step 1'])),
  makeStudent('a4', 'Alex Kim', 'Quadratic Equations', 88),
  makeStudent('a5', 'Taylor Swift', 'Quadratic Equations', 55),
  makeStudent('a6', 'Jordan Lee', 'Quadratic Equations', 62),
  makeStudent('a7', 'Casey Martinez', 'Quadratic Equations', 40),
  makeStudent('a8', 'Riley Johnson', 'Quadratic Equations', 95),
  makeStudent('a9', 'Morgan Davis', 'Quadratic Equations', 20, makeFlag('f3', 'Off topic: solving wrong problem', 'off-topic', ['Working on problem 3 instead of problem 5'])),
  makeStudent('a10', 'Quinn Thompson', 'Quadratic Equations', 78),
  makeStudent('a11', 'Drew Wilson', 'Quadratic Equations', 50),
  makeStudent('a12', 'Avery Brown', 'Quadratic Equations', 67),
  makeStudent('a13', 'Reese Garcia', 'Quadratic Equations', 35),
  makeStudent('a14', 'Charlie Anderson', 'Quadratic Equations', 82),
  makeStudent('a15', 'Peyton Thomas', 'Quadratic Equations', 43),
]

const physicsStudents: readonly Student[] = [
  makeStudent('p1', 'Emma Watson', 'Newton\'s Laws Lab', 60),
  makeStudent('p2', 'Liam Patel', 'Newton\'s Laws Lab', 45),
  makeStudent('p3', 'Sophia Nguyen', 'Newton\'s Laws Lab', 80),
  makeStudent('p4', 'Noah Clark', 'Newton\'s Laws Lab', 25, makeFlag('f4', 'Calculation error: unit conversion wrong', 'calculation-error', ['Converting kg to g incorrectly'])),
  makeStudent('p5', 'Olivia Singh', 'Newton\'s Laws Lab', 70),
  makeStudent('p6', 'Ethan Moore', 'Newton\'s Laws Lab', 55),
  makeStudent('p7', 'Ava Taylor', 'Newton\'s Laws Lab', 90),
  makeStudent('p8', 'Lucas White', 'Newton\'s Laws Lab', 35),
  makeStudent('p9', 'Mia Harris', 'Newton\'s Laws Lab', 65),
  makeStudent('p10', 'James Martin', 'Newton\'s Laws Lab', 50),
  makeStudent('p11', 'Isabella Robinson', 'Newton\'s Laws Lab', 42),
  makeStudent('p12', 'Benjamin Lewis', 'Newton\'s Laws Lab', 78),
]

const englishStudents: readonly Student[] = [
  makeStudent('e1', 'Zoe Walker', 'Essay Analysis: Hamlet', 55),
  makeStudent('e2', 'Nathan Hall', 'Essay Analysis: Hamlet', 70),
  makeStudent('e3', 'Lily Allen', 'Essay Analysis: Hamlet', 40, makeFlag('f5', 'Off track: thesis doesn\'t address prompt', 'wrong-approach', ['Thesis statement is about Macbeth, not Hamlet'])),
  makeStudent('e4', 'Owen Young', 'Essay Analysis: Hamlet', 85),
  makeStudent('e5', 'Chloe King', 'Essay Analysis: Hamlet', 30),
  makeStudent('e6', 'Daniel Wright', 'Essay Analysis: Hamlet', 60),
  makeStudent('e7', 'Grace Scott', 'Essay Analysis: Hamlet', 75),
  makeStudent('e8', 'Henry Adams', 'Essay Analysis: Hamlet', 50),
  makeStudent('e9', 'Ella Baker', 'Essay Analysis: Hamlet', 88),
  makeStudent('e10', 'Jack Nelson', 'Essay Analysis: Hamlet', 22),
]

const csStudents: readonly Student[] = [
  makeStudent('c1', 'Ruby Chen', 'Sorting Algorithms', 65),
  makeStudent('c2', 'Leo Fernandez', 'Sorting Algorithms', 80),
  makeStudent('c3', 'Hannah Kim', 'Sorting Algorithms', 45),
  makeStudent('c4', 'Oscar Dubois', 'Sorting Algorithms', 55, makeFlag('f6', 'Stuck: infinite loop in merge sort', 'stuck', ['Code has been running for 2+ minutes'])),
  makeStudent('c5', 'Maya Johnson', 'Sorting Algorithms', 92),
  makeStudent('c6', 'Finn O\'Brien', 'Sorting Algorithms', 38),
  makeStudent('c7', 'Iris Park', 'Sorting Algorithms', 70),
  makeStudent('c8', 'Kai Tanaka', 'Sorting Algorithms', 58),
  makeStudent('c9', 'Luna Morales', 'Sorting Algorithms', 42),
  makeStudent('c10', 'Max Rivera', 'Sorting Algorithms', 85),
  makeStudent('c11', 'Nina Volkov', 'Sorting Algorithms', 50),
  makeStudent('c12', 'Ravi Sharma', 'Sorting Algorithms', 73),
  makeStudent('c13', 'Sophie Laurent', 'Sorting Algorithms', 28),
]

export const MOCK_CLASSES: readonly ClassData[] = [
  {
    id: 'class-algebra',
    name: 'Algebra II — Period 3',
    subject: 'Mathematics',
    studentCount: algebraStudents.length,
    students: algebraStudents,
  },
  {
    id: 'class-physics',
    name: 'AP Physics — Period 5',
    subject: 'Science',
    studentCount: physicsStudents.length,
    students: physicsStudents,
  },
  {
    id: 'class-english',
    name: 'English Literature — Period 2',
    subject: 'English',
    studentCount: englishStudents.length,
    students: englishStudents,
  },
  {
    id: 'class-cs',
    name: 'Intro to CS — Period 7',
    subject: 'Computer Science',
    studentCount: csStudents.length,
    students: csStudents,
  },
]
