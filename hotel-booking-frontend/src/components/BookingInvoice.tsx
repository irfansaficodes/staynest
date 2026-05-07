import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown } from "lucide-react";
import { Button } from "./ui/button";
import useAppContext from "../hooks/useAppContext";

interface BookingInvoiceProps {
  booking: {
    _id: string;
    hotelName: string;
    city: string;
    country: string;
    checkIn: string;
    checkOut: string;
    totalCost: number;
    status: string;
    adultCount: number;
    childCount: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const BookingInvoice = ({ booking }: BookingInvoiceProps) => {
  const { showToast } = useAppContext();

  const handleDownload = async () => {
    try {
      const element = document.createElement("div");
      element.style.width = "800px";
      element.style.padding = "40px";
      element.style.fontFamily = "Arial, sans-serif";
      element.style.background = "#fff";
      element.innerHTML = `
        <div style="border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #0d9488; margin: 0; font-size: 28px;">StayNest</h1>
          <p style="color: #6b7280; margin: 4px 0 0;">Booking Invoice</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <p style="margin: 4px 0;"><strong>Guest:</strong> ${booking.firstName} ${booking.lastName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${booking.email}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 4px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Detail</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Hotel</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${booking.hotelName}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Location</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${booking.city}, ${booking.country}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Check-in</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(booking.checkIn).toLocaleDateString()}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Check-out</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(booking.checkOut).toLocaleDateString()}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Guests</td><td style="padding: 10px; border: 1px solid #e5e7eb;">${booking.adultCount} Adults, ${booking.childCount} Children</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #e5e7eb;">Status</td><td style="padding: 10px; border: 1px solid #e5e7eb; text-transform: capitalize;">${booking.status}</td></tr>
          </tbody>
        </table>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: right;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Amount</p>
          <p style="margin: 4px 0 0; font-size: 32px; font-weight: bold; color: #0d9488;">₹${booking.totalCost.toLocaleString()}</p>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Thank you for choosing StayNest! | www.staynest.com</p>
          <p>This is a system-generated invoice.</p>
        </div>
      `;

      document.body.appendChild(element);
      const canvas = await html2canvas(element, { scale: 2 });
      document.body.removeChild(element);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`StayNest-Invoice-${booking._id}.pdf`);

      showToast({ title: "Invoice Downloaded", description: "Your booking invoice has been saved", type: "SUCCESS" });
    } catch (error) {
      showToast({ title: "Download Failed", description: "Could not generate invoice", type: "ERROR" });
    }
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      <FileDown className="w-4 h-4 mr-2" />
      Download Invoice
    </Button>
  );
};

export default BookingInvoice;
