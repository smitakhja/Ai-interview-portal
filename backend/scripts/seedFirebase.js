import { db } from "../firebaseAdmin.js";
import { aptitudeQuestions } from "../data/aptitudeQuestions.js";
import { hrQuestions } from "../data/hrQuestions.js";
import { interviewQuestions } from "../data/interviewQuestions.js";
import { quizBank } from "../data/quizQuestions.js";

async function seedCollection(collectionName, dataArray) {
  const batch = db.batch();
  dataArray.forEach((item, index) => {
    // If the item has an ID, use it, otherwise use auto-generated ID or index
    const docId = item.id ? String(item.id) : `doc_${index}`;
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`Successfully seeded ${dataArray.length} items into '${collectionName}'`);
}

async function seedObjectMap(collectionName, dataMap) {
  const batch = db.batch();
  let count = 0;
  for (const [key, arrayData] of Object.entries(dataMap)) {
    // Create a document for each key (e.g. role or topic)
    const docRef = db.collection(collectionName).doc(key);
    batch.set(docRef, { questions: arrayData });
    count += arrayData.length;
  }
  await batch.commit();
  console.log(`Successfully seeded ${count} questions across ${Object.keys(dataMap).length} categories into '${collectionName}'`);
}

async function runSeeder() {
  console.log("Starting Firebase Seeding Process...");
  try {
    if (!db) {
      throw new Error("Firestore DB instance not found. Did you configure FIREBASE_SERVICE_ACCOUNT in your .env?");
    }

    // Seed Aptitude
    if (aptitudeQuestions && aptitudeQuestions.length > 0) {
      await seedCollection("aptitude", aptitudeQuestions);
    }

    // Seed HR
    if (hrQuestions && hrQuestions.length > 0) {
      await seedCollection("hr", hrQuestions);
    }

    // Seed Quizzes (quizBank is an object where keys are topics)
    if (quizBank && Object.keys(quizBank).length > 0) {
      await seedObjectMap("quizzes", quizBank);
    }

    // Seed Interviews (interviewQuestions is an object where keys are roles)
    if (interviewQuestions && Object.keys(interviewQuestions).length > 0) {
      await seedObjectMap("interviews", interviewQuestions);
    }

    console.log("Seeding complete! You can now use Firebase for your questions.");
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err.message);
    process.exit(1);
  }
}

runSeeder();
