import { collection, getDocs } from "firebase/firestore";
import { db } from "./fb/firestore";

export default async function() {
  try {
    const querySnapshot = await getDocs(collection(db, "languages"));
    let languages = [];
    querySnapshot.forEach((doc) => {
      languages.push([doc.id, doc.data()]);
    });
    return languages;
  } catch (e) {
    throw e;
  }
} 