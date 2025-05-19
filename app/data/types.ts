import dayjs from "dayjs";


export interface FormDataType {
  key?: string;
  courtId: string;
  courtName: string;
  fullName: string;
  phone: string;
  email: string;
  date: dayjs.Dayjs | null;
  startTime: string;
  duration: string | number;
  endTime: string;
  totalPrice: number;
  // timestamp: any; // Using any for Firebase timestamp
  isPaid: boolean;
  // paidAt?: any; // Option
}
export interface CourtType {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
}