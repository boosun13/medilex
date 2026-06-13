/**
 * @medilex/types
 * モノレポ全体で共有するドメイン型と API 入出力 DTO。実装には依存しない型のみ。
 */

// ========== ドメイン: 医療ドキュメント ==========

/** 取り扱う医療ドキュメントの種別 */
export type MedicalDocumentType =
  | 'drug_package_insert' // 薬剤添付文書
  | 'clinical_guideline'; // 診療ガイドライン

/** ドキュメントのメタデータ（フィルタ・出典表示に使う） */
export interface DocumentMetadata {
  type: MedicalDocumentType;
  /** 出典タイトル（例: 「アムロジピン錠 添付文書」） */
  title: string;
  /** 発行元・学会名など */
  source?: string;
  /** 版・改訂日（ISO 8601） */
  revisedAt?: string;
  /** 元データの URL */
  url?: string;
  [key: string]: unknown;
}

/** 取り込み単位のドキュメント */
export interface MedicalDocument {
  id: string;
  content: string;
  metadata: DocumentMetadata;
}

/** ベクトル化された本文チャンク */
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: DocumentMetadata;
}

// ========== ドメイン: 検索・回答 ==========

/** 類似検索でヒットしたチャンクとスコア */
export interface RetrievedChunk {
  chunk: DocumentChunk;
  /** 類似度スコア（0〜1 に正規化する想定。高いほど類似） */
  score: number;
}

/** 回答に付与する出典 */
export interface Citation {
  documentId: string;
  chunkId: string;
  title: string;
  type: MedicalDocumentType;
  url?: string;
  score: number;
}

/** RAG クエリの入力 */
export interface RagQueryInput {
  question: string;
  /** 取得する関連チャンク数（topK） */
  topK?: number;
  /** ドキュメント種別での絞り込み */
  filterTypes?: MedicalDocumentType[];
}

/** RAG クエリの出力 */
export interface RagQueryResult {
  answer: string;
  citations: Citation[];
}

// ========== API DTO（apps/api ⇄ apps/web）==========

export interface QueryRequestDto {
  question: string;
  topK?: number;
  filterTypes?: MedicalDocumentType[];
}

export interface QueryResponseDto {
  answer: string;
  citations: Citation[];
}

export interface IngestDocumentRequestDto {
  content: string;
  metadata: DocumentMetadata;
}

export interface IngestDocumentResponseDto {
  documentId: string;
  chunkCount: number;
}

/** 共通エラーレスポンス */
export interface ApiErrorDto {
  error: {
    code: string;
    message: string;
  };
}
