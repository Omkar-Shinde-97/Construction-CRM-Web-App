import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Edit, Plus, Trash2 } from 'lucide-react';
import {
  BudgetAreaChart,
  DonutChart,
  ProfitLineChart,
} from '../../components/charts/Charts';
import { Avatar } from '../../components/shared/Avatar';
import { DataTable } from '../../components/shared/DataTable';
import { KPICard } from '../../components/shared/KPICard';
import { Progress } from '../../components/shared/Progress';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useDataStore } from '../../store/dataStore';
import { compactINR, percent } from '../../utils/formatters';
import { BarChart3, CircleDollarSign, IndianRupee, Wallet } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { TOKEN } from '../../api/apiClient';
import { Modal } from '../../components/ui/Modal';

const tabs = [
  'Overview',
  'Inventory',
  'Team',
  'Sales',
  'Expenses',
  'Documents',
  'Notes & Activity',
];

interface ProjectNote {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export function ProjectDetail() {
  const PROJECT_API_BASE_URL = 'http://localhost:8080/api/projects';
  const DOCUMENT_API_URL = (projectId: string) =>
    `${PROJECT_API_BASE_URL}/${projectId}/documents`;
  const EXPENSE_API_URL = (projectId: string) =>
    `${PROJECT_API_BASE_URL}/${projectId}/expenses`;
  const INVENTORY_API_URL = (projectId: string) =>
    `${PROJECT_API_BASE_URL}/${projectId}/inventories`;
  const { id } = useParams();
  const [tab, setTab] = useState('Overview');
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventories, setInventories] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const transactions = useDataStore((state) => state.transactions);
  const monthlyFinancials = useDataStore((state) => state.monthlyFinancials);
  const activities = useDataStore((state) => state.activities);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [savingInventory, setSavingInventory] = useState(false);

  const pushToast = useToastStore((state) => state.pushToast);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const TEAM_API_URL = (projectId: string) =>
    `${PROJECT_API_BASE_URL}/${projectId}/team`;

  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isAssigningTeam, setIsAssigningTeam] = useState(false);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);

  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    file: null as File | null,
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'LABOR',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    receiptFile: null as File | null,
    addedBy: '',
  });

  const [inventoryForm, setInventoryForm] = useState({
    unitNo: '',
    type: '',
    area: '',
    price: '',
    status: 'Available',
  });

  const [employeeSearch, setEmployeeSearch] = useState('');

  const filteredEmployees = employees.filter((employee) => {
    const search = employeeSearch.toLowerCase();

    return (
      employee.fullName?.toLowerCase().includes(search) ||
      employee.email?.toLowerCase().includes(search) ||
      employee.employeeCode?.toLowerCase().includes(search) ||
      employee.role?.toLowerCase().includes(search)
    );
  });

  const fetchDocuments = async (projectId: string) => {
    try {
      setLoadingDocuments(true);

      const response = await fetch(DOCUMENT_API_URL(projectId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Documents API Error ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDocuments(result.data || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to load documents', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const createInventory = async () => {
    if (!id) return;

    try {
      setSavingInventory(true);

      const response = await fetch(
        `${PROJECT_API_BASE_URL}/${id}/inventories`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unitNo: inventoryForm.unitNo,
            type: inventoryForm.type,
            area: inventoryForm.area,
            price: Number(inventoryForm.price),
            status: inventoryForm.status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      await response.json();

      pushToast({
        title: 'Inventory Added',
        description: 'Inventory added successfully',
        variant: 'success',
      });

      setShowInventoryModal(false);

      setInventoryForm({
        unitNo: '',
        type: '',
        area: '',
        price: '',
        status: 'Available',
      });

      await fetchInventories(id);
    } catch (error) {
      console.error(error);
      pushToast({
        title: 'Failed',
        description:
          error instanceof Error ? error.message : 'Failed to add inventory',
        variant: 'error',
      });
    } finally {
      setSavingInventory(false);
    }
  };

  const fetchExpenses = async (projectId: string) => {
    try {
      setLoadingExpenses(true);

      const response = await fetch(EXPENSE_API_URL(projectId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Expense API Error ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setExpenses(result.data || []);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Failed to load expenses', error);
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const byteArrayToImage = (bytes?: number[]) => {
    if (!bytes?.length) return '';

    const uint8Array = new Uint8Array(bytes);

    const blob = new Blob([uint8Array], {
      type: 'image/jpeg',
    });

    return URL.createObjectURL(blob);
  };

  const downloadReceipt = (
    base64Data: string,
    fileName?: string,
    contentType?: string,
  ) => {
    if (!base64Data) {
      return;
    }

    const byteCharacters = atob(base64Data);

    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: contentType || 'application/octet-stream',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    link.download = fileName || `receipt-${Date.now()}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const createExpense = async () => {
    if (!project?.id) return;

    try {
      setSavingExpense(true);

      const formData = new FormData();

      formData.append('category', expenseForm.category);

      formData.append('description', expenseForm.description);

      formData.append('amount', expenseForm.amount);

      formData.append('expenseDate', expenseForm.expenseDate);

      formData.append('vendorName', expenseForm.vendorName);

      formData.append('addedBy', expenseForm.addedBy);

      if (expenseForm.receiptFile) {
        formData.append('receipt', expenseForm.receiptFile);
      }

      const response = await fetch(
        `${PROJECT_API_BASE_URL}/${project.id}/expenses`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add expense');
      }

      pushToast({
        title: 'Success',
        description: 'Expense added successfully',
        variant: 'success',
      });

      setShowExpenseModal(false);

      await fetchExpenses(project.id);
    } catch (error: any) {
      pushToast({
        title: 'Failed',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setSavingExpense(false);
    }
  };

  const EMPLOYEE_API_URL = 'http://localhost:8080/api/employees';

  const createNote = async () => {
    if (!id || !noteText.trim()) return;

    try {
      setSavingNote(true);

      const response = await fetch(`${PROJECT_API_BASE_URL}/${id}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: noteText,
          createdBy: 'Omkar', // replace with logged-in username later
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create note');
      }

      pushToast({
        title: 'Success',
        description: 'Note added successfully',
        variant: 'success',
      });

      setNoteText('');

      await fetchNotes(id);
    } catch (error: any) {
      console.error(error);

      pushToast({
        title: 'Failed',
        description: error.message || 'Failed to add note',
        variant: 'error',
      });
    } finally {
      setSavingNote(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);

      const response = await fetch(EMPLOYEE_API_URL, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch employees`);
      }

      const result = await response.json();

      if (result.success) {
        setEmployees(result.data?.content || result.data || []);
      }
    } catch (error) {
      console.error('Failed to load employees', error);
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const assignedEmployeeIds = new Set(teamMembers.map((member) => member.id));

  const assignTeamMembers = async () => {
    if (!project?.id || selectedEmployeeIds.length === 0) {
      return;
    }

    try {
      setIsAssigningTeam(true);

      const response = await fetch(
        `${PROJECT_API_BASE_URL}/${project.id}/team`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeIds: selectedEmployeeIds,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to assign team');
      }

      setIsAssignTeamModalOpen(false);
      setSelectedEmployeeIds([]);

      await fetchTeamMembers(project.id);

      setSelectedEmployeeIds([]);
      setIsAssignTeamModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to assign employee');
    } finally {
      setIsAssigningTeam(false);
    }
  };

  const fetchNotes = async (projectId: string) => {
    if (!projectId) return;

    try {
      setIsLoadingNotes(true);

      const response = await fetch(
        `http://localhost:8080/api/projects/${projectId}/notes`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setNotes(
          [...(result.data || [])].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const fetchTeamMembers = async (projectId: string) => {
    try {
      const response = await fetch(TEAM_API_URL(projectId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Team API Error ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success) {
        setTeamMembers(responseData.data || []);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to load team', error);
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${PROJECT_API_BASE_URL}/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API Error ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.success) {
          setProject(responseData.data);

          console.log('Project Loaded:', responseData.data);

          await Promise.all([
            fetchInventories(id),
            fetchTeamMembers(id),
            fetchNotes(id),
            fetchExpenses(id),
            fetchDocuments(id),
          ]);
        } else {
          throw new Error(responseData.message || 'Failed to load project');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const fetchInventories = async (projectId: string) => {
    try {
      setInventoryLoading(true);

      const response = await fetch(INVENTORY_API_URL(projectId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Inventory API Error ${response.status}`);
      }

      const responseData = await response.json();

      console.log('Inventory Response:', responseData);

      if (responseData.success) {
        setInventories(responseData.data || []);
      } else {
        setInventories([]);
      }
    } catch (error) {
      console.error('Failed to load inventories', error);
      setInventories([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const projectManager = employees.find(
    (employee) => employee.id === project?.projectManager,
  );

  const uploadDocument = async () => {
    if (!project?.id || !documentForm.file) return;

    try {
      setSavingDocument(true);

      const formData = new FormData();

      formData.append('title', documentForm.title);
      formData.append('description', documentForm.description);
      formData.append('file', documentForm.file);

      const response = await fetch(
        `${PROJECT_API_BASE_URL}/${project.id}/documents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload document');
      }

      pushToast({
        title: 'Success',
        description: 'Document uploaded successfully',
        variant: 'success',
      });

      setShowDocumentModal(false);

      setDocumentForm({
        title: '',
        description: '',
        file: null,
      });

      await fetchDocuments(project.id);
    } catch (error: any) {
      pushToast({
        title: 'Failed',
        description: error.message,
        variant: 'error',
      });
    } finally {
      setSavingDocument(false);
    }
  };

  const downloadDocument = async (documentId: string) => {
    if (!project?.id) return;

    try {
      const response = await fetch(
        `${PROJECT_API_BASE_URL}/${project.id}/documents/${documentId}/file`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const fileData = result.data;

      const byteCharacters = atob(fileData.fileData);

      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], {
        type: fileData.mimeType,
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;
      link.download = fileData.fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const team = teamMembers;
  const projectTransactions = project?.transactions ?? [];
  const projectExpenses = expenses;
  const projectDocs = project?.documents ?? [];
  const projectActivities = project?.activities ?? [];
  const projectInventory = inventories;

  const received = project?.totalReceived ?? 0;
  const contract = project?.totalContractValue ?? 0;
  const overdue = project?.totalOverdue ?? 0;
  const expenseBreakdown = [
    {
      name: 'Labor',
      value: project?.laborExpense ?? 0,
    },
    {
      name: 'Material',
      value: project?.materialExpense ?? 0,
    },
    {
      name: 'Equipment',
      value: project?.equipmentExpense ?? 0,
    },
    {
      name: 'Overhead',
      value: project?.overheadExpense ?? 0,
    },
  ];
  const areaData = useMemo(() => {
    if (!project) return [];

    return monthlyFinancials.slice(0, 6).map((item, index) => ({
      month: item.month,
      budget: (project.totalBudget / 6) * (index + 1),
      spent: (project.totalSpent / 6) * (index + 1),
    }));
  }, [project, monthlyFinancials]);

  if (loading) {
    return (
      <Card>
        <div className='p-6'>Loading project details...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className='p-6 text-red-500'>{error}</div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <div className='p-6'>Project not found.</div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-extrabold dark:text-white'>
              {project.name}
            </h2>
            <Badge label={project.status} />
          </div>
          <p className='mt-1 text-slate-500'>
            {project.clientName} · {project.location}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline'>
            <Edit size={17} /> Edit
          </Button>
          <Button variant='danger'>
            <Trash2 size={17} /> Delete
          </Button>
          <Button variant='secondary'>
            <Download size={17} /> Export PDF
          </Button>
        </div>
      </Card>

      <div className='grid gap-4 lg:grid-cols-4'>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Category
            </p>
            <p className='font-semibold dark:text-white'>{project.category}</p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Timeline
            </p>
            <p className='font-semibold dark:text-white'>
              {project.startDate} — {project.endDate}
            </p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Project Manager
            </p>
            <p className='font-semibold dark:text-white'>
              {projectManager?.name ?? 'Unassigned'}
            </p>
          </div>
        </Card>
        <Card>
          <div className='space-y-2'>
            <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>
              Team size
            </p>
            <p className='font-semibold dark:text-white'>
              {project?.teamMembers?.length ?? 0} members
            </p>
          </div>
        </Card>
      </div>

      <div className='flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-soft dark:bg-slate-900 dark:shadow-none'>
        {tabs.map((item) => (
          <button
            key={item}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${tab === item ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <KPICard
              title='Budget'
              value={compactINR(project.totalBudget)}
              icon={IndianRupee}
            />
            <KPICard
              title='Spent'
              value={compactINR(project.totalSpent)}
              icon={Wallet}
              tone='orange'
            />
            <KPICard
              title='Remaining'
              value={compactINR(project.totalBudget - project.totalSpent)}
              icon={CircleDollarSign}
              tone='green'
            />
            <KPICard
              title='Completion'
              value={percent(project.completionPercentage)}
              icon={BarChart3}
              tone='green'
            />
          </div>
          <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
            <Card>
              <h3 className='mb-3 text-lg font-bold dark:text-white'>
                Budget vs Spent
              </h3>
              <BudgetAreaChart data={areaData} />
            </Card>
            <Card>
              <h3 className='mb-3 text-lg font-bold dark:text-white'>
                Milestones
              </h3>
              <div className='space-y-4'>
                {[
                  'Foundation',
                  'Structure',
                  'Interiors',
                  'Finishing',
                  'Handover',
                ].map((step, index) => (
                  <div key={step} className='flex gap-3'>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${index * 22 < project.completionPercentage ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className='font-bold dark:text-white'>{step}</p>
                      <p className='text-sm text-slate-500'>
                        Scheduled checkpoint
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card>
            <h3 className='mb-2 text-lg font-bold dark:text-white'>
              Description
            </h3>
            <p className='text-slate-600 dark:text-slate-300'>
              {project.description}
            </p>
            <div className='mt-4'>
              <Progress value={project.completionPercentage} />
            </div>
          </Card>
        </div>
      )}
      {tab === 'Inventory' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <KPICard
              title='Total Inventory'
              value={String(projectInventory.length)}
              icon={BarChart3}
            />

            <KPICard
              title='Available'
              value={String(
                projectInventory.filter((item) => item.status === 'Available')
                  .length,
              )}
              icon={CircleDollarSign}
              tone='green'
            />

            <KPICard
              title='Sold'
              value={String(
                projectInventory.filter((item) => item.status === 'Sold')
                  .length,
              )}
              icon={Wallet}
              tone='orange'
            />

            <KPICard
              title='Blocked'
              value={String(
                projectInventory.filter((item) => item.status === 'Blocked')
                  .length,
              )}
              icon={IndianRupee}
              tone='red'
            />
          </div>

          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>
                Inventory List
              </h3>

              <Button
                variant='secondary'
                onClick={() => setShowInventoryModal(true)}>
                <Plus size={17} />
                Add Inventory
              </Button>
            </div>

            <DataTable
              data={projectInventory as unknown as Record<string, unknown>[]}
              searchKeys={['unitNo', 'type', 'status'] as never[]}
              columns={[
                {
                  key: 'unitNo',
                  header: 'Unit No',
                },
                {
                  key: 'type',
                  header: 'Type',
                },
                {
                  key: 'area',
                  header: 'Area',
                },
                {
                  key: 'price',
                  header: 'Price',
                  render: (row) => compactINR(Number(row.price)),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <Badge label={String(row.status)} />,
                },
                {
                  key: 'totalCost',
                  header: 'Total Cost',
                  render: (row) => compactINR(Number(row.totalCost)),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <Button
                      variant='outline'
                      className='h-8'
                      onClick={() => navigate(`/inventory/${(row as any).id}`)}>
                      View
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Team' && (
        <Card>
          <div className='mb-4 flex justify-between'>
            <h3 className='text-lg font-bold dark:text-white'>
              Assigned Employees
            </h3>
            <Button
              // icon={<Plus size={16} />}
              onClick={async () => {
                await fetchEmployees();

                setSelectedEmployeeIds(teamMembers.map((member) => member.id));

                setIsAssignTeamModalOpen(true);
              }}>
              Manage Team
            </Button>
          </div>
          <DataTable
            data={team}
            searchKeys={['fullName', 'email']}
            columns={[
              {
                key: 'fullName',
                header: 'Name',
              },
              {
                key: 'role',
                header: 'Role',
              },
              {
                key: 'phone',
                header: 'Phone',
              },
              {
                key: 'email',
                header: 'Email',
              },
              {
                key: 'joinDate',
                header: 'Join Date',
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <Badge label={String(row.status)} />,
              },
            ]}
          />
        </Card>
      )}

      {tab === 'Sales' && (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-4'>
            <KPICard
              title='Total Contract Value'
              value={compactINR(contract)}
              icon={IndianRupee}
            />
            <KPICard
              title='Received'
              value={compactINR(received)}
              icon={Wallet}
              tone='green'
            />
            <KPICard
              title='Pending'
              value={compactINR(contract - received)}
              icon={CircleDollarSign}
              tone='orange'
            />
            <KPICard
              title='Overdue'
              value={compactINR(overdue)}
              icon={CircleDollarSign}
              tone='red'
            />
          </div>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Payments Over Time
            </h3>
            <ProfitLineChart
              data={monthlyFinancials.slice(0, 6).map((item) => ({
                month: item.month,
                profit: item.revenue / 4,
              }))}
            />
          </Card>
          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>
                Sales Transactions
              </h3>
              <Button variant='secondary'>
                <Plus size={17} /> Add Payment
              </Button>
            </div>
            <DataTable
              data={projectTransactions as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'invoice', header: 'Invoice #' },
                { key: 'date', header: 'Date' },
                { key: 'description', header: 'Description' },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (row) => compactINR(Number(row.amount)),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <Badge label={String(row.status)} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: () => (
                    <Button variant='outline' className='h-8'>
                      View
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Expenses' && (
        <div className='grid gap-6 xl:grid-cols-[360px_1fr]'>
          <Card>
            <h3 className='mb-4 text-lg font-bold dark:text-white'>
              Expense Breakdown
            </h3>
            <DonutChart data={expenseBreakdown} />
          </Card>
          <Card>
            <div className='mb-4 flex justify-between'>
              <h3 className='text-lg font-bold dark:text-white'>Expenses</h3>
              <Button
                variant='secondary'
                onClick={() => setShowExpenseModal(true)}>
                <Plus size={17} />
                Add Expense
              </Button>
            </div>
            <DataTable
              data={projectExpenses}
              searchKeys={['category', 'description', 'vendorName', 'addedBy']}
              columns={[
                {
                  key: 'date',
                  header: 'Date',
                },
                {
                  key: 'category',
                  header: 'Category',
                  render: (row) => <Badge label={String(row.category)} />,
                },
                {
                  key: 'description',
                  header: 'Description',
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (row) => compactINR(Number(row.amount)),
                },
                {
                  key: 'vendorName',
                  header: 'Vendor',
                },
                {
                  key: 'addedBy',
                  header: 'Added By',
                },
                {
                  key: 'receiptImage',
                  header: 'Receipt',
                  render: (row) =>
                    row.receiptImage ? (
                      <button
                        onClick={() =>
                          downloadReceipt(
                            row.receiptImage,
                            row.receiptFileName,
                            row.receiptContentType,
                          )
                        }
                        className='text-blue-600 hover:underline'>
                        Download
                      </button>
                    ) : (
                      '-'
                    ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {tab === 'Documents' && (
        <Card>
          <div className='mb-4 flex justify-between'>
            <h3 className='text-lg font-bold dark:text-white'>
              Project Documents
            </h3>

            <Button
              variant='secondary'
              onClick={() => setShowDocumentModal(true)}>
              <Plus size={17} />
              Upload Document
            </Button>
          </div>

          <DataTable
            data={documents}
            searchKeys={['name', 'type']}
            columns={[
              {
                key: 'name',
                header: 'Document Name',
                render: (row) => row.name || '-',
              },
              {
                key: 'type',
                header: 'Type',
              },
              {
                key: 'size',
                header: 'Size',
              },
              {
                key: 'uploadedAt',
                header: 'Uploaded At',
                render: (row) =>
                  new Date(String(row.uploadedAt)).toLocaleString(),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <Button
                    variant='outline'
                    className='h-8'
                    onClick={() => downloadDocument(row.id)}>
                    Download
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {tab === 'Notes & Activity' && (
        <Card>
          <div className='mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800'>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className='min-h-28 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400'
              placeholder='Write project note...'
            />
            <div className='mt-4 flex justify-end'>
              <Button
                variant='secondary'
                onClick={createNote}
                disabled={!noteText.trim() || savingNote}>
                {savingNote ? 'Saving...' : 'Add Note'}
              </Button>
            </div>
          </div>
          <div className='relative mt-6 ml-4 border-l-2 border-slate-200 dark:border-slate-700'>
            {notes.length === 0 && !isLoadingNotes && (
              <div className='py-10 text-center text-slate-500 dark:text-slate-400'>
                No notes or activities available for this project.
              </div>
            )}
            {notes.map((note) => (
              <div key={note.id} className='relative mb-6 pl-8'>
                <div className='absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 dark:border-slate-900' />
                <div className='rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700'>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='font-medium text-slate-900 dark:text-white'>
                      {note.createdBy}
                    </span>

                    <span className='text-xs text-slate-500 dark:text-slate-400'>
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {note.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showInventoryModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-xl font-bold dark:text-white'>
                Add Inventory
              </h2>

              <button
                onClick={() => setShowInventoryModal(false)}
                className='text-2xl text-slate-500 hover:text-red-500'>
                ×
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Unit Number *
                </label>
                <input
                  className='w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary'
                  placeholder='A-120'
                  value={inventoryForm.unitNo}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      unitNo: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Inventory Type *
                </label>

                <select
                  className='w-full rounded-lg border border-slate-300 p-3'
                  value={inventoryForm.type}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      type: e.target.value,
                    })
                  }>
                  <option value=''>Select Type</option>
                  <option value='Flat'>Flat</option>
                  <option value='Shop'>Shop</option>
                  <option value='Office'>Office</option>
                  <option value='Plot'>Plot</option>
                  <option value='Villa'>Villa</option>
                </select>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>Area *</label>

                <input
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='2000 Sq Ft'
                  value={inventoryForm.area}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      area: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Price *
                </label>

                <input
                  type='number'
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='3000'
                  value={inventoryForm.price}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Status *
                </label>

                <select
                  className='w-full rounded-lg border border-slate-300 p-3'
                  value={inventoryForm.status}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      status: e.target.value,
                    })
                  }>
                  <option value='Available'>Available</option>
                  <option value='Sold'>Sold</option>
                  <option value='Blocked'>Blocked</option>
                </select>
              </div>
            </div>

            <div className='mt-8 flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setShowInventoryModal(false)}
                disabled={savingInventory}>
                Cancel
              </Button>

              <Button
                variant='secondary'
                onClick={createInventory}
                disabled={savingInventory}>
                {savingInventory ? 'Saving...' : 'Save Inventory'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={isAssignTeamModalOpen}
        onClose={() => {
          setIsAssignTeamModalOpen(false);
          setSelectedEmployeeIds([]);
          setEmployeeSearch('');
        }}
        title='Manage Team Members'>
        <div className='space-y-4'>
          <input
            type='text'
            placeholder='Search employee by name, email, role...'
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className='w-full rounded-lg border border-slate-300 px-3 py-2'
          />

          <div className='max-h-[450px] overflow-y-auto rounded-lg border border-slate-200'>
            {filteredEmployees.length === 0 ? (
              <div className='p-6 text-center text-slate-500'>
                No employees found
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const isSelected = selectedEmployeeIds.includes(employee.id);

                const alreadyAssigned = teamMembers.some(
                  (member) => member.id === employee.id,
                );

                return (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between border-b border-slate-100 p-4 transition ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        // src={employee.avatarUrl}
                        label={employee.fullName}
                      />

                      <div>
                        <div className='font-medium text-slate-900'>
                          {employee.fullName}
                        </div>

                        <div className='text-sm text-slate-500'>
                          {employee.role}
                          {employee.department
                            ? ` • ${employee.department}`
                            : ''}
                        </div>

                        <div className='text-xs text-slate-400'>
                          {employee.email}
                        </div>

                        {alreadyAssigned && (
                          <div className='mt-1 text-xs font-medium text-green-600'>
                            Currently Assigned
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type='checkbox'
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployeeIds((prev) => [
                            ...prev,
                            employee.id,
                          ]);
                        } else {
                          setSelectedEmployeeIds((prev) =>
                            prev.filter((id) => id !== employee.id),
                          );
                        }
                      }}
                      className='h-5 w-5'
                    />
                  </div>
                );
              })
            )}
          </div>

          <div className='flex items-center justify-between text-sm text-slate-500'>
            <span>Selected Employees: {selectedEmployeeIds.length}</span>

            <span>Existing Team Members: {teamMembers.length}</span>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              variant='secondary'
              onClick={() => {
                setIsAssignTeamModalOpen(false);
                setSelectedEmployeeIds([]);
                setEmployeeSearch('');
              }}>
              Cancel
            </Button>

            <Button
              disabled={selectedEmployeeIds.length === 0 || isAssigningTeam}
              onClick={assignTeamMembers}>
              {isAssigningTeam ? 'Saving...' : 'Update Team'}
            </Button>
          </div>
        </div>
      </Modal>

      {showExpenseModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900'>
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-xl font-bold dark:text-white'>Add Expense</h2>

              <button
                onClick={() => setShowExpenseModal(false)}
                className='text-2xl text-slate-500 hover:text-red-500'>
                ×
              </button>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Category *
                </label>

                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-slate-300 p-3'>
                  <option value='LABOR'>Labor</option>
                  <option value='MATERIAL'>Material</option>
                  <option value='EQUIPMENT'>Equipment</option>
                  <option value='OVERHEAD'>Overhead</option>
                  <option value='TRANSPORTATION'>Transportation</option>
                  <option value='SUBCONTRACTOR'>Subcontractor</option>
                  <option value='UTILITIES'>Utilities</option>
                  <option value='MISCELLANEOUS'>Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Amount *
                </label>

                <input
                  type='number'
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      amount: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='95000'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='mb-1 block text-sm font-medium'>
                  Description *
                </label>

                <textarea
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='Expense description'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Expense Date *
                </label>

                <input
                  type='date'
                  value={expenseForm.expenseDate}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      expenseDate: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-slate-300 p-3'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Vendor Name
                </label>

                <input
                  value={expenseForm.vendorName}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      vendorName: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='ABC Labor Contractors'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='mb-1 block text-sm font-medium'>
                  Receipt Image
                </label>

                <input
                  type='file'
                  accept='image/*,.pdf'
                  className='w-full rounded-lg border border-slate-300 p-3'
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      receiptFile: e.target.files?.[0] || null,
                    })
                  }
                />

                {expenseForm.receiptFile && (
                  <div className='mt-2 text-sm text-green-600'>
                    Selected: {expenseForm.receiptFile.name}
                  </div>
                )}
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Added By
                </label>

                <input
                  value={expenseForm.addedBy}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      addedBy: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-slate-300 p-3'
                  placeholder='Site Supervisor'
                />
              </div>
            </div>

            <div className='mt-8 flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setShowExpenseModal(false)}
                disabled={savingExpense}>
                Cancel
              </Button>

              <Button
                variant='secondary'
                onClick={createExpense}
                disabled={
                  savingExpense ||
                  !expenseForm.description ||
                  !expenseForm.amount
                }>
                {savingExpense ? 'Saving...' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-xl rounded-xl bg-white p-6'>
            <h2 className='mb-4 text-xl font-bold'>Upload Document</h2>

            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Title'
                value={documentForm.title}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    title: e.target.value,
                  })
                }
                className='w-full rounded-lg border p-3'
              />

              <textarea
                placeholder='Description'
                value={documentForm.description}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    description: e.target.value,
                  })
                }
                className='w-full rounded-lg border p-3'
              />

              <input
                type='file'
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    file: e.target.files?.[0] || null,
                  })
                }
                className='w-full rounded-lg border p-3'
              />
            </div>

            <div className='mt-6 flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setShowDocumentModal(false)}>
                Cancel
              </Button>

              <Button
                onClick={uploadDocument}
                disabled={!documentForm.file || savingDocument}>
                {savingDocument ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
