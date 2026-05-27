import React, { useState, useRef, useEffect } from 'react';
import { LedgerConfig, LedgerRecord } from '../../types';
import { mockDataMap } from '../../data/mock';
import { LayoutList, PieChart, Download, Upload, Plus, X, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button, Card, Badge, Input } from '../ui';
import { LedgerTable } from './LedgerTable';
import { LedgerAnalysis } from './LedgerAnalysis';

export function LedgerWorkspace({ config }: { config: LedgerConfig; key?: React.Key }) {
  const [activeTab, setActiveTab] = useState<'details' | 'analysis'>('details');
  const [data, setData] = useState<LedgerRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchEditingMode, setIsBatchEditingMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LedgerRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const COMPANIES = ['交易所', '技术公司', '数据公司', '唐银公司'];
  const [activeCompany, setActiveCompany] = useState(COMPANIES[0]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({});

  const filteredData = data.filter(record => {
    // 1. Search term match
    if (searchTerm) {
      const matchSearch = config.fields.some(field => {
        const val = record[field.key];
        return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!matchSearch) return false;
    }
    
    // 2. Advanced filters match
    for (const [key, value] of Object.entries(filters)) {
      if (value && String(record[key]) !== value) {
        return false;
      }
    }

    // 3. Company match
    const companyField = config.fields.find(f => ['department', 'company', 'borrowCompany'].includes(f.key))?.key;
    if (companyField) {
      // For mock compatibility, if it's '交易所' and we have no '交易所' data, we just assume it's valid
      // Actually strictly filter it to match the screenshot expectations.
      if (record[companyField] !== activeCompany) return false;
    }
    
    return true;
  });

  // Update data when config changes
  useEffect(() => {
    setData(mockDataMap[config.id] || []);
    setSelectedIds([]);
  }, [config.id]);
  
  const handleExport = () => {
    const headers = config.fields.map(f => f.name).join(',');
    const rows = data.map(record => config.fields.map(f => `"${record[f.key] || ''}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      alert('模拟导入成功：' + e.target.files[0].name);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsImportModalOpen(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    const headers = config.fields.map(f => f.name).join(',');
    const csvContent = headers + '\n';
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name}_导入模板.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleRecordChange = (id: string, key: string, value: any) => {
    setData(data.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.length} 项记录吗？`)) {
      setData(data.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedRecord: LedgerRecord = { id: editingRecord ? editingRecord.id : `new-${Date.now()}` };
    
    config.fields.forEach(field => {
      updatedRecord[field.key] = formData.get(field.key);
    });
    
    if (editingRecord) {
      setData(data.map(r => r.id === editingRecord.id ? updatedRecord : r));
      setIsModalOpen(false);
      setEditingRecord(null);
    } else {
      setData(prev => [updatedRecord, ...prev]);
      // If the submitter was the "save and continue" button, just reset the form
      const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
      if (submitter && submitter.name === 'saveAndContinue') {
        e.currentTarget.reset();
      } else {
        setIsModalOpen(false);
      }
    }
  };

  const handleEdit = (record: LedgerRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      setData(data.filter(r => r.id !== id));
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-6 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{config.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            批量导入
          </Button>
          <Button variant="primary" size="sm" onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-[#2468f2] hover:bg-[#1a55d4] shadow-sm">
            <Plus className="w-4 h-4 mr-1" />
            新增记录
          </Button>
        </div>
      </div>
      
      {/* Workspace Tabs & Content */}
      <Card className="flex-1 flex flex-col min-h-0 bg-white">
        {/* Company Tabs */}
        <div className="flex border-b border-slate-200 shadow-sm z-10">
          {COMPANIES.map(comp => (
            <button 
              key={comp}
              onClick={() => setActiveCompany(comp)}
              className={cn(
                "px-8 py-3 text-sm font-medium transition-colors border-r border-slate-200",
                activeCompany === comp ? 'bg-[#5185ca] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {comp}
            </button>
          ))}
        </div>
        
         <div className="flex-1 flex flex-col overflow-hidden">
          {/* Shared Toolbar */}
          <div className="flex flex-col border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex flex-1 items-center space-x-6">
                <div className="flex rounded-md shadow-sm">
                  <input 
                    type="text"
                    placeholder="可输入关键词组合" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex h-9 w-64 rounded-l-md border border-slate-300 bg-white px-3 py-1 text-sm transition-colors focus:z-10 focus:border-[#5185ca] focus:outline-none focus:ring-1 focus:ring-[#5185ca]"
                  />
                  <button className="h-9 rounded-r-md bg-[#5185ca] hover:bg-[#4372af] text-white px-6 text-sm font-medium transition-colors border border-[#5185ca]">
                    搜索
                  </button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("hidden sm:flex items-center whitespace-nowrap transition-colors h-9 text-[#5185ca] hover:text-[#4372af] hover:bg-blue-50", isFilterOpen ? "bg-blue-50" : "")}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  高级筛选
                  {Object.values(filters).some(Boolean) && (
                    <span className="ml-1.5 flex h-2 w-2 rounded-full bg-[#5185ca]"></span>
                  )}
                </Button>
              </div>
              
              {activeTab === 'details' && (
                <div className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ml-4",
                  selectedIds.length > 0 ? "bg-blue-50 border-blue-100" : "bg-transparent border-transparent"
                )}>
                  {selectedIds.length > 0 && (
                    <span className="text-sm text-[#5185ca] font-medium mr-2 animate-in fade-in zoom-in duration-200">
                      已选择 {selectedIds.length} 项
                    </span>
                  )}
                  <Button 
                    variant={isBatchEditingMode ? "default" : "outline"}
                    size="sm" 
                    className={cn(
                      "shadow-sm h-8",
                      selectedIds.length === 0 ? "text-slate-400 border-slate-200 cursor-not-allowed opacity-60 hover:bg-white" : isBatchEditingMode ? "bg-[#5185ca] hover:bg-[#4372af] text-white border-transparent" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    )} 
                    onClick={() => selectedIds.length > 0 && setIsBatchEditingMode(!isBatchEditingMode)}
                    disabled={selectedIds.length === 0}
                    title={selectedIds.length === 0 ? "请先在表格中勾选数据" : ""}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />{isBatchEditingMode ? '完成编辑' : '批量编辑'}
                  </Button>
                  <Button 
                    variant={selectedIds.length > 0 ? "danger" : "outline"} 
                    size="sm" 
                    className={cn(
                      "bg-white shadow-sm h-8",
                      selectedIds.length === 0 ? "text-slate-400 border-slate-200 cursor-not-allowed opacity-60 hover:bg-white" : "text-red-600 border-red-200 hover:bg-red-50"
                    )} 
                    onClick={() => selectedIds.length > 0 && handleBatchDelete()}
                    disabled={selectedIds.length === 0}
                    title={selectedIds.length === 0 ? "请先在表格中勾选数据" : ""}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />批量删除
                  </Button>
                </div>
              )}
            </div>

            {/* View Tabs */}
            <div className="flex px-4 pt-2 justify-between items-center">
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors relative top-[1px]",
                    activeTab === 'details' ? 'border-[#5185ca] text-[#5185ca]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  明细
                </button>
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className={cn(
                    "px-1 py-3 text-sm font-medium border-b-2 transition-colors relative top-[1px]",
                    activeTab === 'analysis' ? 'border-[#5185ca] text-[#5185ca]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  统计
                </button>
              </div>
              {activeTab === 'analysis' && (
                <Button size="sm" variant="outline" onClick={() => document.getElementById('add-chart-btn')?.click()} className="h-8 shadow-sm mb-1">
                  <Plus className="w-4 h-4 mr-1" />
                  添加图表
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {isFilterOpen && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 items-center">
                {config.fields.filter(f => f.type === 'select' || f.type === 'status').map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-700">{field.name}</label>
                    <select
                      className="h-8 rounded-md border border-slate-200 text-sm px-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      value={filters[field.key] || ''}
                      onChange={e => handleFilterChange(field.key, e.target.value)}
                    >
                      <option value="">全部</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
                {Object.values(filters).some(Boolean) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-800 h-8">
                    清除筛选
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'details' && (
               <LedgerTable 
                 config={config} 
                 data={filteredData} 
                 selectedIds={selectedIds}
                 isBatchEditingMode={isBatchEditingMode}
                 onSelectionChange={setSelectedIds}
                 onEdit={handleEdit}
                 onDelete={handleDelete}
                 onRecordChange={handleRecordChange}
               />
            )}
            {activeTab === 'analysis' && (
               <LedgerAnalysis config={config} data={filteredData} />
            )}
          </div>
        </div>
      </Card>
      
      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900">{editingRecord ? '编辑' : '新增'} {config.name}</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingRecord(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="max-h-[70vh] overflow-y-auto grid grid-cols-2 gap-4 px-1 pb-2">
                {config.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'select' || field.type === 'status' ? (
                      <select 
                        name={field.key}
                        defaultValue={editingRecord?.[field.key] || ''}
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5185ca]"
                        required={field.required}
                      >
                        <option value="">请选择...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'date' ? (
                      <Input type="date" name={field.key} defaultValue={editingRecord?.[field.key] || ''} required={field.required} />
                    ) : (
                      <Input type={field.type === 'number' ? 'number' : 'text'} name={field.key} defaultValue={editingRecord?.[field.key] || ''} required={field.required} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 mt-6">
                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setEditingRecord(null); }}>取消</Button>
                {!editingRecord && (
                  <Button type="submit" name="saveAndContinue" variant="outline" className="text-[#5185ca] border-[#5185ca] hover:bg-blue-50">保存并继续添加</Button>
                )}
                <Button type="submit" variant="primary" className="bg-[#5185ca] hover:bg-[#4372af] text-white border-transparent">提交保存</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900">批量导入</h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">点击或拖拽文件到此处</p>
                <p className="text-xs text-slate-500 mt-1">支持 .csv, .xlsx 格式</p>
                <input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImport}
                  id="import-file-upload"
                />
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => document.getElementById('import-file-upload')?.click()}
                >
                  选择文件
                </Button>
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm text-slate-700">没有导入模板？</div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleDownloadTemplate}>
                  下载模板
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
