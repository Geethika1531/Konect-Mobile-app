const admin = require("firebase-admin");

// Initialize Firebase Admin (Make sure to export GOOGLE_APPLICATION_CREDENTIALS)
// Use emulator or service account key JSON
const serviceAccount = require("../firebase-adminsdk.json"); // Assuming placed in root

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const seedUsers = [
  {
    id: "mock_user_1",
    name: "Aarav Sharma",
    age: 24,
    genderIdentity: "Man",
    pronouns: "He/Him",
    sexualOrientation: "Straight",
    intent: "Friendship",
    themePref: "neutral",
    isMock: true,
  },
  {
    id: "mock_user_2",
    name: "Diya Patel",
    age: 22,
    genderIdentity: "Woman",
    pronouns: "She/Her",
    sexualOrientation: "Bisexual",
    intent: "Dating",
    themePref: "lgbtq",
    isMock: true,
  },
  {
    id: "mock_user_3",
    name: "Rohan Iyer",
    age: 27,
    genderIdentity: "Non-binary",
    pronouns: "They/Them",
    sexualOrientation: "Queer",
    intent: "Networking",
    themePref: "lgbtq",
    isMock: true,
  },
  {
    id: "mock_user_4",
    name: "Priya Singh",
    age: 25,
    genderIdentity: "Woman",
    pronouns: "She/Her",
    sexualOrientation: "Straight",
    intent: "Friendship",
    themePref: "neutral",
    isMock: true,
  }
];

const seedEvents = [
  {
    title: "Chai & Conversations ☕",
    category: "coffee",
    description: "Let's meet at Indian Coffee House, Church Street. Talk about life, tech, or just chill.",
    location: { name: "Indian Coffee House, Church Street", coordinates: new admin.firestore.GeoPoint(12.975, 77.60) },
    dateTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 86400000)), // tomorrow
    maxAttendees: 6,
    attendees: ["mock_user_1", "mock_user_2"],
    createdBy: "mock_user_1",
    tags: ["chai", "bangalore", "conversations"],
    status: "open",
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    title: "Marine Drive Sunset Walk 🌅",
    category: "sports",
    description: "Evening walk along Marine Drive. Great for fitness and making new friends.",
    location: { name: "Marine Drive, Mumbai", coordinates: new admin.firestore.GeoPoint(18.944, 72.823) },
    dateTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 172800000)), // day after tomorrow
    maxAttendees: 15,
    attendees: ["mock_user_4"],
    createdBy: "mock_user_4",
    tags: ["walking", "mumbai", "fitness"],
    status: "open",
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    title: "Hauz Khas Cafe Hop 🍰",
    category: "food",
    description: "Exploring the best cafes in Hauz Khas Village. Bring your appetite!",
    location: { name: "Hauz Khas Village, Delhi", coordinates: new admin.firestore.GeoPoint(28.553, 77.193) },
    dateTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 259200000)), // 3 days from now
    maxAttendees: 8,
    attendees: ["mock_user_2", "mock_user_3"],
    createdBy: "mock_user_2",
    tags: ["food", "delhi", "cafe"],
    status: "open",
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    title: "Gully Cricket Match 🏏",
    category: "sports",
    description: "We have a bat and ball. Need players for a friendly match at Cubbon Park.",
    location: { name: "Cubbon Park, Bangalore", coordinates: new admin.firestore.GeoPoint(12.976, 77.593) },
    dateTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 43200000)), // 12 hours from now
    maxAttendees: 10,
    attendees: ["mock_user_1", "mock_user_3", "mock_user_4"],
    createdBy: "mock_user_3",
    tags: ["cricket", "sports", "outdoor"],
    status: "open",
    createdAt: admin.firestore.Timestamp.now()
  }
];

async function seedData() {
  console.log("Starting database seeding...");
  
  try {
    const batch = db.batch();

    // 1. Seed Users
    console.log("Seeding Users...");
    for (const user of seedUsers) {
      const userRef = db.collection('users').doc(user.id);
      batch.set(userRef, user);
    }

    // 2. Seed Events
    console.log("Seeding Events...");
    for (const event of seedEvents) {
      const eventRef = db.collection('events').doc();
      batch.set(eventRef, event);
    }
    
    // Create a mock circle for demonstration
    console.log("Seeding Mock Circle...");
    const circleRef = db.collection('circles').doc();
    batch.set(circleRef, {
        name: "Bangalore Explorers",
        description: "A group of locals discovering new places.",
        createdBy: "mock_user_1",
        createdAt: admin.firestore.Timestamp.now(),
        members: ["mock_user_1", "mock_user_2", "mock_user_3"],
        admins: ["mock_user_1"]
    });

    await batch.commit();
    console.log("✅ Successfully seeded mock data!");
    
  } catch (error) {
    console.error("❌ Error seeding data: ", error);
  }
}

seedData();
