// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

// ##########################
// #    IMPORT Components   #
// ##########################

export interface fillBlankExerciseType extends mongoose.Document {
    unitLesson: string;
    questions: Question[];
}

export interface Question {
    sentence: string;
    correctAnswers: string[];
    otherAnswers: string[];
}

const fillBlankExerciseSchema = new Schema({
    unitLesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'UnitLesson',
        require: true,
    },
    questions: [
        {
            sentence: {
                type: String,
                required: true,
            },
            correctAnswer: {
                type: [String],
                required: true,
            },
            otherAnswer: {
                type: [String],
            },
        },
    ],
});

const FillBlankExercise = mongoose.model<fillBlankExerciseType>('FillBlankExercise', fillBlankExerciseSchema);

export default FillBlankExercise;
