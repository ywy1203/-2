import { LedgerConfig, LedgerRecord } from '../types';

export const mockLedgerConfigs: LedgerConfig[] = [
  {
    id: 'l-001',
    name: '入职台账',
    category: '调离台账',
    description: '记录新员工入职基本信息与进度，用于跟踪人员变动。',
    fields: [
      { key: 'empNo', name: '员工编号', type: 'text', required: true },
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'department', name: '部门', type: 'select', options: ['技术公司', '数据公司', '唐银公司'] },
      { key: 'role', name: '职务/职级', type: 'text' },
      { key: 'joinDate', name: '入职日期', type: 'date', required: true },
      { key: 'age', name: '年龄', type: 'number' },
      { key: 'score', name: '考核得分', type: 'number' },
      { key: 'status', name: '在职情况', type: 'status', options: ['在职', '离职', '借调'] }
    ]
  },
  {
    id: 'l-002',
    name: '离职台账',
    category: '调离台账',
    description: '记录员工离职信息',
    fields: [
      { key: 'empNo', name: '员工编号', type: 'text', required: true },
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'department', name: '部门', type: 'select', options: ['技术公司', '数据公司', '唐银公司'] },
      { key: 'leaveDate', name: '离职日期', type: 'date' },
      { key: 'reason', name: '离职原因', type: 'select', options: ['个人原因', '合同到期', '其他'] }
    ]
  },
  {
    id: 'l-003',
    name: '借调台账',
    category: '调离台账',
    description: '记录借调人员信息',
    fields: [
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'status', name: '在职情况', type: 'status', options: ['在职', '离职', '退休'] },
      { key: 'borrowCompany', name: '借出公司', type: 'select', options: ['技术公司', '数据公司', '唐银公司'] },
      { key: 'borrowDepartment', name: '借出部门', type: 'text', required: true },
      { key: 'role', name: '职务/职级', type: 'text' },
      { key: 'gender', name: '性别', type: 'select', options: ['男', '女'] },
      { key: 'startDate', name: '来函起始日期', type: 'date' },
      { key: 'endDate', name: '来函到期日期', type: 'date' },
      { key: 'actualStartDate', name: '借调实际报到日', type: 'date' },
      { key: 'actualEndDate', name: '借调实际到期日', type: 'date' },
      { key: 'borrowStatus', name: '借调状态', type: 'select', options: ['借调中', '已结束'] }
    ]
  },
  {
    id: 'l-004',
    name: '市场机构实践锻炼',
    category: '工作锻炼',
    description: '记录参加市场机构实践锻炼的情况',
    fields: [
      { key: 'empNo', name: '员工编号', type: 'text', required: true },
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'company', name: '实践机构', type: 'text' },
      { key: 'startDate', name: '开始日期', type: 'date' },
      { key: 'endDate', name: '结束日期', type: 'date' }
    ]
  },
  {
    id: 'l-005',
    name: '国情教育',
    category: '工作锻炼',
    description: '记录参加国情教育的情况',
    fields: [
      { key: 'empNo', name: '员工编号', type: 'text', required: true },
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'location', name: '教育地点', type: 'text' },
      { key: 'date', name: '教育日期', type: 'date' }
    ]
  },
  {
    id: 'l-006',
    name: '中金所午餐汇',
    category: '职业发展',
    description: '记录午餐汇参与情况',
    fields: [
      { key: 'name', name: '参与人', type: 'text', required: true },
      { key: 'topic', name: '分享主题', type: 'text' },
      { key: 'date', name: '日期', type: 'date' }
    ]
  },
  {
    id: 'l-007',
    name: '数字先锋',
    category: '职业发展',
    description: '记录数字先锋活动情况',
    fields: [
      { key: 'name', name: '参与人', type: 'text', required: true },
      { key: 'project', name: '项目名称', type: 'text' },
      { key: 'role', name: '参与角色', type: 'text' }
    ]
  },
  {
    id: 'l-008',
    name: '中层干部',
    category: '领导班子',
    description: '记录中层干部信息',
    fields: [
      { key: 'empNo', name: '员工编号', type: 'text', required: true },
      { key: 'name', name: '姓名', type: 'text', required: true },
      { key: 'department', name: '分管部门', type: 'text' },
      { key: 'position', name: '职务', type: 'text' },
      { key: 'appointDate', name: '任职日期', type: 'date' }
    ]
  }
];

export const mockCategories = [
  {
    id: 'cat-diaoli',
    name: '调离台账',
    ledgers: [
      { id: 'l-001', name: '入职台账' },
      { id: 'l-002', name: '离职台账' },
      { id: 'l-003', name: '借调台账' }
    ]
  },
  {
    id: 'cat-duanlian',
    name: '工作锻炼',
    ledgers: [
      { id: 'l-004', name: '市场机构实践锻炼' },
      { id: 'l-005', name: '国情教育' }
    ]
  },
  {
    id: 'cat-fazhan',
    name: '职业发展',
    ledgers: [
      { id: 'l-006', name: '中金所午餐汇' },
      { id: 'l-007', name: '数字先锋' }
    ]
  },
  {
    id: 'cat-zhuzi',
    name: '领导班子',
    ledgers: [
      { id: 'l-008', name: '中层干部' }
    ]
  }
];

export const mockDataMap: Record<string, LedgerRecord[]> = {
  'l-001': [
    { id: 'r-1', empNo: 'E001', name: '张三', department: '技术公司', role: '前端开发', joinDate: '2023-05-10', age: 28, score: 85, status: '在职' },
    { id: 'r-2', empNo: 'E002', name: '李四', department: '数据公司', role: '产品经理', joinDate: '2023-06-15', age: 34, score: 92, status: '在职' },
    { id: 'r-3', empNo: 'E003', name: '王五', department: '唐银公司', role: '市场专员', joinDate: '2024-01-20', age: 26, score: 78, status: '在职' },
    { id: 'r-4', empNo: 'E004', name: '赵六', department: '技术公司', role: '后端开发', joinDate: '2024-03-01', age: 30, score: 88, status: '在职' },
    { id: 'r-5', empNo: 'E005', name: '钱七', department: '技术公司', role: '测试工程师', joinDate: '2023-05-22', age: 29, score: 90, status: '在职' },
    { id: 'r-6', empNo: 'E006', name: '孙八', department: '数据公司', role: '数据分析', joinDate: '2023-07-10', age: 27, score: 82, status: '在职' },
    { id: 'r-7', empNo: 'E007', name: '周九', department: '技术公司', role: 'UI设计', joinDate: '2024-01-15', age: 25, score: 86, status: '在职' },
    { id: 'r-8', empNo: 'E008', name: '吴十', department: '唐银公司', role: '行政', joinDate: '2024-03-12', age: 35, score: 75, status: '离职' },
    { id: 'r-9', empNo: 'E009', name: '郑一', department: '数据公司', role: '后端开发', joinDate: '2023-08-01', age: 32, score: 95, status: '在职' },
    { id: 'r-10', empNo: 'E010', name: '王二', department: '技术公司', role: '前端开发', joinDate: '2024-04-05', age: 24, score: 70, status: '借调' },
    { id: 'r-11', empNo: 'E011', name: '刘三', department: '唐银公司', role: '人事经理', joinDate: '2023-05-15', age: 38, score: 89, status: '在职' },
    { id: 'r-12', empNo: 'E012', name: '陈四', department: '技术公司', role: '运维工程师', joinDate: '2023-10-20', age: 40, score: 91, status: '在职' },
    { id: 'r-13', empNo: 'E013', name: '杨五', department: '数据公司', role: '产品经理', joinDate: '2024-02-18', age: 31, score: 84, status: '在职' },
    { id: 'r-14', empNo: 'E014', name: '黄六', department: '唐银公司', role: '市场专员', joinDate: '2024-05-01', age: 28, score: 80, status: '在职' },
    { id: 'r-15', empNo: 'E015', name: '朱七', department: '技术公司', role: '测试工程师', joinDate: '2023-11-11', age: 27, score: 87, status: '离职' },
    { id: 'r-16', empNo: 'HR8000', name: '张明', department: '交易所', role: '结算专员', joinDate: '2024-01-15', age: 31, score: 85, status: '在职' },
    { id: 'r-17', empNo: 'HR8004', name: '陈强', department: '交易所', role: '合规经理', joinDate: '2020-05-15', age: 36, score: 92, status: '在职' },
    { id: 'r-18', empNo: 'HR8008', name: '周杰', department: '交易所', role: '技术支持', joinDate: '2021-09-15', age: 28, score: 88, status: '在职' },
    { id: 'r-19', empNo: 'HR8012', name: '胡宇', department: '交易所', role: '市场分析', joinDate: '2022-04-15', age: 29, score: 90, status: '在职' },
    { id: 'r-20', empNo: 'HR8016', name: '李娜', department: '交易所', role: '风控专员', joinDate: '2023-08-15', age: 30, score: 82, status: '在职' },
    { id: 'r-21', empNo: 'HR8020', name: '刘静', department: '交易所', role: '结算主管', joinDate: '2024-03-15', age: 34, score: 86, status: '在职' },
    { id: 'r-22', empNo: 'HR8024', name: '吴婷', department: '交易所', role: '行政主管', joinDate: '2020-07-15', age: 38, score: 75, status: '在职' },
    { id: 'r-23', empNo: 'HR8028', name: '朱璐', department: '交易所', role: '产品助理', joinDate: '2021-02-15', age: 26, score: 95, status: '在职' },
    { id: 'r-24', empNo: 'HR8032', name: '王磊', department: '交易所', role: '系统架构', joinDate: '2022-06-15', age: 40, score: 70, status: '在职' },
  ],
  'l-002': [
    { id: 'l2-1', empNo: 'E008', name: '王老八', department: '技术公司', leaveDate: '2023-12-01', reason: '个人原因' },
    { id: 'l2-2', empNo: 'E009', name: '赵老九', department: '数据公司', leaveDate: '2024-02-15', reason: '合同到期' },
  ],
  'l-003': [
    { id: 'l3-1', name: '张三', status: '在职', borrowCompany: '技术公司', borrowDepartment: '研发一部', role: '高级开发', gender: '男', startDate: '2024-01-01', endDate: '2024-12-31', actualStartDate: '2024-01-05', borrowStatus: '借调中' },
    { id: 'l3-2', name: '李四', status: '离职', borrowCompany: '数据公司', borrowDepartment: '数据分析部', role: '分析师', gender: '女', startDate: '2023-06-01', endDate: '2023-12-31', actualStartDate: '2023-06-01', actualEndDate: '2023-12-31', borrowStatus: '已结束' },
    { id: 'l3-3', name: '王五', status: '在职', borrowCompany: '唐银公司', borrowDepartment: '市场部', role: '资深专员', gender: '男', startDate: '2024-03-01', endDate: '2025-02-28', actualStartDate: '2024-03-05', borrowStatus: '借调中' },
    { id: 'l3-4', name: '赵钱', status: '在职', borrowCompany: '技术公司', borrowDepartment: '产品部', role: '产品经理', gender: '女', startDate: '2024-05-01', endDate: '2024-10-31', actualStartDate: '2024-05-08', borrowStatus: '借调中' },
    { id: 'l3-5', name: '孙李', status: '退休', borrowCompany: '数据公司', borrowDepartment: '运维部', role: '运维工程师', gender: '男', startDate: '2022-01-01', endDate: '2022-12-31', actualStartDate: '2022-01-03', actualEndDate: '2022-12-31', borrowStatus: '已结束' },
    { id: 'l3-6', name: '周吴', status: '在职', borrowCompany: '唐银公司', borrowDepartment: '销售部', role: '客户经理', gender: '男', startDate: '2024-02-15', endDate: '2024-08-15', actualStartDate: '2024-02-18', borrowStatus: '借调中' },
    { id: 'l3-7', name: '郑王', status: '在职', borrowCompany: '技术公司', borrowDepartment: '测试部', role: '测试开发', gender: '女', startDate: '2023-11-01', endDate: '2024-04-30', actualStartDate: '2023-11-01', actualEndDate: '2024-04-30', borrowStatus: '已结束' },
    { id: 'l3-8', name: '冯陈', status: '在职', borrowCompany: '数据公司', borrowDepartment: 'BI部', role: '数据工程师', gender: '男', startDate: '2024-06-01', endDate: '2024-11-30', actualStartDate: '', borrowStatus: '借调中' },
    { id: 'l3-9', name: '褚卫', status: '离职', borrowCompany: '唐银公司', borrowDepartment: '公关部', role: '公关专员', gender: '女', startDate: '2022-05-01', endDate: '2022-10-31', actualStartDate: '2022-05-05', actualEndDate: '2022-10-31', borrowStatus: '已结束' },
    { id: 'l3-10', name: '蒋沈', status: '在职', borrowCompany: '技术公司', borrowDepartment: '架构部', role: '架构师', gender: '男', startDate: '2024-04-01', endDate: '2025-03-31', actualStartDate: '2024-04-02', borrowStatus: '借调中' },
    { id: 'l3-11', name: '韩杨', status: '在职', borrowCompany: '数据公司', borrowDepartment: 'AI实验室', role: '算法工程师', gender: '女', startDate: '2023-09-01', endDate: '2024-08-31', actualStartDate: '2023-09-05', borrowStatus: '借调中' },
    { id: 'l3-12', name: '朱秦', status: '在职', borrowCompany: '唐银公司', borrowDepartment: '法务部', role: '法务主管', gender: '男', startDate: '2024-01-15', endDate: '2024-07-15', actualStartDate: '2024-01-20', borrowStatus: '借调中' },
    { id: 'l3-13', name: '尤许', status: '退休', borrowCompany: '技术公司', borrowDepartment: '研发二部', role: '资深专家', gender: '男', startDate: '2021-03-01', endDate: '2021-12-31', actualStartDate: '2021-03-05', actualEndDate: '2021-12-31', borrowStatus: '已结束' },
    { id: 'l3-14', name: '何吕', status: '在职', borrowCompany: '数据公司', borrowDepartment: '数据治理部', role: '数据架构师', gender: '女', startDate: '2024-03-10', endDate: '2024-09-10', actualStartDate: '2024-03-12', borrowStatus: '借调中' },
    { id: 'l3-15', name: '施张', status: '在职', borrowCompany: '唐银公司', borrowDepartment: '财务部', role: '财务经理', gender: '男', startDate: '2023-12-01', endDate: '2024-05-31', actualStartDate: '2023-12-01', borrowStatus: '借调中' },
  ],
  'l-004': [
    { id: 'l4-1', empNo: 'E001', name: '张三', company: '某金融科技公司', startDate: '2023-08-01', endDate: '2023-10-31' },
    { id: 'l4-2', empNo: 'E002', name: '李四', company: '互联网证券公司', startDate: '2024-02-01', endDate: '2024-04-30' },
  ],
  'l-005': [
    { id: 'l5-1', empNo: 'E003', name: '王五', location: '井冈山', date: '2023-07-15' },
    { id: 'l5-2', empNo: 'E004', name: '赵六', location: '延安', date: '2023-09-20' },
  ],
  'l-006': [
    { id: 'l6-1', name: '张三', topic: '前端微服务架构实践', date: '2023-11-05' },
    { id: 'l6-2', name: '李四', topic: '金融行业数据中台建设', date: '2024-01-12' },
  ],
  'l-007': [
    { id: 'l7-1', name: '王五', project: '核心交易系统重构', role: '核心开发' },
    { id: 'l7-2', name: '赵六', project: '智能风控平台', role: '项目经理' },
  ],
  'l-008': [
    { id: 'l8-1', empNo: 'M001', name: '孙主管', department: '技术公司', position: '技术总监', appointDate: '2021-05-01' },
    { id: 'l8-2', empNo: 'M002', name: '周经理', department: '数据公司', position: '数据产品总监', appointDate: '2022-08-15' },
  ]
};
