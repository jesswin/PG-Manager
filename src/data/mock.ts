export type PaymentStatus = "Paid" | "Unpaid" | "Partial";
export type RoomStatus = "Occupied" | "Vacant";
export type RoomType = string;  // now fully dynamic — owner defines their own types
export type NoticeStatus = "Sent" | "Draft";

export type FoodPreference = "Veg" | "Non-Veg" | "No Preference";
export type TenantStatus = "Active" | "MovedOut";
export type SecurityRefundStatus = "FullRefund" | "PartialRefund" | "NoRefund";

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomNumber: string;
  rentAmount: number;
  moveInDate: string;
  paymentStatus: PaymentStatus;
  avatar: string;
  emergencyContact: string;
  emergencyPhone: string;
  idProofType: "Aadhar" | "Passport" | "DL" | "PAN";
  idProofNumber: string;
  occupation: string;
  // Extended fields
  rentDueDay: number;
  securityDeposit: number;
  advancePaid: number;
  foodPreference: FoodPreference;
  amenities: string[];
  notes: string;
  // Move-out tracking
  tenantStatus: TenantStatus;         // "Active" by default
  moveOutDate?: string;
  moveOutReason?: string;
  securityRefundStatus?: SecurityRefundStatus;
  securityRefundAmount?: number;
  moveOutNotes?: string;
}

export interface Room {
  id: string;
  number: string;
  floor: string;   // dynamic — e.g. "Ground Floor", "Floor 1", "Basement"
  type: RoomType;  // dynamic — e.g. "Single", "Deluxe AC", "Suite"
  status: RoomStatus;
  tenantId?: string;
  tenantName?: string;
  rentAmount: number;
  amenities: string[];
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  month: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  recipient: "All Tenants" | string;
  recipientId?: string;
  status: NoticeStatus;
  createdAt: string;
  sentAt?: string;
}

const TENANT_DEFAULTS = {
  rentDueDay: 5,
  securityDeposit: 0,
  advancePaid: 0,
  foodPreference: "No Preference" as const,
  amenities: [] as string[],
  notes: "",
  tenantStatus: "Active" as const,
};

export const tenants: Tenant[] = [
  { ...TENANT_DEFAULTS, id: "t1", name: "Arjun Sharma", phone: "9876543210", email: "arjun.sharma@gmail.com", roomNumber: "101", rentAmount: 8500, moveInDate: "2025-01-15", paymentStatus: "Paid", avatar: "AS", emergencyContact: "Priya Sharma", emergencyPhone: "9876500001", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-1234", occupation: "Software Engineer", securityDeposit: 17000, advancePaid: 8500, amenities: ["WiFi", "AC", "Attached Bathroom"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t2", name: "Priya Nair", phone: "9845678901", email: "priya.nair@yahoo.com", roomNumber: "102", rentAmount: 8500, moveInDate: "2025-02-01", paymentStatus: "Unpaid", avatar: "PN", emergencyContact: "Rajan Nair", emergencyPhone: "9845600001", idProofType: "Passport", idProofNumber: "P1234567", occupation: "MBA Student", securityDeposit: 17000, advancePaid: 8500, amenities: ["WiFi", "AC"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t3", name: "Rahul Verma", phone: "9912345678", email: "rahul.verma@hotmail.com", roomNumber: "201", rentAmount: 7000, moveInDate: "2024-11-10", paymentStatus: "Paid", avatar: "RV", emergencyContact: "Sunita Verma", emergencyPhone: "9912300001", idProofType: "DL", idProofNumber: "DL-0420110123456", occupation: "Bank Employee", securityDeposit: 14000, advancePaid: 7000, amenities: ["WiFi", "Geyser"], foodPreference: "Non-Veg" },
  { ...TENANT_DEFAULTS, id: "t4", name: "Sneha Iyer", phone: "9988776655", email: "sneha.iyer@gmail.com", roomNumber: "202", rentAmount: 7000, moveInDate: "2025-03-05", paymentStatus: "Partial", avatar: "SI", emergencyContact: "Venkat Iyer", emergencyPhone: "9988700001", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-5678", occupation: "IT Consultant", securityDeposit: 14000, advancePaid: 7000, amenities: ["WiFi", "Geyser", "Meals (Veg)"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t5", name: "Karthik Menon", phone: "9871234567", email: "karthik.menon@gmail.com", roomNumber: "203", rentAmount: 9500, moveInDate: "2024-09-20", paymentStatus: "Paid", avatar: "KM", emergencyContact: "Lakshmi Menon", emergencyPhone: "9871200001", idProofType: "PAN", idProofNumber: "ABCDE1234F", occupation: "CA", securityDeposit: 19000, advancePaid: 9500, amenities: ["WiFi", "AC", "Parking", "Laundry"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t6", name: "Divya Reddy", phone: "9765432109", email: "divya.reddy@outlook.com", roomNumber: "204", rentAmount: 9500, moveInDate: "2025-01-01", paymentStatus: "Unpaid", avatar: "DR", emergencyContact: "Suresh Reddy", emergencyPhone: "9765400001", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-9012", occupation: "Medical Student", securityDeposit: 19000, advancePaid: 9500, amenities: ["WiFi", "AC", "Attached Bathroom", "Meals (Veg)"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t7", name: "Amit Patel", phone: "9654321098", email: "amit.patel@gmail.com", roomNumber: "301", rentAmount: 6500, moveInDate: "2024-12-15", paymentStatus: "Paid", avatar: "AP", emergencyContact: "Hema Patel", emergencyPhone: "9654300001", idProofType: "DL", idProofNumber: "GJ-0520100654321", occupation: "Sales Executive", securityDeposit: 13000, advancePaid: 6500, amenities: ["WiFi"], foodPreference: "Non-Veg" },
  { ...TENANT_DEFAULTS, id: "t8", name: "Neha Gupta", phone: "9543210987", email: "neha.gupta@gmail.com", roomNumber: "302", rentAmount: 8000, moveInDate: "2025-02-20", paymentStatus: "Partial", avatar: "NG", emergencyContact: "Ramesh Gupta", emergencyPhone: "9543200001", idProofType: "Passport", idProofNumber: "P7654321", occupation: "Research Scholar", securityDeposit: 16000, advancePaid: 8000, amenities: ["WiFi", "Geyser", "Laundry"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t9", name: "Vijay Kumar", phone: "9432109876", email: "vijay.kumar@gmail.com", roomNumber: "303", rentAmount: 8000, moveInDate: "2024-10-01", paymentStatus: "Paid", avatar: "VK", emergencyContact: "Kamala Kumar", emergencyPhone: "9432100001", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-3456", occupation: "Software Developer", securityDeposit: 16000, advancePaid: 8000, amenities: ["WiFi", "AC", "Geyser"], foodPreference: "Non-Veg" },
  { ...TENANT_DEFAULTS, id: "t10", name: "Ananya Singh", phone: "9321098765", email: "ananya.singh@yahoo.com", roomNumber: "304", rentAmount: 9000, moveInDate: "2025-04-10", paymentStatus: "Unpaid", avatar: "AS", emergencyContact: "Rajiv Singh", emergencyPhone: "9321000001", idProofType: "PAN", idProofNumber: "FGHIJ5678K", occupation: "Fashion Designer", securityDeposit: 18000, advancePaid: 9000, amenities: ["WiFi", "AC", "Attached Bathroom"], foodPreference: "Veg" },
  { ...TENANT_DEFAULTS, id: "t11", name: "Rohan Desai", phone: "9210987654", email: "rohan.desai@gmail.com", roomNumber: "305", rentAmount: 9000, moveInDate: "2024-08-25", paymentStatus: "Paid", avatar: "RD", emergencyContact: "Meena Desai", emergencyPhone: "9210900001", idProofType: "Aadhar", idProofNumber: "XXXX-XXXX-7890", occupation: "Architect", securityDeposit: 18000, advancePaid: 9000, amenities: ["WiFi", "AC", "Parking"], foodPreference: "Non-Veg" },
  { ...TENANT_DEFAULTS, id: "t12", name: "Pooja Krishnan", phone: "9109876543", email: "pooja.krishnan@gmail.com", roomNumber: "306", rentAmount: 10000, moveInDate: "2025-03-15", paymentStatus: "Paid", avatar: "PK", emergencyContact: "Murali Krishnan", emergencyPhone: "9109800001", idProofType: "Passport", idProofNumber: "P9876543", occupation: "Data Analyst", securityDeposit: 20000, advancePaid: 10000, amenities: ["WiFi", "AC", "Attached Bathroom", "Laundry"], foodPreference: "Veg" },
];

export const rooms: Room[] = [
  // Floor 1
  { id: "r101", number: "101", floor: "Floor 1", type: "Single", status: "Occupied", tenantId: "t1", tenantName: "Arjun Sharma", rentAmount: 8500, amenities: ["AC", "Attached Bath"] },
  { id: "r102", number: "102", floor: "Floor 1", type: "Single", status: "Occupied", tenantId: "t2", tenantName: "Priya Nair", rentAmount: 8500, amenities: ["AC", "Attached Bath"] },
  { id: "r103", number: "103", floor: "Floor 1", type: "Double", status: "Vacant", rentAmount: 7000, amenities: ["Fan", "Common Bath"] },
  { id: "r104", number: "104", floor: "Floor 1", type: "Double", status: "Vacant", rentAmount: 7000, amenities: ["Fan", "Common Bath"] },
  { id: "r105", number: "105", floor: "Floor 1", type: "Triple", status: "Vacant", rentAmount: 5500, amenities: ["Fan", "Common Bath"] },
  { id: "r106", number: "106", floor: "Floor 1", type: "Triple", status: "Vacant", rentAmount: 5500, amenities: ["Fan", "Common Bath"] },
  // Floor 2
  { id: "r201", number: "201", floor: "Floor 2", type: "Double", status: "Occupied", tenantId: "t3", tenantName: "Rahul Verma", rentAmount: 7000, amenities: ["AC", "Common Bath"] },
  { id: "r202", number: "202", floor: "Floor 2", type: "Double", status: "Occupied", tenantId: "t4", tenantName: "Sneha Iyer", rentAmount: 7000, amenities: ["AC", "Common Bath"] },
  { id: "r203", number: "203", floor: "Floor 2", type: "Single", status: "Occupied", tenantId: "t5", tenantName: "Karthik Menon", rentAmount: 9500, amenities: ["AC", "Attached Bath", "Balcony"] },
  { id: "r204", number: "204", floor: "Floor 2", type: "Single", status: "Occupied", tenantId: "t6", tenantName: "Divya Reddy", rentAmount: 9500, amenities: ["AC", "Attached Bath", "Balcony"] },
  { id: "r205", number: "205", floor: "Floor 2", type: "Triple", status: "Vacant", rentAmount: 5500, amenities: ["Fan", "Common Bath"] },
  { id: "r206", number: "206", floor: "Floor 2", type: "Triple", status: "Vacant", rentAmount: 5500, amenities: ["Fan", "Common Bath"] },
  // Floor 3
  { id: "r301", number: "301", floor: "Floor 3", type: "Double", status: "Occupied", tenantId: "t7", tenantName: "Amit Patel", rentAmount: 6500, amenities: ["Fan", "Attached Bath"] },
  { id: "r302", number: "302", floor: "Floor 3", type: "Single", status: "Occupied", tenantId: "t8", tenantName: "Neha Gupta", rentAmount: 8000, amenities: ["AC", "Attached Bath"] },
  { id: "r303", number: "303", floor: "Floor 3", type: "Single", status: "Occupied", tenantId: "t9", tenantName: "Vijay Kumar", rentAmount: 8000, amenities: ["AC", "Attached Bath"] },
  { id: "r304", number: "304", floor: "Floor 3", type: "Single", status: "Occupied", tenantId: "t10", tenantName: "Ananya Singh", rentAmount: 9000, amenities: ["AC", "Attached Bath", "Balcony"] },
  { id: "r305", number: "305", floor: "Floor 3", type: "Single", status: "Occupied", tenantId: "t11", tenantName: "Rohan Desai", rentAmount: 9000, amenities: ["AC", "Attached Bath", "Balcony"] },
  { id: "r306", number: "306", floor: "Floor 3", type: "Double", status: "Occupied", tenantId: "t12", tenantName: "Pooja Krishnan", rentAmount: 10000, amenities: ["AC", "Attached Bath", "Balcony", "City View"] },
  { id: "r307", number: "307", floor: "Floor 3", type: "Triple", status: "Vacant", rentAmount: 6000, amenities: ["Fan", "Common Bath"] },
  { id: "r308", number: "308", floor: "Floor 3", type: "Triple", status: "Vacant", rentAmount: 6000, amenities: ["Fan", "Common Bath"] },
];

export const payments: Payment[] = [
  // March 2026
  { id: "p1", tenantId: "t1", tenantName: "Arjun Sharma", roomNumber: "101", amount: 8500, dueDate: "2026-03-05", paidDate: "2026-03-04", status: "Paid", month: "March 2026" },
  { id: "p2", tenantId: "t2", tenantName: "Priya Nair", roomNumber: "102", amount: 8500, dueDate: "2026-03-05", paidDate: "2026-03-09", status: "Paid", month: "March 2026" },
  { id: "p3", tenantId: "t3", tenantName: "Rahul Verma", roomNumber: "201", amount: 7000, dueDate: "2026-03-05", paidDate: "2026-03-06", status: "Paid", month: "March 2026" },
  { id: "p4", tenantId: "t4", tenantName: "Sneha Iyer", roomNumber: "202", amount: 3500, dueDate: "2026-03-05", paidDate: "2026-03-10", status: "Partial", month: "March 2026" },
  { id: "p5", tenantId: "t5", tenantName: "Karthik Menon", roomNumber: "203", amount: 9500, dueDate: "2026-03-05", paidDate: "2026-03-03", status: "Paid", month: "March 2026" },
  { id: "p6", tenantId: "t6", tenantName: "Divya Reddy", roomNumber: "204", amount: 9500, dueDate: "2026-03-05", paidDate: "2026-03-12", status: "Paid", month: "March 2026" },
  { id: "p7", tenantId: "t7", tenantName: "Amit Patel", roomNumber: "301", amount: 6500, dueDate: "2026-03-05", paidDate: "2026-03-07", status: "Paid", month: "March 2026" },
  { id: "p8", tenantId: "t8", tenantName: "Neha Gupta", roomNumber: "302", amount: 5000, dueDate: "2026-03-05", paidDate: "2026-03-12", status: "Partial", month: "March 2026" },
  { id: "p9", tenantId: "t9", tenantName: "Vijay Kumar", roomNumber: "303", amount: 8000, dueDate: "2026-03-05", paidDate: "2026-03-04", status: "Paid", month: "March 2026" },
  { id: "p10", tenantId: "t10", tenantName: "Ananya Singh", roomNumber: "304", amount: 9000, dueDate: "2026-03-05", paidDate: "2026-03-08", status: "Paid", month: "March 2026" },
  { id: "p11", tenantId: "t11", tenantName: "Rohan Desai", roomNumber: "305", amount: 9000, dueDate: "2026-03-05", paidDate: "2026-03-02", status: "Paid", month: "March 2026" },
  { id: "p12", tenantId: "t12", tenantName: "Pooja Krishnan", roomNumber: "306", amount: 10000, dueDate: "2026-03-05", paidDate: "2026-03-05", status: "Paid", month: "March 2026" },
  // April 2026
  { id: "p13", tenantId: "t1", tenantName: "Arjun Sharma", roomNumber: "101", amount: 8500, dueDate: "2026-04-05", paidDate: "2026-04-05", status: "Paid", month: "April 2026" },
  { id: "p14", tenantId: "t2", tenantName: "Priya Nair", roomNumber: "102", amount: 8500, dueDate: "2026-04-05", paidDate: "2026-04-08", status: "Paid", month: "April 2026" },
  { id: "p15", tenantId: "t3", tenantName: "Rahul Verma", roomNumber: "201", amount: 7000, dueDate: "2026-04-05", paidDate: "2026-04-04", status: "Paid", month: "April 2026" },
  { id: "p16", tenantId: "t4", tenantName: "Sneha Iyer", roomNumber: "202", amount: 7000, dueDate: "2026-04-05", status: "Unpaid", month: "April 2026" },
  { id: "p17", tenantId: "t5", tenantName: "Karthik Menon", roomNumber: "203", amount: 9500, dueDate: "2026-04-05", paidDate: "2026-04-03", status: "Paid", month: "April 2026" },
  { id: "p18", tenantId: "t6", tenantName: "Divya Reddy", roomNumber: "204", amount: 5000, dueDate: "2026-04-05", paidDate: "2026-04-15", status: "Partial", month: "April 2026" },
  { id: "p19", tenantId: "t7", tenantName: "Amit Patel", roomNumber: "301", amount: 6500, dueDate: "2026-04-05", paidDate: "2026-04-06", status: "Paid", month: "April 2026" },
  { id: "p20", tenantId: "t8", tenantName: "Neha Gupta", roomNumber: "302", amount: 8000, dueDate: "2026-04-05", paidDate: "2026-04-10", status: "Paid", month: "April 2026" },
  // May 2026
  { id: "p21", tenantId: "t1", tenantName: "Arjun Sharma", roomNumber: "101", amount: 8500, dueDate: "2026-05-05", paidDate: "2026-05-04", status: "Paid", month: "May 2026" },
  { id: "p22", tenantId: "t2", tenantName: "Priya Nair", roomNumber: "102", amount: 8500, dueDate: "2026-05-05", status: "Unpaid", month: "May 2026" },
  { id: "p23", tenantId: "t3", tenantName: "Rahul Verma", roomNumber: "201", amount: 7000, dueDate: "2026-05-05", paidDate: "2026-05-05", status: "Paid", month: "May 2026" },
  { id: "p24", tenantId: "t4", tenantName: "Sneha Iyer", roomNumber: "202", amount: 3500, dueDate: "2026-05-05", status: "Partial", month: "May 2026" },
  { id: "p25", tenantId: "t5", tenantName: "Karthik Menon", roomNumber: "203", amount: 9500, dueDate: "2026-05-05", paidDate: "2026-05-02", status: "Paid", month: "May 2026" },
  { id: "p26", tenantId: "t6", tenantName: "Divya Reddy", roomNumber: "204", amount: 9500, dueDate: "2026-05-05", status: "Unpaid", month: "May 2026" },
  { id: "p27", tenantId: "t9", tenantName: "Vijay Kumar", roomNumber: "303", amount: 8000, dueDate: "2026-05-05", paidDate: "2026-05-03", status: "Paid", month: "May 2026" },
  { id: "p28", tenantId: "t10", tenantName: "Ananya Singh", roomNumber: "304", amount: 9000, dueDate: "2026-05-05", status: "Unpaid", month: "May 2026" },
  { id: "p29", tenantId: "t11", tenantName: "Rohan Desai", roomNumber: "305", amount: 9000, dueDate: "2026-05-05", paidDate: "2026-05-01", status: "Paid", month: "May 2026" },
  { id: "p30", tenantId: "t12", tenantName: "Pooja Krishnan", roomNumber: "306", amount: 10000, dueDate: "2026-05-05", paidDate: "2026-05-05", status: "Paid", month: "May 2026" },
  // June 2026 (current month — some tenants haven't paid yet)
  { id: "p31", tenantId: "t2", tenantName: "Priya Nair", roomNumber: "102", amount: 8500, dueDate: "2026-06-05", status: "Unpaid", month: "June 2026" },
  { id: "p32", tenantId: "t4", tenantName: "Sneha Iyer", roomNumber: "202", amount: 7000, dueDate: "2026-06-05", status: "Unpaid", month: "June 2026" },
  { id: "p33", tenantId: "t6", tenantName: "Divya Reddy", roomNumber: "204", amount: 9500, dueDate: "2026-06-05", status: "Unpaid", month: "June 2026" },
  { id: "p34", tenantId: "t10", tenantName: "Ananya Singh", roomNumber: "304", amount: 9000, dueDate: "2026-06-05", status: "Unpaid", month: "June 2026" },
];

export const notices: Notice[] = [
  {
    id: "n1",
    title: "Water Supply Interruption – 28th May",
    message: "Dear Residents, please note that water supply will be interrupted on 28th May (Wednesday) from 9 AM to 2 PM due to maintenance work on the overhead tank. Please store adequate water beforehand. We apologize for the inconvenience.",
    recipient: "All Tenants",
    status: "Sent",
    createdAt: "2026-05-26",
    sentAt: "2026-05-26",
  },
  {
    id: "n2",
    title: "Rent Reminder – May 2026",
    message: "This is a friendly reminder that rent for May 2026 is due by 5th May. Please ensure timely payment to avoid late fees. You can pay directly to the caretaker or via UPI to the registered number.",
    recipient: "All Tenants",
    status: "Sent",
    createdAt: "2026-05-01",
    sentAt: "2026-05-01",
  },
  {
    id: "n3",
    title: "Overdue Rent Notice",
    message: "Your rent for May 2026 is still outstanding. Please clear the dues within 3 days to avoid a late fee of ₹200. If you have already paid, kindly share the receipt with the caretaker.",
    recipient: "Priya Nair",
    recipientId: "t2",
    status: "Sent",
    createdAt: "2026-05-10",
    sentAt: "2026-05-10",
  },
  {
    id: "n4",
    title: "New House Rules – Effective June 2026",
    message: "We are updating a few house rules effective from June 1st, 2026: 1. Gate closes at 11 PM. 2. No loud music after 10 PM. 3. Common areas must be kept clean. 4. Guests must register at reception. Please read the full rules on the notice board.",
    recipient: "All Tenants",
    status: "Sent",
    createdAt: "2026-05-20",
    sentAt: "2026-05-20",
  },
  {
    id: "n5",
    title: "Lift Maintenance Notice",
    message: "The building lift will undergo annual maintenance on 30th May (Friday) from 10 AM to 4 PM. During this period, please use the staircase. We regret the inconvenience caused.",
    recipient: "All Tenants",
    status: "Sent",
    createdAt: "2026-05-24",
    sentAt: "2026-05-24",
  },
  {
    id: "n6",
    title: "Partial Payment Acknowledgment",
    message: "We acknowledge receipt of your partial rent payment of ₹3,500 for May 2026. The remaining balance of ₹3,500 is due by 20th May. Please clear the dues at the earliest.",
    recipient: "Sneha Iyer",
    recipientId: "t4",
    status: "Sent",
    createdAt: "2026-05-08",
    sentAt: "2026-05-08",
  },
  {
    id: "n7",
    title: "June Rent Reminder Draft",
    message: "Dear Residents, this is a reminder that rent for June 2026 will be due on 5th June 2026. Please ensure timely payment.",
    recipient: "All Tenants",
    status: "Draft",
    createdAt: "2026-05-27",
  },
  {
    id: "n8",
    title: "Pest Control – Scheduled Visit",
    message: "Professional pest control service is scheduled for 2nd June 2026 (Monday) between 8 AM and 12 PM. Please keep your rooms accessible and remove food items from open surfaces. This is a routine maintenance activity.",
    recipient: "All Tenants",
    status: "Draft",
    createdAt: "2026-05-27",
  },
];

export const activityFeed = [
  { id: "a1", type: "payment", message: "Arjun Sharma paid ₹8,500 for Room 101", time: "2 hours ago", icon: "payment" },
  { id: "a2", type: "payment", message: "Rohan Desai paid ₹9,000 for Room 305", time: "5 hours ago", icon: "payment" },
  { id: "a3", type: "notice", message: "Notice sent: Water Supply Interruption", time: "1 day ago", icon: "notice" },
  { id: "a4", type: "tenant", message: "New tenant Pooja Krishnan moved into Room 306", time: "2 days ago", icon: "tenant" },
  { id: "a5", type: "payment", message: "Vijay Kumar paid ₹8,000 for Room 303", time: "3 days ago", icon: "payment" },
  { id: "a6", type: "notice", message: "Rent reminder sent to all tenants", time: "4 days ago", icon: "notice" },
  { id: "a7", type: "tenant", message: "Ananya Singh moved into Room 304", time: "1 month ago", icon: "tenant" },
];
