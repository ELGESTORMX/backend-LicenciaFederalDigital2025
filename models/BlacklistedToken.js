import { Schema, model } from 'mongoose';

const schema = new Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default model('BlacklistedToken', schema);
