export type Booking = {
    startTime: string; // Ví dụ: "10:00"
    endTime: string;   // Ví dụ: "11:00"
  };
  
  export function isTimeConflict(
    newStart: string,
    newEnd: string,
    existingBookings: Booking[]
  ): boolean {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
  
    const newStartMin = toMinutes(newStart);
    const newEndMin = toMinutes(newEnd);
  
    return existingBookings.some(({ startTime, endTime }) => {
      const existingStart = toMinutes(startTime);
      const existingEnd = toMinutes(endTime);
      return newStartMin < existingEnd && newEndMin > existingStart;
    });
  }
  