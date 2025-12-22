export interface UpcomingInterview {
  interview_id: string;
  interview_date: string;
  interview_type: string;
  location: string | null;
  status: string;
  notes: string | null;
  company_name: string;
  position_title: string;
  application_location: string;
  date_applied: string | null;
}
