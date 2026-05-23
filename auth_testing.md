# Auth Testing Playbook (Google Auth via Emergent)

(Saved from integration playbook for reference. Do not delete — testing agent reads this file.)

## Quick Test Flow

Create a test user + session in MongoDB:
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Endpoints
- GET `/api/auth/me` — returns current user from cookie or `Authorization: Bearer <session_token>`
- POST `/api/auth/session` — exchanges Emergent `session_id` → backend session (sets httpOnly cookie)
- POST `/api/auth/logout` — clears cookie

## Notes
- session_token cookie: httpOnly, secure, samesite="none", path="/"
- 7-day expiry, refreshed on session exchange
- Always exclude `_id` with `{"_id": 0}` projection
