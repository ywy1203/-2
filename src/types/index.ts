export interface LedgerField {
  key: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'status';
  options?: string[]; // for select/status
  required?: boolean;
}

export interface LedgerConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: LedgerField[];
}

export interface LedgerRecord {
  id: string;
  [key: string]: any;
}

export interface QualityIssue {
  recordId: string;
  fieldKey: string;
  issueType: 'missing' | 'format' | 'duplicate' | 'outdated';
  description: string;
}
