import React from 'react';
import { LedgerConfig, LedgerRecord } from '../../types';
import { Card, Badge, Button } from '../ui';
import { ShieldCheck, AlertTriangle, AlertCircle, Clock, ChevronRight } from 'lucide-react';

export function LedgerQuality({ config, data }: { config: LedgerConfig, data: LedgerRecord[] }) {
  // Mock logic to identify issues based on config
  
  const issues = React.useMemo(() => {
    let missingCount = 0;
    let dupCount = 0;
    
    // Simplistic duplicate check based on the first text field (often ID/Name)
    const keyField = config.fields.find(f => f.type === 'text') || config.fields[0];
    const seen = new Set();
    
    data.forEach(record => {
      // Check required
      config.fields.forEach(field => {
        if (field.required && (record[field.key] == null || record[field.key] === '')) {
          missingCount++;
        }
      });
      
      // Check dups
      if (keyField && record[keyField.key]) {
        if (seen.has(record[keyField.key])) {
          dupCount++;
        } else {
          seen.add(record[keyField.key]);
        }
      }
    });
    
    return {
      missing: missingCount,
      duplicate: dupCount,
      outdated: 0,
      format: 0,
    };
  }, [config, data]);
  
  const totalIssues = issues.missing + issues.duplicate + issues.outdated + issues.format;
  const healthScore = Math.max(0, 100 - (totalIssues * 5));
  
  const getHealthStatus = () => {
    if (healthScore >= 95) return { label: '健康', color: 'text-green-600', bg: 'bg-green-100', icon: ShieldCheck };
    if (healthScore >= 80) return { label: '需关注', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
    return { label: '待治理', color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle };
  };
  
  const status = getHealthStatus();
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-6 space-y-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Health Score Card */}
        <Card className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">台账健康度</div>
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${healthScore >= 95 ? 'border-green-500' : healthScore >= 80 ? 'border-yellow-500' : 'border-red-500'}`}>
            <span className="text-4xl font-bold text-slate-800">{healthScore}</span>
            <span className="text-xl text-slate-500 ml-1 mt-2">分</span>
          </div>
          
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full ${status.bg} ${status.color} font-medium`}>
            <StatusIcon className="w-4 h-4 mr-1.5" />
            {status.label}
          </div>
          
          <p className="text-xs text-slate-400 mt-2">基于完整性、唯一性与时效性计算</p>
        </Card>
        
        {/* Quality Metrics */}
        <Card className="p-0 md:col-span-2 divide-y divide-slate-100 flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-medium text-slate-800">数据质量概览</h3>
          </div>
          
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
            <div className="p-6 flex flex-col justify-center">
              <span className="text-slate-500 text-sm mb-1">必填缺失</span>
              <div className="flex items-end">
                <span className={`text-3xl font-semibold ${issues.missing > 0 ? 'text-red-600' : 'text-slate-900'}`}>{issues.missing}</span>
                <span className="ml-2 text-sm text-slate-400 mb-1">项</span>
              </div>
              {issues.missing > 0 && <Button variant="ghost" size="sm" className="mt-4 w-full text-blue-600 justify-between px-0 hover:bg-transparent hover:text-blue-700">去处理 <ChevronRight className="w-4 h-4" /></Button>}
            </div>
            
            <div className="p-6 flex flex-col justify-center">
              <span className="text-slate-500 text-sm mb-1">疑似重复</span>
              <div className="flex items-end">
                <span className={`text-3xl font-semibold ${issues.duplicate > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>{issues.duplicate}</span>
                <span className="ml-2 text-sm text-slate-400 mb-1">项</span>
              </div>
              {issues.duplicate > 0 && <Button variant="ghost" size="sm" className="mt-4 w-full text-blue-600 justify-between px-0 hover:bg-transparent hover:text-blue-700">去处理 <ChevronRight className="w-4 h-4" /></Button>}
            </div>
            
            <div className="p-6 flex flex-col justify-center">
              <span className="text-slate-500 text-sm mb-1">格式异常</span>
              <div className="flex items-end">
                <span className={`text-3xl font-semibold ${issues.format > 0 ? 'text-red-600' : 'text-slate-900'}`}>{issues.format}</span>
                <span className="ml-2 text-sm text-slate-400 mb-1">项</span>
              </div>
              {issues.format > 0 && <Button variant="ghost" size="sm" className="mt-4 w-full text-blue-600 justify-between px-0 hover:bg-transparent hover:text-blue-700">去处理 <ChevronRight className="w-4 h-4" /></Button>}
            </div>
            
            <div className="p-6 flex flex-col justify-center">
               <span className="text-slate-500 text-sm mb-1">超期未更新</span>
               <div className="flex items-end">
                 <span className={`text-3xl font-semibold ${issues.outdated > 0 ? 'text-yellow-600' : 'text-slate-900'}`}>{issues.outdated}</span>
                 <span className="ml-2 text-sm text-slate-400 mb-1">项</span>
               </div>
               {issues.outdated > 0 && <Button variant="ghost" size="sm" className="mt-4 w-full text-blue-600 justify-between px-0 hover:bg-transparent hover:text-blue-700">去处理 <ChevronRight className="w-4 h-4" /></Button>}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Suggestion list */}
      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mt-4">治理建议</h3>
      <div className="space-y-3">
        {issues.missing > 0 && (
          <Card className="p-4 flex flex-row items-center justify-between border-l-4 border-l-red-500">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900">发现 {issues.missing} 处必填字段缺失</h4>
                <p className="text-sm text-slate-500 mt-1">建议立即补录缺失的关键业务字段，以免影响后续分析和流转。</p>
              </div>
            </div>
            <Button size="sm">一键过滤待补录数据</Button>
          </Card>
        )}
        
        {issues.duplicate > 0 && (
          <Card className="p-4 flex flex-row items-center justify-between border-l-4 border-l-yellow-500">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900">发现 {issues.duplicate} 处疑似重复记录</h4>
                <p className="text-sm text-slate-500 mt-1">存在多条记录的防重字段（如编号/名称）相同，请人工核对并合并/作废。</p>
              </div>
            </div>
            <Button size="sm">查看重复明细</Button>
          </Card>
        )}
        
        {totalIssues === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
            <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p>当前台账数据质量优秀，未发现明显异常。</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
