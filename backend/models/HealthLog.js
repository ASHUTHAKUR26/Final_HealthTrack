const mongoose = require('mongoose');

// ─── Sleep Log ────────────────────────────────────────────────────────────────
const sleepLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, required: true },
  bedtime: String,
  wakeTime: String,
  quality: { type: Number, min: 1, max: 5 },
  consistencyScore: Number,
});

// ─── Nutrition Log ────────────────────────────────────────────────────────────
const mealSchema = new mongoose.Schema({
  // No enum — backend strips emojis before saving, frontend sends clean values
  mealType:    { type: String, default: 'Snack' },
  description: String,
  calories:    Number,
}, { _id: false });

const nutritionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  meals:           [mealSchema],
  nutritionRating: { type: Number, min: 1, max: 5 },
  waterIntake:     Number,
});

// ─── Activity Log ─────────────────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  exerciseType: String,
  duration:     Number,
  intensity:    { type: String, enum: ['low', 'moderate', 'high'] },
  notes:        String,
});

// ─── Symptom Log ──────────────────────────────────────────────────────────────
const symptomLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  domain:     { type: String, enum: ['Skin', 'Gut', 'Stress', 'Sleep', 'Other'] },
  symptom:    String,
  severity:   { type: Number, min: 1, max: 5 },
  duration:   String,
  trigger:    String,
  suggestion: String,
});

// ─── Skin Log ─────────────────────────────────────────────────────────────────
const skinLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: Date, default: Date.now },
  products:   [String],
  conditions: [String],
  frequency:  String,
  notes:      String,
});

// ─── Mood Log ─────────────────────────────────────────────────────────────────
const moodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: Date, default: Date.now },
  moodRating:  { type: Number, min: 1, max: 5 },
  stressLevel: { type: Number, min: 1, max: 5 },
  journal:     String,
});

module.exports = {
  SleepLog:     mongoose.model('SleepLog',     sleepLogSchema),
  NutritionLog: mongoose.model('NutritionLog', nutritionLogSchema),
  ActivityLog:  mongoose.model('ActivityLog',  activityLogSchema),
  SymptomLog:   mongoose.model('SymptomLog',   symptomLogSchema),
  SkinLog:      mongoose.model('SkinLog',      skinLogSchema),
  MoodLog:      mongoose.model('MoodLog',      moodLogSchema),
};
