// src/types/formData.ts
import dayjs from "dayjs";

export type FormDataType = {
  courtId: string;
  courtName: string;
  fullName: string;
  phone: string;
  email: string;
  date: dayjs.Dayjs | null;
  startTime: string;
  duration: string;
  endTime: string;
  totalPrice: number;
};
