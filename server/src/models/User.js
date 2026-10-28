const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Stores a bcrypt hash, never the plain-text password.
    // select: false keeps it out of normal queries.
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Never send the password hash back to the client
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
