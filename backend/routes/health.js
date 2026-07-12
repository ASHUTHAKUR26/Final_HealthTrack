const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  SleepLog, NutritionLog, ActivityLog, SymptomLog, SkinLog, MoodLog,
} = require('../models/HealthLog');

const router = express.Router();
router.use(protect);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcConsistencyScore(logs, days = 7) {
  if (!logs.length) return 0;
  return Math.round(Math.min(logs.length / days, 1) * 100);
}

function calcStreak(logs) {
  if (!logs.length) return 0;
  const dates = [...new Set(
    logs.map(l => new Date(l.date).toDateString())
  )].map(d => new Date(d)).sort((a, b) => a - b);

  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastDate  = dates[dates.length - 1].toDateString();
  if (lastDate !== today && lastDate !== yesterday) return 0;

  let streak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const diff = (dates[i] - dates[i - 1]) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// Strip emojis and extra spaces from meal type strings
function cleanMealType(raw) {
  if (!raw) return 'Snack';
  // Remove all emoji characters and trim whitespace
  const cleaned = raw.replace(/[\u{1F300}-\u{1FFFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE00}-\u{FE0F}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}]/gu, '').trim();
  const valid = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  // Match cleaned string to a valid type (case-insensitive)
  const match = valid.find(v => cleaned.toLowerCase() === v.toLowerCase());
  return match || cleaned || 'Snack';
}

function getSymptomSuggestion(domain, symptom) {
  const rules = {
    Skin: {
      acne:        'Consider reducing dairy and sugar intake. Maintain a consistent skincare routine.',
      dryness:     'Increase water intake and apply moisturizer twice daily.',
      redness:     'Avoid harsh cleansers. Try aloe vera or calamine lotion.',
      default:     'Monitor your symptoms. Consult a dermatologist if persistent.',
    },
    Gut: {
      bloating:     'Try smaller, frequent meals. Avoid carbonated drinks.',
      constipation: 'Increase fiber and water intake. Regular walking helps.',
      nausea:       'Eat light bland foods. Ginger tea may help reduce nausea.',
      default:      'Track your meals for patterns. Consider a probiotic supplement.',
    },
    Stress: {
      anxiety:  'Practice deep breathing exercises. Limit caffeine after 2 PM.',
      headache: 'Stay hydrated and rest. Try a cold/warm compress on your forehead.',
      default:  'Try 10-min mindfulness meditation daily. Maintain a consistent sleep schedule.',
    },
    Sleep: {
      insomnia:     'Avoid screens 1 hour before bed. Keep a consistent sleep and wake time.',
      oversleeping: 'Set a fixed wake-up alarm. Avoid sleeping more than 9 hours regularly.',
      default:      'Aim for 7–9 hours. Track your sleep patterns for insights.',
    },
    Other: {
      default: 'Log consistently to identify patterns. Consult a healthcare provider if symptoms persist.',
    },
  };
  const domainRules = rules[domain] || rules.Other;
  const s = (symptom || '').toLowerCase();
  for (const key of Object.keys(domainRules)) {
    if (key !== 'default' && s.includes(key)) return domainRules[key];
  }
  return domainRules.default;
}

// ─── SLEEP ────────────────────────────────────────────────────────────────────
router.post('/sleep', async (req, res) => {
  try {
    const entry = await SleepLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/sleep', async (req, res) => {
  const logs = await SleepLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ status: 'success', count: logs.length, data: logs });
});

// ─── NUTRITION ────────────────────────────────────────────────────────────────
router.post('/nutrition', async (req, res) => {
  try {
    const { meals, waterIntake, nutritionRating } = req.body;

    // Clean meals — strip emojis from mealType, map type → mealType
    const cleanedMeals = (meals || []).map(m => ({
      mealType:    cleanMealType(m.type || m.mealType),
      description: m.description || '',
      calories:    m.calories ? Number(m.calories) : undefined,
    }));

    const entry = await NutritionLog.create({
      user: req.user._id,
      meals: cleanedMeals,
      waterIntake: waterIntake ? Number(waterIntake) : 0,
      nutritionRating: nutritionRating ? Number(nutritionRating) : 3,
    });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) {
    console.error('Nutrition save error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.get('/nutrition', async (req, res) => {
  try {
    const logs = await NutritionLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
    // Map mealType back to type for frontend compatibility
    const mapped = logs.map(log => ({
      ...log.toObject(),
      meals: (log.meals || []).map(m => ({
        ...m,
        type: m.mealType || m.type,
      })),
    }));
    res.json({ status: 'success', count: logs.length, data: mapped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ACTIVITY ─────────────────────────────────────────────────────────────────
router.post('/activity', async (req, res) => {
  try {
    const entry = await ActivityLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/activity', async (req, res) => {
  const logs = await ActivityLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ status: 'success', count: logs.length, data: logs });
});

// ─── SYMPTOMS ─────────────────────────────────────────────────────────────────
router.post('/symptoms', async (req, res) => {
  try {
    const suggestion = getSymptomSuggestion(req.body.domain, req.body.symptom);
    const entry = await SymptomLog.create({ ...req.body, suggestion, user: req.user._id });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/symptoms', async (req, res) => {
  const logs = await SymptomLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ status: 'success', count: logs.length, data: logs });
});

// ─── SKIN ─────────────────────────────────────────────────────────────────────
router.post('/skin', async (req, res) => {
  try {
    const entry = await SkinLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/skin', async (req, res) => {
  const logs = await SkinLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ status: 'success', count: logs.length, data: logs });
});

// ─── MOOD ─────────────────────────────────────────────────────────────────────
router.post('/mood', async (req, res) => {
  try {
    const entry = await MoodLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/mood', async (req, res) => {
  const logs = await MoodLog.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ status: 'success', count: logs.length, data: logs });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const uid   = req.user._id;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [sleepLogs, nutritionLogs, activityLogs, moodLogs, symptomLogs, allSleepLogs] =
      await Promise.all([
        SleepLog.find({ user: uid, date: { $gte: since } }).sort({ date: 1 }),
        NutritionLog.find({ user: uid, date: { $gte: since } }),
        ActivityLog.find({ user: uid, date: { $gte: since } }),
        MoodLog.find({ user: uid, date: { $gte: since } }).sort({ date: 1 }),
        SymptomLog.find({ user: uid, date: { $gte: since } }),
        SleepLog.find({ user: uid }).sort({ date: 1 }),
      ]);

    const sleepStreak = calcStreak(allSleepLogs);
    const avgSleep = sleepLogs.length
      ? (sleepLogs.reduce((s, l) => s + l.duration, 0) / sleepLogs.length).toFixed(1) : 0;
    const avgMood = moodLogs.length
      ? (moodLogs.reduce((s, l) => s + l.moodRating, 0) / moodLogs.length).toFixed(1) : 0;

    res.json({
      status: 'success',
      data: {
        weekSummary: {
          avgSleepHours:        Number(avgSleep),
          avgMoodRating:        Number(avgMood),
          sleepConsistency:     calcConsistencyScore(sleepLogs),
          nutritionConsistency: calcConsistencyScore(nutritionLogs),
          activeDays:           activityLogs.length,
          symptomsLogged:       symptomLogs.length,
          sleepStreak,
        },
        charts: {
          sleep: sleepLogs.map(l => ({ date: l.date, hours: l.duration, quality: l.quality })),
          mood:  moodLogs.map(l  => ({ date: l.date, mood: l.moodRating, stress: l.stressLevel })),
        },
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const uid = req.user._id;

    const [sleepCount, nutritionCount, activityCount, moodCount, symptomCount, skinCount] =
      await Promise.all([
        SleepLog.countDocuments({ user: uid }),
        NutritionLog.countDocuments({ user: uid }),
        ActivityLog.countDocuments({ user: uid }),
        MoodLog.countDocuments({ user: uid }),
        SymptomLog.countDocuments({ user: uid }),
        SkinLog.countDocuments({ user: uid }),
      ]);

    const totalLogs = sleepCount + nutritionCount + activityCount + moodCount + symptomCount + skinCount;

    const [bestSleepDoc, bestWaterDoc, allSleepLogs, allMoodLogs] = await Promise.all([
      SleepLog.findOne({ user: uid }).sort({ duration: -1 }).select('duration'),
      NutritionLog.findOne({ user: uid, waterIntake: { $gt: 0 } }).sort({ waterIntake: -1 }).select('waterIntake'),
      SleepLog.find({ user: uid }).sort({ date: 1 }),
      MoodLog.find({ user: uid }).select('journal'),
    ]);

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const activeDaysThisWeek = await ActivityLog.countDocuments({ user: uid, date: { $gte: weekAgo } });

    res.json({
      status: 'success',
      data: {
        sleepCount, nutritionCount, activityCount,
        moodCount, symptomCount, skinCount, totalLogs,
        bestSleep:         bestSleepDoc?.duration  || 0,
        bestWater:         bestWaterDoc?.waterIntake || 0,
        sleepStreak:       calcStreak(allSleepLogs),
        activeDaysThisWeek,
        journalCount:      allMoodLogs.filter(l => l.journal && l.journal.trim().length > 0).length,
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
