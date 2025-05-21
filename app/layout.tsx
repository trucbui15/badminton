"use client";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Toast } from 'primereact/toast';
import { useRef } from 'react';



// export const metadata: Metadata = {
//   title: "Quản lý sân cầu lông",
//   description: "Đặt sân cầu lông trực tuyến",
// };
export default function RootLayout({ children }: { children: React.ReactNode }) {
   const toast = useRef<Toast>(null);
  return (
    <html lang="vi">
      <body className="antialiased">
        <Toast ref={toast} />
        <main><AntdRegistry>{children}</AntdRegistry></main>
      </body>
    </html>
  );
}

