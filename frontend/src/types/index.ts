export interface CRMRecord {
  created_at: string | null;
  name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_without_country_code: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lead_owner: string | null;
  crm_status: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE' | null;
  crm_note: string | null;
  data_source: string | null;
  possession_time: string | null;
  description: string | null;
}

export interface SkippedRecord {
  reason: string;
  raw: Record<string, string>;
}

export interface ExtractionSummary {
  totalInput: number;
  totalImported: number;
  totalSkipped: number;
  totalBatches: number;
}

export interface ExtractionResult {
  success: boolean;
  summary: ExtractionSummary;
  extracted: CRMRecord[];
  skipped: SkippedRecord[];
}

export interface PreviewResult {
  success: boolean;
  headers: string[];
  records: Record<string, string>[];
  totalRows: number;
}

export type AppStep = 'upload' | 'preview' | 'processing' | 'results';
