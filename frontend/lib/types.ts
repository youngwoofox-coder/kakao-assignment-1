export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  version: number;
  created_at: string;
}

export interface TodoCreateInput {
  title: string;
  completed?: boolean;
  date: string;
}

export interface TodoUpdateInput {
  title?: string;
  completed?: boolean;
  date?: string;
  /** 낙관적 잠금용 — 클라이언트가 알고 있던 버전 */
  version?: number;
}

export type TodoFilter = "all" | "active" | "completed";

export interface TodoListParams {
  filter?: TodoFilter;
  search?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  /** 기본 50, 최대 200 (백엔드 강제) */
  limit?: number;
  offset?: number;
}
