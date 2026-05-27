import React from 'react';
import { Card } from '../ui';
import { mockCategories } from '../../data/mock';
import { Layers, BookOpen, Clock, Database, Activity, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['#5185ca', '#2cc295', '#f59e0b', '#8b5cf6'];

// Mock data for record volume
const recordTypeData = [
  { name: '人事调离', value: 450 },
  { name: '培训与锻炼', value: 210 },
  { name: '党建议事', value: 135 },
  { name: '工会及其他', value: 94 },
];

const companyLedgerData = [
  { name: '交易所', '调离台账': 1450, '锻炼台账': 850, '职业发展': 650, '其他': 500 },
  { name: '技术公司', '调离台账': 1050, '锻炼台账': 600, '职业发展': 300, '其他': 200 },
  { name: '数据公司', '调离台账': 945, '锻炼台账': 500, '职业发展': 250, '其他': 150 },
  { name: '唐银公司', '调离台账': 597, '锻炼台账': 300, '职业发展': 100, '其他': 100 },
];

const trendData = [
  { date: '05-01', 修改: 12, 新增: 5 },
  { date: '05-05', 修改: 24, 新增: 15 },
  { date: '05-10', 修改: 18, 新增: 8 },
  { date: '05-15', 修改: 42, 新增: 22 },
  { date: '05-20', 修改: 35, 新增: 18 },
  { date: '05-24', 修改: 12, 新增: 2 },
];

export function LedgerOverview() {
  const totalLedgers = mockCategories.reduce((acc, cat) => acc + cat.ledgers.length, 0);
  const totalCategories = mockCategories.length;
  
  const categoryData = mockCategories.map(cat => ({
    name: cat.name,
    count: cat.ledgers.length
  }));

  return (
    <div className="h-full bg-[#f8fafc] p-6 space-y-6 overflow-y-auto block">
      {/* Header Stat Cards */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-[#5185ca]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">台账分类</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalCategories}<span className="text-sm font-normal text-slate-400 ml-1">大类</span></h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Layers className="w-6 h-6 text-[#5185ca]" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">台账总数</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalLedgers}<span className="text-sm font-normal text-slate-400 ml-1">个</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">累计数据条目</p>
              <h3 className="text-3xl font-bold text-slate-900">8,542<span className="text-sm font-normal text-slate-400 ml-1">条</span></h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Database className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">今日发生变更</p>
              <h3 className="text-3xl font-bold text-slate-900">12<span className="text-sm font-normal text-slate-400 ml-1">份台账</span></h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">高频率使用台账</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCategories.slice(0, 2).flatMap(cat => cat.ledgers).slice(0, 4).map((ledger, index) => (
            <button 
              key={ledger.id}
              className="flex items-center p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-[#5185ca]/30 hover:bg-blue-50/30 hover:shadow-sm transition-all text-left group relative overflow-hidden"
              onClick={() => {
                const event = new CustomEvent('nav-ledger', { detail: ledger.id });
                window.dispatchEvent(event);
              }}
            >
              <div className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 group-hover:text-[#5185ca] group-hover:border-[#5185ca]/20 transition-all mr-3 z-10">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="z-10 relative pr-4 flex-1">
                <span className="font-medium text-slate-700 block text-sm group-hover:text-[#5185ca] transition-colors truncate">{ledger.name}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Chart 1 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">各分类台账分布数量</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#5185ca" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">台账数据量构成</h3>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recordTypeData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {recordTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 text-center text-slate-500">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Chart 3 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">各公司台账数据量分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={companyLedgerData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="调离台账" stackId="a" fill={COLORS[0]} maxBarSize={30} />
                <Bar dataKey="锻炼台账" stackId="a" fill={COLORS[1]} maxBarSize={30} />
                <Bar dataKey="职业发展" stackId="a" fill={COLORS[2]} maxBarSize={30} />
                <Bar dataKey="其他" stackId="a" fill={COLORS[3]} radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4 */}
        <Card className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">近30日台账变更趋势</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5185ca" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5185ca" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="新增" stroke="#5185ca" fillOpacity={1} fill="url(#colorAdd)" strokeWidth={2} />
                <Area type="monotone" dataKey="修改" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMod)" strokeWidth={2} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>


    </div>
  );
}
