export type ProjectStatus = "Planning" | "In Progress" | "On Hold" | "Completed";
export type PipelineStage = "Lead" | "Proposal Sent" | "Negotiation" | "Won" | "Lost";
export type PaymentStatus = "Paid" | "Partial" | "Pending" | "Overdue";
export type EmployeeStatus = "Active" | "Inactive";
export type ExpenseCategory = "Labor" | "Material" | "Equipment" | "Overhead";

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  joinDate: string;
  salary: number;
  status: EmployeeStatus;
  avatar: string;
  activeProjects: number;
  projectsCompleted: number;
  rating: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  completion: number;
  managerId: string;
  teamIds: string[];
  description: string;
  cover: string;
}

export interface Transaction {
  id: string;
  projectId: string;
  invoice: string;
  date: string;
  dueDate: string;
  description: string;
  amount: number;
  collected: number;
  status: PaymentStatus;
}

export interface Expense {
  id: string;
  projectId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  addedBy: string;
  receipt: string;
}

export interface PipelineProject {
  id: string;
  name: string;
  client: string;
  estimatedValue: number;
  expectedStart: string;
  stage: PipelineStage;
  probability: number;
  assignedTo: string;
  nextActionDate: string;
  notes: string;
}

export interface DocumentItem {
  id: string;
  projectId: string;
  name: string;
  type: "Drawings" | "Contracts" | "Reports" | "Photos";
  size: string;
  uploadedAt: string;
}

export interface Activity {
  id: string;
  message: string;
  date: string;
  type: "project" | "employee" | "finance" | "document";
}

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}
