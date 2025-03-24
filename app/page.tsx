"use client";
 
import { Input, Select } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker } from 'antd';
import FormBooking from "@/app/user/components/form"
import {db} from "@/app/source/firebaseConfig";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";


export default function Home() {

  const [valueName, setValueName] = useState("");
  const [valuePhoneNumber, setValuePhoneNumber] = useState("");
  const [valueEmail, setValueEmail] = useState(""); // ✅ Thêm state lưu email
  const [isComposing, setIsComposing] = useState(false);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return;
    const inputValue = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, ""); 
    setValueName(inputValue);
  };

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, "");
    setValuePhoneNumber(inputValue);
  };
  
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValueEmail(e.target.value); // ✅ Cập nhật state email
  };

  
  return (
    <div className="bg-[url('/images/bgbadminton.jpg')] bg-cover bg-center h-screen w-full gap-[20px] flex flex-col">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
          <div className="w-6 h-6 bg-blue-600 rounded-full -ml-2"></div>
          <h1 className="text-xl font-bold">CourtBadminton</h1>
        </div>
      </div>

      <div className="flex">
        <div className="flex flex-row gap-4 items-start mt-20 justify-start w-full">
          <div className="flex flex-col items-center text-center text-white w-[60vw]">
            <h2 className="text-4xl font-bold">Cuộc Sống Giống Như Môn Cầu Lông</h2>
            <p className="max-w-xl text-lg">Người Phát Cầu Tốt Hiếm Khi Là Người Thua Cuộc.</p>
          </div>

          <div className="w-full max-w-md">
            <FormBooking
              valueName={valueName}
              handleChangeName={handleChangeName}
              valuePhoneNumber={valuePhoneNumber}
              handleChangePhoneNumber={handleChangePhoneNumber}
              valueEmail={valueEmail} // ✅ Truyền giá trị email
              handleChangeEmail={handleChangeEmail} // ✅ Truyền hàm cập nhật email
            />
          </div>
        </div>
      </div>
    </div>
  );
}

