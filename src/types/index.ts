export interface JobApplication {
    id: number;
    job_id: number;
    user_id: number;
    name: string;
    age: number;
    contact_number: string;
    address: string;
    previous_job: string;
    years_experience: number;
    skills: string[];
    highest_education: string;
    worked_abroad: boolean;    // comes as 0/1 from DB
    start_date: string;        // YYYY-MM-DD
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    submitted_at: string;
    updated_at: string;
    job_title: string;
    company_name: string;
}
