# Firebase Config (`firebase/`)

Firebase configuration files for Trailblazer+.

## Structure

```
firebase/
├── firestore.indexes.json   # Composite indexes for Firestore queries
├── firestore.rules          # Security rules for Firestore
└── CLAUDE.md                # This file
```

Note: `firebase.json` is in the project root (Firebase CLI requirement).

## Deployment

```bash
# Deploy everything
firebase deploy

# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only functions
firebase deploy --only functions
```

## Firestore Security Rules

The rules in `firestore.rules` enforce:
- Users can only read/write their own data (`/users/{userId}/**`)
- Authenticated access for conversations
- No client access to webhook queue (Cloud Functions only)

## Indexes

`firestore.indexes.json` contains required composite indexes:
- `stravaConnection.athleteId` on `users` collection (for webhook athlete lookup)

## Adding New Indexes

If you get a Firestore error about missing indexes:
1. The error message includes a link to create the index in Console
2. Or add manually to `firestore.indexes.json` and deploy
