export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountType: string;
  branchCode: string;
  accountHolder: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  dateIssued: Date;
  dueDate: Date;
  booking: any;
  school: any;
  service: any;
  user?: any;
  bankAccount: BankAccount;
  vatIncluded: boolean;
  notes?: string;
}

export const DEFAULT_BANK_ACCOUNT: BankAccount = {
  bankName: "First National Bank",
  accountNumber: "1234567890",
  accountType: "Business Cheque",
  branchCode: "250655",
  accountHolder: "Kwakhanya Drivers Training",
};

export function generateInvoiceNumber(bookingId: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `KDT-${year}${month}-${String(bookingId).padStart(6, '0')}`;
}

export function generateDueDate(dateIssued: Date = new Date()): Date {
  const dueDate = new Date(dateIssued);
  dueDate.setDate(dueDate.getDate() + 7); // 7 days payment terms
  return dueDate;
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `R${num.toFixed(2)}`;
}

export function generateInvoiceHTML(details: InvoiceDetails): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-ZA');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${details.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info { text-align: left; }
        .invoice-info { text-align: right; }
        .billing-details { display: flex; justify-content: space-between; margin: 30px 0; }
        .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .services-table th, .services-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .services-table th { background-color: #f5f5f5; }
        .totals { text-align: right; margin: 20px 0; }
        .payment-info { margin: 30px 0; padding: 20px; background-color: #f9f9f9; }
        .footer { margin-top: 50px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1>Kwakhanya Drivers Training</h1>
          <p>Professional Driving Instruction</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${details.invoiceNumber}</p>
          <p><strong>Date:</strong> ${formatDate(details.dateIssued)}</p>
          <p><strong>Due Date:</strong> ${formatDate(details.dueDate)}</p>
        </div>
      </div>

      <div class="billing-details">
        <div>
          <h3>Bill To:</h3>
          <p>${details.booking.fullName || details.user?.fullName || 'Customer'}</p>
          <p>${details.booking.email || details.user?.email || ''}</p>
          <p>${details.booking.phoneNumber || details.user?.phoneNumber || ''}</p>
          <p>${details.booking.address || details.user?.address || ''}</p>
        </div>
        <div>
          <h3>Driving School:</h3>
          <p>${details.school.name}</p>
          <p>${details.school.address}</p>
          <p>${details.school.city}</p>
          <p>${details.school.contactNumber}</p>
        </div>
      </div>

      <table class="services-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${details.service.name}</td>
            <td>${details.service.description || 'Driving lessons'}</td>
            <td>${formatCurrency(details.booking.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <p><strong>Subtotal: ${formatCurrency(details.booking.totalAmount)}</strong></p>
        ${details.vatIncluded ? `<p>VAT (15%): ${formatCurrency(parseFloat(details.booking.totalAmount) * 0.15)}</p>` : ''}
        <h3>Total: ${formatCurrency(details.booking.totalAmount)}</h3>
      </div>

      <div class="payment-info">
        <h3>Payment Information</h3>
        <p><strong>Bank:</strong> ${details.bankAccount.bankName}</p>
        <p><strong>Account Holder:</strong> ${details.bankAccount.accountHolder}</p>
        <p><strong>Account Number:</strong> ${details.bankAccount.accountNumber}</p>
        <p><strong>Branch Code:</strong> ${details.bankAccount.branchCode}</p>
        <p><strong>Account Type:</strong> ${details.bankAccount.accountType}</p>
        <p><strong>Reference:</strong> ${details.invoiceNumber}</p>
      </div>

      ${details.notes ? `<div class="notes"><h3>Notes:</h3><p>${details.notes}</p></div>` : ''}

      <div class="footer">
        <p>Thank you for choosing Kwakhanya Drivers Training. Please use the invoice number as your payment reference.</p>
        <p>Payment terms: 7 days from invoice date.</p>
      </div>
    </body>
    </html>
  `;
}

export function generateInvoiceText(details: InvoiceDetails): string {
  const formatDate = (date: Date) => date.toLocaleDateString('en-ZA');
  
  return `
KWAKHANYA DRIVERS TRAINING
Invoice #: ${details.invoiceNumber}
Date: ${formatDate(details.dateIssued)}
Due
