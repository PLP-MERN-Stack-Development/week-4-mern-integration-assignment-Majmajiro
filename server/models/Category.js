import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional: Only if you want to track who created it
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
