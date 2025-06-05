import { BookingService } from './bookingService';
import { BookingStep, ChatbotBookingState, CourtBooking } from '../types/booking';
import { format } from 'date-fns';

export class ChatbotBookingHandler {
  private state: ChatbotBookingState;

  constructor() {
    this.state = {
      step: BookingStep.GREETING,
      booking: {},
      temporaryData: {}
    };
  }

  async handleMessage(message: string): Promise<string> {
    try {
      switch (this.state.step) {
        case BookingStep.GREETING:
          this.state.step = BookingStep.GET_DATE;
          return 'Chào bạn! Tôi có thể giúp bạn đặt sân cầu lông. Bạn muốn đặt vào ngày nào? (Vui lòng nhập theo định dạng DD/MM/YYYY)';

        case BookingStep.GET_DATE:
          if (this.validateDate(message)) {
            this.state.temporaryData.selectedDate = message;
            this.state.step = BookingStep.GET_TIME;
            return 'Bạn muốn đặt sân vào khung giờ nào? (Vui lòng nhập theo định dạng HH:mm-HH:mm, ví dụ: 18:00-19:00)';
          }
          return 'Ngày không hợp lệ. Vui lòng nhập lại theo định dạng DD/MM/YYYY';

        case BookingStep.GET_TIME:
          if (this.validateTimeRange(message)) {
            const [startTime, endTime] = message.split('-');
            const availableCourts = await BookingService.getAvailableCourts(
              this.state.temporaryData.selectedDate!,
              startTime,
              endTime
            );

            if (availableCourts.length === 0) {
              return 'Xin lỗi, không có sân trống trong khung giờ này. Vui lòng chọn khung giờ khác.';
            }

            this.state.booking.startTime = startTime;
            this.state.booking.endTime = endTime;
            this.state.step = BookingStep.GET_COURT;

            return `Có ${availableCourts.length} sân trống. Vui lòng chọn số thứ tự sân:\n${
              availableCourts.map((court, index) => 
                `${index + 1}. ${court.name} (${court.type}, Tối đa ${court.maxPlayers} người, ${court.pricePerHour}đ/giờ)`
              ).join('\n')
            }`;
          }
          return 'Khung giờ không hợp lệ. Vui lòng nhập lại theo định dạng HH:mm-HH:mm';

        case BookingStep.GET_COURT:
          const selectedCourtIndex = parseInt(message) - 1;
          const availableCourts = await BookingService.getAvailableCourts(
            this.state.temporaryData.selectedDate!,
            this.state.booking.startTime!,
            this.state.booking.endTime!
          );

          if (selectedCourtIndex >= 0 && selectedCourtIndex < availableCourts.length) {
            const selectedCourt = availableCourts[selectedCourtIndex];
            this.state.temporaryData.selectedCourt = selectedCourt;
            this.state.booking.courtId = selectedCourt.id;
            this.state.booking.courtName = selectedCourt.name;
            this.state.step = BookingStep.GET_PLAYERS;
            return `Bạn muốn đặt cho bao nhiêu người? (Tối đa ${selectedCourt.maxPlayers} người)`;
          }
          return 'Lựa chọn không hợp lệ. Vui lòng chọn lại số thứ tự sân.';

        case BookingStep.GET_PLAYERS:
          const players = parseInt(message);
          if (players > 0 && players <= this.state.temporaryData.selectedCourt!.maxPlayers) {
            this.state.booking.numberOfPlayers = players;
            this.state.step = BookingStep.GET_CUSTOMER_NAME;
            return 'Vui lòng cho biết tên của bạn:';
          }
          return `Số người không hợp lệ. Vui lòng nhập số từ 1 đến ${this.state.temporaryData.selectedCourt!.maxPlayers}`;

        case BookingStep.GET_CUSTOMER_NAME:
          this.state.booking.customerName = message;
          this.state.step = BookingStep.GET_PHONE;
          return 'Vui lòng nhập số điện thoại của bạn:';

        case BookingStep.GET_PHONE:
          if (this.validatePhoneNumber(message)) {
            this.state.booking.phoneNumber = message;
            this.state.step = BookingStep.CONFIRM_BOOKING;
            return this.getBookingConfirmationMessage();
          }
          return 'Số điện thoại không hợp lệ. Vui lòng nhập lại.';

        case BookingStep.CONFIRM_BOOKING:
          if (message.toLowerCase() === 'đồng ý') {
            const bookingId = await this.createBooking();
            this.state.step = BookingStep.BOOKING_COMPLETE;
            return `Đặt sân thành công! Mã đặt sân của bạn là: ${bookingId}. Chúng tôi sẽ gửi tin nhắn xác nhận qua số điện thoại của bạn.`;
          } else if (message.toLowerCase() === 'hủy') {
            this.resetState();
            return 'Đã hủy đặt sân. Bạn có muốn đặt sân khác không?';
          }
          return 'Vui lòng trả lời "Đồng ý" để xác nhận hoặc "Hủy" để hủy đặt sân.';

        default:
          this.resetState();
          return 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    } catch (error) {
      console.error('Error in chatbot handler:', error);
      this.state.step = BookingStep.ERROR;
      return 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }

  private validateDate(dateStr: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    
    return date >= today && 
           date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  }

  private validateTimeRange(timeRange: string): boolean {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])-([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(timeRange)) return false;

    const [startTime, endTime] = timeRange.split('-');
    return startTime < endTime;
  }

  private validatePhoneNumber(phone: string): boolean {
    const regex = /^(0|\+84)[0-9]{9}$/;
    return regex.test(phone);
  }

  private getBookingConfirmationMessage(): string {
    return `Vui lòng xác nhận thông tin đặt sân:
- Sân: ${this.state.booking.courtName}
- Ngày: ${this.state.temporaryData.selectedDate}
- Thời gian: ${this.state.booking.startTime} - ${this.state.booking.endTime}
- Số người: ${this.state.booking.numberOfPlayers}
- Tên: ${this.state.booking.customerName}
- Số điện thoại: ${this.state.booking.phoneNumber}

Trả lời "Đồng ý" để xác nhận hoặc "Hủy" để hủy đặt sân.`;
  }

  private async createBooking(): Promise<string> {
    const bookingData: Omit<CourtBooking, 'id' | 'createdAt' | 'updatedAt'> = {
      courtId: this.state.booking.courtId!,
      courtName: this.state.booking.courtName!,
      date: this.state.temporaryData.selectedDate!,
      startTime: this.state.booking.startTime!,
      endTime: this.state.booking.endTime!,
      customerName: this.state.booking.customerName!,
      phoneNumber: this.state.booking.phoneNumber!,
      numberOfPlayers: this.state.booking.numberOfPlayers!,
      status: BookingStatus.PENDING
    };

    return await BookingService.createBooking(bookingData);
  }

  private resetState(): void {
    this.state = {
      step: BookingStep.GREETING,
      booking: {},
      temporaryData: {}
    };
  }
} 