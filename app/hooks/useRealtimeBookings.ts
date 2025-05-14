import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";

export interface Booking {
  startTime: string;
  endTime: string;
  courtId: string;
  date: string;
}

export function useRealtimeBookings(courtId: number, date: string | null) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!date || !courtId) return;

    const q = query(
      collection(db, "bookings"),
      where("courtId", "==", courtId),
      where("date", "==", date)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updatedBookings: Booking[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updatedBookings.push({
          startTime: data.startTime,
          endTime: data.endTime,
          courtId: data.courtId,
          date: data.date,
        });
      });
      setBookings(updatedBookings);
    });

    return () => unsubscribe(); // Dừng lắng nghe khi component unmount
  }, [courtId, date]);

  return bookings;
}
