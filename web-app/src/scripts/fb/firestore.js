import { getFirestore } from "firebase/firestore";

export let db;

export function setDB(app) {
  db = getFirestore(app);
}