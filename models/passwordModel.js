import { Schema, model, models } from 'mongoose';

const passwordSchema = new Schema({
  username: String,
  password: {
    type: String,
    required: true,
    unique: true,
  },
});

const pass = models.pass || model('pass', passwordSchema);

export default pass;
