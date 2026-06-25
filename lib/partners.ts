export type PartnerStatus = 'Active' | 'Under Review' | 'Inactive' | 'Suspended'
export type CertStatus = 'Certified' | 'Pending' | 'Expired'

export interface Partner {
  id: string
  name: string
  city: string
  status: PartnerStatus
  complaints_count: number
  certification: CertStatus
  rating: number
  last_active: string
  bookings_this_month: number
  phone: string
  joined: string
  specialization: string
}

export const SEED_PARTNERS: Partner[] = [
  { id: 'P001', name: 'Tanvi Joshi',     city: 'Mumbai',    status: 'Suspended',    complaints_count: 12, certification: 'Expired',   rating: 2.1, last_active: '2026-05-10', bookings_this_month: 0,  phone: '+91-9811001001', joined: '2023-06-24', specialization: 'Hair & Styling' },
  { id: 'P002', name: 'Pooja Desai',     city: 'Bengaluru', status: 'Under Review', complaints_count: 9,  certification: 'Certified', rating: 3.0, last_active: '2026-06-09', bookings_this_month: 36, phone: '+91-9822002002', joined: '2023-06-24', specialization: 'Bridal Makeup' },
  { id: 'P003', name: 'Sneha Iyer',      city: 'Bengaluru', status: 'Active',       complaints_count: 8,  certification: 'Certified', rating: 2.9, last_active: '2026-06-09', bookings_this_month: 38, phone: '+91-9833003003', joined: '2023-06-24', specialization: 'Skin Care' },
  { id: 'P004', name: 'Priya Sharma',    city: 'Mumbai',    status: 'Under Review', complaints_count: 6,  certification: 'Certified', rating: 3.4, last_active: '2026-06-09', bookings_this_month: 42, phone: '+91-9844004004', joined: '2023-06-24', specialization: 'Facial & Cleanup' },
  { id: 'P005', name: 'Meera Nair',      city: 'Delhi',     status: 'Active',       complaints_count: 5,  certification: 'Certified', rating: 3.7, last_active: '2026-06-09', bookings_this_month: 29, phone: '+91-9855005005', joined: '2023-06-24', specialization: 'Massage Therapy' },
  { id: 'P006', name: 'Ananya Das',      city: 'Kolkata',   status: 'Under Review', complaints_count: 4,  certification: 'Certified', rating: 3.5, last_active: '2026-06-18', bookings_this_month: 9,  phone: '+91-9866006006', joined: '2023-07-01', specialization: 'Bridal Makeup' },
  { id: 'P007', name: 'Roshni Bhatt',    city: 'Mumbai',    status: 'Inactive',     complaints_count: 4,  certification: 'Certified', rating: 3.8, last_active: '2026-06-24', bookings_this_month: 0,  phone: '+91-9877007007', joined: '2023-06-24', specialization: 'Nail Art' },
  { id: 'P008', name: 'Lakshmi Nair',    city: 'Chennai',   status: 'Active',       complaints_count: 3,  certification: 'Pending',   rating: 3.9, last_active: '2026-06-20', bookings_this_month: 15, phone: '+91-9888008008', joined: '2024-02-28', specialization: 'Massage Therapy' },
  { id: 'P009', name: 'Aisha Khan',      city: 'Hyderabad', status: 'Active',       complaints_count: 3,  certification: 'Pending',   rating: 4.2, last_active: '2026-06-09', bookings_this_month: 24, phone: '+91-9899009009', joined: '2025-12-24', specialization: 'Skin Care' },
  { id: 'P010', name: 'Riya Kapoor',     city: 'Mumbai',    status: 'Active',       complaints_count: 2,  certification: 'Pending',   rating: 4.8, last_active: '2026-06-24', bookings_this_month: 55, phone: '+91-9810010010', joined: '2025-12-24', specialization: 'Bridal Makeup' },
  { id: 'P011', name: 'Meghna Pillai',   city: 'Pune',      status: 'Active',       complaints_count: 2,  certification: 'Certified', rating: 4.3, last_active: '2026-06-22', bookings_this_month: 19, phone: '+91-9821011011', joined: '2024-01-20', specialization: 'Facial & Cleanup' },
  { id: 'P012', name: 'Sunita Rao',      city: 'Kolkata',   status: 'Active',       complaints_count: 1,  certification: 'Certified', rating: 4.5, last_active: '2026-06-23', bookings_this_month: 24, phone: '+91-9832012012', joined: '2023-11-15', specialization: 'Skin Care' },
  { id: 'P013', name: 'Kavya Reddy',     city: 'Hyderabad', status: 'Active',       complaints_count: 1,  certification: 'Certified', rating: 4.9, last_active: '2026-06-24', bookings_this_month: 47, phone: '+91-9843013013', joined: '2025-12-24', specialization: 'Hair & Styling' },
  { id: 'P014', name: 'Preethi Menon',   city: 'Pune',      status: 'Inactive',     complaints_count: 1,  certification: 'Expired',   rating: 4.1, last_active: '2026-06-01', bookings_this_month: 0,  phone: '+91-9854014014', joined: '2024-04-15', specialization: 'Skin Care' },
  { id: 'P015', name: 'Neha Pillai',     city: 'Delhi',     status: 'Active',       complaints_count: 0,  certification: 'Certified', rating: 4.5, last_active: '2026-06-24', bookings_this_month: 22, phone: '+91-9865015015', joined: '2025-12-24', specialization: 'Massage Therapy' },
  { id: 'P016', name: 'Ishita Banerjee', city: 'Bengaluru', status: 'Active',       complaints_count: 0,  certification: 'Certified', rating: 4.7, last_active: '2026-06-24', bookings_this_month: 33, phone: '+91-9876016016', joined: '2023-06-24', specialization: 'Facial & Cleanup' },
  { id: 'P017', name: 'Anjali Verma',    city: 'Delhi',     status: 'Under Review', complaints_count: 0,  certification: 'Expired',   rating: 4.6, last_active: '2026-06-24', bookings_this_month: 31, phone: '+91-9887017017', joined: '2023-06-24', specialization: 'Nail Art' },
  { id: 'P018', name: 'Fatima Sheikh',   city: 'Ahmedabad', status: 'Active',       complaints_count: 0,  certification: 'Certified', rating: 4.7, last_active: '2026-06-24', bookings_this_month: 28, phone: '+91-9898018018', joined: '2023-08-05', specialization: 'Hair & Styling' },
  { id: 'P019', name: 'Rekha Joshi',     city: 'Jaipur',    status: 'Active',       complaints_count: 0,  certification: 'Certified', rating: 4.6, last_active: '2026-06-24', bookings_this_month: 22, phone: '+91-9809019019', joined: '2023-09-12', specialization: 'Nail Art' },
  { id: 'P020', name: 'Deepika Sharma',  city: 'Chennai',   status: 'Active',       complaints_count: 0,  certification: 'Certified', rating: 4.8, last_active: '2026-06-24', bookings_this_month: 31, phone: '+91-9820020020', joined: '2024-03-10', specialization: 'Bridal Makeup' },
]