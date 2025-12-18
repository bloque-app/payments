export interface PSEPaymentFormData {
  personType: 'natural' | 'juridica';
  documentType: string;
  documentNumber: string;
  bankCode: string;
  email: string;
}
