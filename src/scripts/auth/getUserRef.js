import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../fb/firestore";

export default async function getUserRef(userEmail) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    let userRef;
    querySnapshot.forEach((doc) => {
      userRef = doc.ref;
    });
    return(userRef)
  } catch (e) {
    throw (e);
  }
}