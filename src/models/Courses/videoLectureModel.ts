// ##########################
// #      IMPORT NPM        #
// ##########################
import mongoose, { Schema } from 'mongoose';

// ##########################
// #    IMPORT Components   #
// ##########################

interface VideoLectureType extends mongoose.Document {
    videoUrl: string;
    totalTime: string;
    description: string;
    unitLesson: mongoose.Types.ObjectId;
}

const videoLectureSchema = new Schema({
    videoUrl: {
        type: String,
    },
    totalTime: {
        type: String,
    },
    description: {
        type: String,
    },
    unitLesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'UnitLesson',
        required: true,
    },
});

const VideoLecture = mongoose.model<VideoLectureType>('VideoLecture', videoLectureSchema);
export default VideoLecture;
