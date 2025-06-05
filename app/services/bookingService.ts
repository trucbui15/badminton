import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CourtBooking, BookingStatus, Court } from '../types/booking';

export class BookingService {
  private static COURTS_COLLECTION = 'courts';
  private static BOOKINGS_COLLECTION = 'bookings';

  static async checkCourtAvailability(
    date: string,
    startTime: string,
    endTime: string,
    courtId?: string
  ): Promise<boolean> {
    try {
      const bookingsRef = collection(db, this.BOOKINGS_COLLECTION);
      let bookingQuery = query(
        bookingsRef,
        where('date', '==', date),
        where('status', '!=', BookingStatus.CANCELLED)
      );

      if (courtId) {
        bookingQuery = query(bookingQuery, where('courtId', '==', courtId));
      }

      const bookingSnapshot = await getDocs(bookingQuery);
      const existingBookings = bookingSnapshot.docs.map(doc => doc.data() as CourtBooking);

      return !existingBookings.some(booking => 
        this.isTimeOverlapping(startTime, endTime, booking.startTime, booking.endTime)
      );
    } catch (error) {
      console.error('Error checking court availability:', error);
      return false;
    }
  }

  private static isTimeOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  static async createBooking(bookingData: Omit<CourtBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const bookingRef = await addDoc(collection(db, this.BOOKINGS_COLLECTION), {
        ...bookingData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
        status: BookingStatus.PENDING
      });

      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async confirmBooking(bookingId: string): Promise<void> {
    try {
      const bookingRef = doc(db, this.BOOKINGS_COLLECTION, bookingId);
      await updateDoc(bookingRef, {
        status: BookingStatus.CONFIRMED,
        updatedAt: Timestamp.now().toDate().toISOString()
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  static async getAvailableCourts(date: string, startTime: string, endTime: string): Promise<Court[]> {
    try {
      const courtsRef = collection(db, this.COURTS_COLLECTION);
      const courtsSnapshot = await getDocs(courtsRef);
      const allCourts = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
      
      const availableCourts: Court[] = [];
      
      for (const court of allCourts) {
        const isAvailable = await this.checkCourtAvailability(date, startTime, endTime, court.id);
        if (isAvailable && court.isAvailable) {
          availableCourts.push(court);
        }
      }
      
      return availableCourts;
    } catch (error) {
      console.error('Error getting available courts:', error);
      return [];
    }
  }
} 