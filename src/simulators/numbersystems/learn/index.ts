/**
 * Learn Modules - Exports
 */

// Decimal Learn Module
export { DecimalLearnModule } from './DecimalLearnModule'
export { DecimalLearnLayout } from './DecimalLearnLayout'

// Binary Learn Module
export { BinaryLearnModule } from './binary/BinaryLearnModule'
export { BinaryLearnLayout } from './binary/BinaryLearnLayout'

// Octal Learn Module
export { OctalLearnModule } from './octal/OctalLearnModule'
export { OctalLearnLayout } from './octal/OctalLearnLayout'

// Shared Components
export { DigitCard } from './components/DigitCard'
export { ProgressIndicator } from './components/ProgressIndicator'
export { LessonSidebar } from './components/LessonSidebar'
export { LessonHeader } from './components/LessonHeader'
export { LessonNavigation } from './components/LessonNavigation'

// Decimal Lessons
export { Lesson1_WhatIsDecimal } from './lessons/Lesson1_WhatIsDecimal'
export { Lesson2_WhyBase10 } from './lessons/Lesson2_WhyBase10'
export { Lesson3_PositionalSystem } from './lessons/Lesson3_PositionalSystem'
export { Lesson4_UnderstandingPosition } from './lessons/Lesson4_UnderstandingPosition'
export { Lesson5_PlaceValue } from './lessons/Lesson5_PlaceValue'
export { LessonFinal_GotIt } from './lessons/LessonFinal_GotIt'

// Binary Lessons
export { Lesson1_WhatIsBinary } from './binary/lessons/Lesson1_WhatIsBinary'
export { Lesson2_WhyBase2 } from './binary/lessons/Lesson2_WhyBase2'
export { Lesson3_PositionalSystem as BinaryLesson3_PositionalSystem } from './binary/lessons/Lesson3_PositionalSystem'
export { Lesson4_UnderstandingPosition as BinaryLesson4_UnderstandingPosition } from './binary/lessons/Lesson4_UnderstandingPosition'
export { Lesson5_ChallengeMode } from './binary/lessons/Lesson5_ChallengeMode'
export { LessonFinal_GotIt as BinaryLessonFinal_GotIt } from './binary/lessons/LessonFinal_GotIt'

// Octal Lessons
export { Lesson1_WhatIsOctal } from './octal/lessons/Lesson1_WhatIsOctal'
export { Lesson2_WhyBase8 } from './octal/lessons/Lesson2_WhyBase8'
export { Lesson3_PositionalSystem as OctalLesson3_PositionalSystem } from './octal/lessons/Lesson3_PositionalSystem'
export { Lesson4_UnderstandingPosition as OctalLesson4_UnderstandingPosition } from './octal/lessons/Lesson4_UnderstandingPosition'
export { Lesson5_ChallengeMode as OctalLesson5_ChallengeMode } from './octal/lessons/Lesson5_ChallengeMode'
export { LessonFinal_GotIt as OctalLessonFinal_GotIt } from './octal/lessons/LessonFinal_GotIt'

// Decimal Types
export type { LessonNumber, Lesson, LessonProgress } from './types/lesson.types'
export type { Lesson1State, Lesson2State, Lesson3State, Lesson4State, Lesson5State, FinalState } from './types/lesson.types'

// Binary Types
export type { LessonNumber as BinaryLessonNumber, Lesson as BinaryLesson, LessonProgress as BinaryLessonProgress } from './binary/types/lesson.types'
export type { Lesson1State as BinaryLesson1State, Lesson2State as BinaryLesson2State, Lesson3State as BinaryLesson3State, Lesson4State as BinaryLesson4State, Lesson5State as BinaryLesson5State, FinalState as BinaryFinalState } from './binary/types/lesson.types'

// Octal Types
export type { LessonNumber as OctalLessonNumber, Lesson as OctalLesson, LessonProgress as OctalLessonProgress } from './octal/types/lesson.types'
export type { Lesson1State as OctalLesson1State, Lesson2State as OctalLesson2State, Lesson3State as OctalLesson3State, Lesson4State as OctalLesson4State, Lesson5State as OctalLesson5State, FinalState as OctalFinalState } from './octal/types/lesson.types'
