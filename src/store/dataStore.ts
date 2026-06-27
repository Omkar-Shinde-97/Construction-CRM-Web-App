import { create } from 'zustand';
import {
  activities as initialActivities,
  documents as initialDocuments,
  employees as initialEmployees,
  expenses as initialExpenses,
  monthlyFinancials,
  pipelineProjects as initialPipeline,
  projects as initialProjects,
  transactions as initialTransactions,
} from '../data/mockData';
import {
  Activity,
  DocumentItem,
  Employee,
  Expense,
  MonthlyFinancial,
  PipelineProject,
  Project,
  Transaction,
} from '../types';

interface DataState {
  employees: Employee[];
  projects: Project[];
  transactions: Transaction[];
  expenses: Expense[];
  pipelineProjects: PipelineProject[];
  documents: DocumentItem[];
  activities: Activity[];
  monthlyFinancials: MonthlyFinancial[];
  setEmployees: (employees: Employee[]) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  getProjectById: (id: string) => Project | undefined;
  setProjects: (projects: Project[]) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  employees: [...initialEmployees],
  projects: [...initialProjects],
  transactions: [...initialTransactions],
  expenses: [...initialExpenses],
  pipelineProjects: [...initialPipeline],
  documents: [...initialDocuments],
  activities: [...initialActivities],
  monthlyFinancials,
  setEmployees: (employees) => set({ employees }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === project.id ? project : item,
      ),
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((item) => item.id !== projectId),
    })),
  addEmployee: (employee) =>
    set((state) => ({ employees: [employee, ...state.employees] })),
  updateEmployee: (employee) =>
    set((state) => ({
      employees: state.employees.map((item) =>
        item.id === employee.id ? employee : item,
      ),
    })),
  getProjectById: (id) => get().projects.find((project) => project.id === id),
  setProjects: (projects) => set({ projects }),
}));
