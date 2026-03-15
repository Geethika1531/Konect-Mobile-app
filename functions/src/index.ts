import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// 1. Cron Job: Clean up expired Micro-Events hourly
export const cleanupEvents = onSchedule('every 1 hours', async (event: any) => {
  const now = admin.firestore.Timestamp.now();
  
  const snapshot = await db.collection('events')
    .where('status', 'in', ['open', 'full'])
    .where('dateTime', '<', now)
    .get();

  if (snapshot.empty) {
    console.log('No expired events to clean up.');
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc: any) => {
    batch.update(doc.ref, { status: 'completed' });
  });

  await batch.commit();
  console.log(`Cleaned up ${snapshot.size} expired events.`);
});

// 2. Notification Hooks: Notify event creator when someone joins
export const notifyEventJoin = onDocumentUpdated('events/{eventId}', async (event: any) => {
    const change = event.data;
    if (!change) return;

    const beforeData = change.before.data();
    const afterData = change.after.data();

    const beforeAttendees = beforeData.attendees || [];
    const afterAttendees = afterData.attendees || [];

    if (afterAttendees.length > beforeAttendees.length) {
      const newAttendees = afterAttendees.filter((m: string) => !beforeAttendees.includes(m));
      if (newAttendees.length === 0) return;

      const newAttendeeId = newAttendees[0];
      const eventCreatorId = afterData.createdBy;

      if (newAttendeeId === eventCreatorId) return;

      const userDoc = await db.collection('users').doc(newAttendeeId).get();
      const userName = userDoc.exists ? userDoc.data()?.name : 'Someone';

      const tokenSnapshot = await db.collection(`users/${eventCreatorId}/pushTokens`).limit(1).get();
      if (tokenSnapshot.empty) return;

      const tokenData = tokenSnapshot.docs[0].data();
      if (!tokenData || !tokenData.token) return;
      
      const pushToken = tokenData.token;

      const message = {
        to: pushToken,
        sound: 'default',
        title: 'New Event Member! 🎉',
        body: `${userName} just joined your event: ${afterData.title}`,
        data: { eventId: event.params.eventId },
      };

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        console.log("Sent push notification for event join.");
      } catch (error) {
        console.error("Push Notification error: ", error);
      }
    }
});
