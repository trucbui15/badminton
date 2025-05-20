import { Button, Popconfirm } from "antd";
import { CheckCircleOutlined, DollarOutlined, DeleteOutlined } from "@ant-design/icons";
import { FormDataType } from "./types"; // Import the FormDataType interface

// Các hàm xử lý sẽ được truyền từ component cha qua props
export const getColumns = (
  handlePaymentStatus: (record: FormDataType) => void,
  handleDelete: (record: FormDataType) => void
) => [
  {
    title: "Họ Tên",
    dataIndex: "fullName",
    key: "fullName",
    width: 120,
    ellipsis: true,
    className: "text-xs",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    width: 90,
    className: "text-xs",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    width: 130,
    ellipsis: true,
    className: "text-xs",
  },
  {
    title: "Sân",
    dataIndex: "courtName",
    key: "courtName",
    width: 80,
    ellipsis: true,
    className: "text-xs",
  },
  {
    title: "Ngày Đặt Sân",
    dataIndex: "date",
    key: "date",
    width: 100,
    className: "text-xs",
  },
  {
    title: "Khung giờ",
    key: "timeRange",
    width: 110,
    className: "text-xs",
    render: (_: unknown, record: FormDataType) => (
      <span>
        {record.startTime} - {record.endTime}
      </span>
    ),
  },
  {
    title: "Thời lượng",
    dataIndex: "duration",
    key: "duration",
    width: 70,
    className: "text-xs",
    render: (duration: number | string) => `${duration} giờ`,
  },
  {
    title: "Tổng tiền",
    dataIndex: "totalPrice",
    key: "totalPrice",
    width: 100,
    className: "text-xs",
    render: (total: number) => `${total?.toLocaleString()} VND`,
  },
  // {
  //   title: "Trạng thái",
  //   key: "paymentStatus",
  //   width: 120,
  //   className: "text-xs",
  //   render: (_: unknown, record: FormDataType) => (
  //     <Tag
  //       color={record.isPaid ? "green" : "orange"}
  //       className="text-center px-2 py-1"
  //     >
  //       {record.isPaid ? (
  //         <>
  //           <CheckCircleOutlined /> Đã thanh toán
  //         </>
  //       ) : (
  //         "Chưa thanh toán"
  //       )}
  //     </Tag>
  //   ),
  // },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    fixed: "right" as const,
    className: "text-xs",
    render: (_: unknown, record: FormDataType) => (
      <div className="flex items-center gap-[20px]">
        {!record.isPaid ? (
          <Popconfirm
            title="Xác nhận thanh toán"
            description={`Xác nhận thanh toán cho đặt sân của ${record.fullName}?`}
            onConfirm={() => handlePaymentStatus(record)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              icon={<DollarOutlined />}
              className="bg-green-500 hover:bg-green-600 px-[20px] py-[6px] min-w-[120px]"
              size="small"
            >
              Thanh toán
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="default"
            size="small"
            disabled
            className="text-green-500 px-[20px] py-[6px] min-w-[120px]"
            icon={<CheckCircleOutlined />}
          >
            Đã thanh toán
          </Button>
        )}

        <Popconfirm
          title="Xác nhận xóa"
          description={`Bạn có chắc chắn muốn xóa đặt sân của ${record.fullName}?`}
          onConfirm={() => handleDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
      </div>
    ),
  },
];