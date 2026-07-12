# Health Track System — API Reference

**Base URL:** `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "Anurag Sharma",
  "email": "anurag@example.com",
  "password": "secret123",
  "gender": "male",
  "age": 21
}
```

**Response:**
```json
{
  "status": "success",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Anurag Sharma", "email": "anurag@example.com" }
}
```

---

### POST `/auth/login`
**Body:**
```json
{ "email": "anurag@example.com", "password": "secret123" }
```

---

## Health Logs (all protected)

### GET `/health/dashboard`
Returns 7-day wellness summary + chart data.

---

### POST `/health/sleep`
```json
{
  "duration": 7.5,
  "bedtime": "23:00",
  "wakeTime": "06:30",
  "quality": 4
}
```

### GET `/health/sleep`
Returns last 30 sleep logs.

---

### POST `/health/nutrition`
```json
{
  "meals": [
    { "type": "Breakfast", "description": "Oats", "calories": 300 },
    { "type": "Lunch", "description": "Dal Rice", "calories": 600 }
  ],
  "waterIntake": 2.5,
  "nutritionRating": 4
}
```

### GET `/health/nutrition`
Returns last 30 nutrition logs.

---

### POST `/health/activity`
```json
{
  "exerciseType": "Running",
  "duration": 30,
  "intensity": "moderate"
}
```

---

### POST `/health/symptoms`
```json
{
  "domain": "Skin",
  "symptom": "acne breakout",
  "severity": 3,
  "duration": "3 days",
  "trigger": "stress"
}
```
**Returns:** Log entry with auto-generated `suggestion` field.

### GET `/health/symptoms`
Returns last 30 symptom logs with suggestions.

---

### POST `/health/mood`
```json
{
  "moodRating": 4,
  "stressLevel": 2,
  "journal": "Had a productive day, feeling good!"
}
```

### GET `/health/mood`
Returns last 30 mood logs.

---

## Error Responses
```json
{ "message": "Error description here" }
```

HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error`
