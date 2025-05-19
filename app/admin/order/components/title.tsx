import React, { useState } from 'react';
import { Button } from "antd";

const Title = () => {
  const [, setIsOpenModal] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
      <h1 className="text-xl font-bold">Quản lý sân</h1>
      <Button
        type="primary"
        onClick={() => setIsOpenModal(true)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Đặt Sân
      </Button>
    </div>
  );
};

export default Title;