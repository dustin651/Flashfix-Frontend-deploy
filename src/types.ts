
export interface Job {
  id: string;
  timestamp: string;
  clientName: string;
  clientEmail: string;
  address: string;
  unit: string;
  serviceType: string;
  lockbox: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  pdfUrl?: string;
}

export interface BookingParams {
  clientName: string;
  clientEmail: string;
  address: string;
  unit: string;
  serviceType: string;
  lockbox: string;
}

export interface AiAssessment {
  items: {
    task: string;
    priority: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  }[];
  summary: string;
}
