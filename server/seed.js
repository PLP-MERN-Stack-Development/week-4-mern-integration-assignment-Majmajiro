import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany();
    await User.deleteMany();
    await Post.deleteMany();

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Technology' },
      { name: 'Health' },
      { name: 'Lifestyle' },
    ]);

    // Create Users
    const users = await User.insertMany([
      { name: 'Alice Doe', email: 'alice@example.com' },
      { name: 'Bob Smith', email: 'bob@example.com' },
    ]);

    // Create Posts
    const posts = await Post.insertMany([
      {
        title: 'The Future of AI',
        content: 'Artificial Intelligence is transforming the world...',
        author: users[0]._id,
        category: categories[0]._id,
        excerpt: 'AI is changing everything...',
        slug: 'the-future-of-ai',
        isPublished: true,
        tags: ['AI', 'future'],
      },
      {
        title: 'Healthy Eating Habits',
        content: 'Nutrition is key to a healthy life...',
        author: users[1]._id,
        category: categories[1]._id,
        excerpt: 'Tips for a healthy lifestyle...',
        slug: 'healthy-eating-habits',
        isPublished: true,
        tags: ['health', 'nutrition'],
      },
    ]);

    console.log('✅ Seed data created successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
};

seed();
