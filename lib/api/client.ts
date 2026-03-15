import type {
  ExamPurpose,
  OptionKey,
  QuestionFlagStatus,
  User,
  UserRole,
} from "@/lib/types";

const API_BASE_PATH = "/api/proxy/api";

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: ApiMethod;
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  formData?: FormData;
}

const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_PATH}${normalizedPath}`, "http://localhost");

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return `${url.pathname}${url.search}`;
};

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = "GET", token, query, body, formData } = options;
  const headers = new Headers({ Accept: "application/json" });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: payload,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson &&
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string" &&
        data.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  education: string;
  school_origin: string;
  exam_purpose: ExamPurpose;
  address: string;
  phone: string;
  target_score: number;
}

interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
  data?: {
    token?: string;
    accessToken?: string;
    user?: User;
  };
}

const normalizeRole = (role: unknown): UserRole =>
  role === "admin" ? "admin" : "user";

const normalizeExamPurpose = (value: unknown): ExamPurpose => {
  if (value === "persiapan_ukai" || value === "ukai") {
    return "persiapan_ukai";
  }
  if (value === "persiapan_masuk_apoteker") {
    return "persiapan_masuk_apoteker";
  }
  return "lainnya";
};

const normalizeUser = (raw: unknown): User => {
  const source = (raw ?? {}) as Record<string, unknown>;

  return {
    id: Number(source.id ?? 0),
    role: normalizeRole(source.role),
    name: String(source.name ?? "-"),
    email: String(source.email ?? "-"),
    education: String(source.education ?? "-"),
    schoolOrigin: String(source.school_origin ?? source.schoolOrigin ?? "-"),
    examPurpose: normalizeExamPurpose(source.exam_purpose ?? source.examPurpose),
    address: String(source.address ?? "-"),
    phone: String(source.phone ?? "-"),
    targetScore: Number(source.target_score ?? source.targetScore ?? 0),
    isPremium: Boolean(source.is_premium ?? source.isPremium),
    accountStatus:
      source.account_status === "inactive" || source.accountStatus === "inactive"
        ? "inactive"
        : "active",
    statusNote: String(source.status_note ?? source.statusNote ?? "") || null,
  };
};

const parseAuthResponse = (raw: AuthResponse): { token: string; user?: User } => {
  const token =
    raw.token ?? raw.accessToken ?? raw.data?.token ?? raw.data?.accessToken;

  if (!token) {
    throw new ApiError("Token tidak ditemukan pada response login.", 500);
  }

  const rawUser = raw.user ?? raw.data?.user;
  return { token, user: rawUser ? normalizeUser(rawUser) : undefined };
};

export const authApi = {
  register: async (payload: RegisterPayload): Promise<void> => {
    await request("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login: async (payload: LoginPayload): Promise<{ token: string; user?: User }> => {
    const raw = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
    return parseAuthResponse(raw);
  },

  profile: async (token: string): Promise<User> => {
    const raw = await request<Record<string, unknown> | { user: unknown }>(
      "/user/profile",
      {
        token,
      },
    );
    const payload =
      typeof raw === "object" && raw && "user" in raw
        ? (raw as { user: unknown }).user
        : raw;
    return normalizeUser(payload);
  },
};

export interface ExamPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string;
  question_count: number;
  session_limit?: number | null;
  validity_days?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  package_id: number;
  package_name?: string | null;
  package_description?: string;
  package_price?: number;
  session_limit?: number | null;
  validity_days?: number | null;
  order_code?: string | null;
  provider?: string;
  status:
    | "created"
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired"
    | "refunded"
    | "challenge";
  gross_amount?: number;
  currency?: string;
  payment_method?: string | null;
  payment_type?: string | null;
  midtrans_transaction_id?: string | null;
  midtrans_order_id?: string | null;
  midtrans_transaction_status?: string | null;
  fraud_status?: string | null;
  status_code?: string | null;
  status_message?: string | null;
  payment_gateway_url: string;
  snap_redirect_url?: string | null;
  snap_token?: string | null;
  access_status?: "active" | "inactive" | "expired";
  sessions_used?: number;
  paid_at?: string | null;
  expires_at?: string | null;
  last_status_at?: string | null;
  created_at?: string;
  updated_at?: string;
  granted_at?: string | null;
  activated_at?: string | null;
  access_expires_at?: string | null;
  events?: Array<{
    id: number;
    source: string;
    provider: string;
    event_type: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>;
}

export interface PurchaseRecord {
  id: number;
  package_id: number;
  package_name: string;
  package_description: string;
  package_price: number;
  session_limit?: number | null;
  validity_days?: number | null;
  order_code?: string | null;
  transaction_status:
    | "created"
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired"
    | "refunded"
    | "challenge";
  payment_method?: string | null;
  payment_type?: string | null;
  midtrans_transaction_status?: string | null;
  access_status: "active" | "inactive" | "expired";
  payment_gateway_url: string;
  snap_redirect_url?: string | null;
  gross_amount?: number;
  sessions_used: number;
  created_at?: string;
  paid_at?: string | null;
  granted_at?: string | null;
  activated_at?: string | null;
  expires_at?: string | null;
}

export interface PaymentProviderConfig {
  provider: "midtrans";
  client_key: string;
  is_production: boolean;
  snap_script_url: string;
}

export const transactionApi = {
  getPackages: async (): Promise<ExamPackage[]> => {
    const raw = await request<ExamPackage[] | { data: ExamPackage[] }>("/packages");
    return Array.isArray(raw) ? raw : raw.data;
  },

  getPaymentConfig: async (): Promise<PaymentProviderConfig> =>
    request("/payment-config"),

  createTransaction: async (
    token: string,
    payload: {
      packageId: number;
      paymentMethod?: string;
    },
  ): Promise<Transaction> => {
    const raw = await request<Transaction | { transaction: Transaction }>(
      "/transactions/create",
      {
        method: "POST",
        token,
        body: {
          package_id: payload.packageId,
          packageId: payload.packageId,
          payment_method: payload.paymentMethod,
          paymentMethod: payload.paymentMethod,
        },
      },
    );
    return "transaction" in raw ? raw.transaction : raw;
  },

  detail: async (token: string, transactionId: number): Promise<Transaction> =>
    request(`/transactions/${transactionId}`, { token }),

  detailByOrderCode: async (token: string, orderCode: string): Promise<Transaction> =>
    request(`/transactions/by-order/${encodeURIComponent(orderCode)}`, { token }),

  syncStatus: async (token: string, transactionId: number): Promise<Transaction> =>
    request(`/transactions/${transactionId}/sync`, {
      method: "POST",
      token,
    }),

  myTransactions: async (token: string): Promise<PurchaseRecord[]> =>
    request("/transactions/mine", { token }),
};

export interface ExamQuestionPublic {
  questionId: number;
  order: number;
  questionText: string;
  options: Record<OptionKey, string>;
}

export interface ExamStartResponse {
  sessionId: number;
  packageId: number;
  packageName: string;
  attemptNumber: number;
  questionCount: number;
  startTime: string;
  durationMinutes: number;
  gracePeriodMinutes: number;
  questions: ExamQuestionPublic[];
}

interface ExamStartRaw {
  sessionId?: number;
  session_id?: number;
  packageId?: number;
  package_id?: number;
  packageName?: string;
  package_name?: string;
  attempt_number?: number;
  questionCount?: number;
  question_count?: number;
  startTime?: string;
  start_time?: string;
  durationMinutes?: number;
  duration_minutes?: number;
  gracePeriodMinutes?: number;
  grace_period_minutes?: number;
  questions?: Array<{
    questionId?: number;
    question_id?: number;
    order: number;
    questionText?: string;
    question_text?: string;
    options: Record<OptionKey, string>;
  }>;
}

const normalizeExamStart = (raw: ExamStartRaw): ExamStartResponse => ({
  sessionId: Number(raw.sessionId ?? raw.session_id ?? 0),
  packageId: Number(raw.packageId ?? raw.package_id ?? 0),
  packageName: String(raw.packageName ?? raw.package_name ?? ""),
  attemptNumber: Number(raw.attempt_number ?? 1),
  questionCount: Number(
    raw.questionCount ??
      raw.question_count ??
      raw.questions?.length ??
      0,
  ),
  startTime: String(raw.startTime ?? raw.start_time ?? new Date().toISOString()),
  durationMinutes: Number(raw.durationMinutes ?? raw.duration_minutes ?? 200),
  gracePeriodMinutes: Number(
    raw.gracePeriodMinutes ?? raw.grace_period_minutes ?? 1,
  ),
  questions:
    raw.questions?.map((question) => ({
      questionId: Number(question.questionId ?? question.question_id ?? 0),
      order: Number(question.order),
      questionText: String(question.questionText ?? question.question_text ?? ""),
      options: question.options,
    })) ?? [],
});

export interface SubmitExamResponse {
  sessionId: number;
  package_id?: number | null;
  package_name?: string | null;
  attempt_number?: number | null;
  score?: number;
  status?: string;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface ExamResultQuestion {
  questionId: number;
  order: number;
  questionText: string;
  options: Record<OptionKey, string>;
  selectedOption?: OptionKey | null;
  correctAnswer?: OptionKey;
  explanation?: string;
  isCorrect?: boolean;
}

export interface ExamResultResponse {
  sessionId: number;
  package_id?: number | null;
  package_name?: string | null;
  attempt_number?: number | null;
  status: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt?: string;
  submittedAt?: string;
  questions: ExamResultQuestion[];
}

export interface ExamSessionSummary {
  session_id: number;
  package_id?: number | null;
  package_name?: string | null;
  attempt_number: number;
  status: string;
  score: number;
  total_questions: number;
  start_time?: string;
  end_time?: string | null;
}

export const examApi = {
  start: async (token: string, packageId: number): Promise<ExamStartResponse> => {
    const raw = await request<ExamStartRaw>("/exam/start", {
      method: "POST",
      token,
      body: {
        package_id: packageId,
        packageId,
      },
    });
    return normalizeExamStart(raw);
  },

  current: async (token: string): Promise<ExamStartResponse | null> => {
    try {
      const raw = await request<ExamStartRaw>("/exam/current", { token });
      return normalizeExamStart(raw);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  answer: async (
    token: string,
    payload: {
      question_id: number;
      mapped_selected_option: OptionKey | null;
      flag_status: QuestionFlagStatus;
    },
  ): Promise<void> => {
    await request("/exam/answer", {
      method: "PUT",
      token,
      body: payload,
    });
  },

  submit: async (token: string): Promise<SubmitExamResponse> =>
    request("/exam/submit", {
      method: "POST",
      token,
    }),

  sessions: async (token: string): Promise<ExamSessionSummary[]> =>
    request("/exam/sessions", { token }),

  result: async (token: string, sessionId: number): Promise<ExamResultResponse> =>
    request(`/exam/result/${sessionId}`, { token }),

  reportQuestion: async (
    token: string,
    payload: {
      question_id: number;
      session_id: number;
      report_text: string;
    },
  ): Promise<{ id: number; status: string; message?: string }> =>
    request("/exam/reports", {
      method: "POST",
      token,
      body: payload,
    }),
};

export interface DashboardStats {
  users: number;
  transactions: number;
  examCompleted: number;
}

export interface ActivityLog {
  id: number;
  actor_user_id: number | null;
  actor_role: "admin" | "user" | null;
  action: string;
  entity: string;
  entity_id: string | null;
  status: "success" | "failed";
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminUser {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  education: string;
  school_origin: string;
  exam_purpose: ExamPurpose;
  exam_purpose_label?: string;
  address: string;
  phone: string;
  target_score: number;
  is_premium: boolean;
  account_status: "active" | "inactive";
  status_note?: string | null;
  created_at?: string;
}

export interface AdminPackage extends ExamPackage {
  is_active: boolean;
}

export interface AdminQuestionPayload {
  package_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: OptionKey;
  explanation: string;
  is_active: boolean;
}

export interface AdminQuestion extends AdminQuestionPayload {
  id: number;
  package_name: string | null;
  package_question_count: number | null;
}

export interface QuestionReportSummary {
  id: number;
  status: "open" | "replied" | "closed";
  report_text: string;
  created_at: string;
  last_admin_reply_at?: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  question_id?: number | null;
  question_text?: string | null;
  package_id?: number | null;
  package_name?: string | null;
  session_id?: number | null;
}

export interface QuestionReportDetail {
  id: number;
  status: "open" | "replied" | "closed";
  report_text: string;
  created_at: string;
  last_admin_reply_at?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  question: {
    id?: number | null;
    text?: string | null;
  };
  package: {
    id?: number | null;
    name?: string | null;
  };
  session_id?: number | null;
  replies: Array<{
    id: number;
    author_user_id?: number | null;
    author_role: "user" | "admin";
    message_text: string;
    emailed_at?: string | null;
    created_at: string;
  }>;
}

export const adminApi = {
  dashboardStats: async (token: string): Promise<DashboardStats> =>
    request("/admin/dashboard-stats", { token }),

  users: async (token: string): Promise<AdminUser[]> =>
    request("/admin/users", { token }),

  updateUserStatus: async (
    token: string,
    id: number,
    payload: {
      account_status: "active" | "inactive";
      status_note?: string | null;
    },
  ): Promise<AdminUser> =>
    request(`/admin/users/${id}/status`, {
      method: "PUT",
      token,
      body: payload,
    }),

  transactions: async (
    token: string,
    options?: {
      status?: Transaction["status"];
      search?: string;
    },
  ): Promise<Transaction[]> =>
    request("/admin/transactions", {
      token,
      query: {
        status: options?.status,
        search: options?.search,
      },
    }),

  transactionDetail: async (token: string, id: number): Promise<Transaction> =>
    request(`/admin/transactions/${id}`, { token }),

  recheckTransaction: async (token: string, id: number): Promise<Transaction> =>
    request(`/admin/transactions/${id}/recheck`, {
      method: "POST",
      token,
    }),

  examResults: async (
    token: string,
  ): Promise<Array<Record<string, unknown>>> => request("/admin/exam-results", { token }),

  activityLogs: async (token: string): Promise<ActivityLog[]> =>
    request("/admin/activity-logs", { token }),

  packages: async (): Promise<ExamPackage[]> => request("/packages"),

  managePackages: async (token: string): Promise<AdminPackage[]> =>
    request("/admin/packages", { token }),

  createPackage: async (
    token: string,
    payload: {
      name: string;
      description: string;
      features: string;
      price: number;
      question_count: number;
      session_limit?: number | null;
      validity_days?: number | null;
      is_active?: boolean;
    },
  ): Promise<AdminPackage> =>
    request("/admin/packages", {
      method: "POST",
      token,
      body: payload,
    }),

  updatePackage: async (
    token: string,
    id: number,
    payload: Partial<{
      name: string;
      description: string;
      features: string;
      price: number;
      question_count: number;
      session_limit?: number | null;
      validity_days?: number | null;
      is_active?: boolean;
    }>,
  ): Promise<AdminPackage> =>
    request(`/admin/packages/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  archivePackage: async (
    token: string,
    id: number,
  ): Promise<{ message: string; package: AdminPackage }> =>
    request(`/admin/packages/${id}/archive`, {
      method: "PATCH",
      token,
    }),

  questions: async (
    token: string,
    options?: {
      packageId?: number;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<AdminQuestion[]> =>
    request("/admin/questions", {
      token,
      query: {
        package_id: options?.packageId,
        is_active: options?.isActive,
        search: options?.search,
      },
    }),

  createQuestion: async (
    token: string,
    payload: AdminQuestionPayload,
  ): Promise<AdminQuestion> =>
    request("/admin/questions", {
      method: "POST",
      token,
      body: payload,
    }),

  updateQuestion: async (
    token: string,
    id: number,
    payload: Partial<AdminQuestionPayload>,
  ): Promise<AdminQuestion> =>
    request(`/admin/questions/${id}`, {
      method: "PUT",
      token,
      body: payload,
    }),

  deleteQuestion: async (token: string, id: number): Promise<void> => {
    await request(`/admin/questions/${id}`, {
      method: "DELETE",
      token,
    });
  },

  importQuestions: async (
    token: string,
    file: File,
    options?: { packageId?: number; isActive?: boolean },
  ): Promise<{
    message?: string;
    imported_count?: number;
    package_id?: number;
    package_name?: string;
    is_active?: boolean;
    file_name?: string;
    question_ids?: number[];
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    if (typeof options?.packageId === "number" && options.packageId > 0) {
      formData.append("package_id", String(options.packageId));
    }
    if (typeof options?.isActive === "boolean") {
      formData.append("is_active", String(options.isActive));
    }

    return request("/admin/questions/import", {
      method: "POST",
      token,
      formData,
    });
  },

  selectBatch: async (
    token: string,
    questionIds: number[],
  ): Promise<{ message?: string }> =>
    request("/admin/questions/select-batch", {
      method: "POST",
      token,
      body: {
        question_ids: questionIds,
        questionIds,
      },
    }),

  questionReports: async (
    token: string,
    options?: { status?: "open" | "replied" | "closed" },
  ): Promise<QuestionReportSummary[]> =>
    request("/admin/question-reports", {
      token,
      query: { status: options?.status },
    }),

  questionReportDetail: async (
    token: string,
    id: number,
  ): Promise<QuestionReportDetail> => request(`/admin/question-reports/${id}`, { token }),

  replyQuestionReport: async (
    token: string,
    id: number,
    payload: {
      message_text: string;
      status?: "open" | "replied" | "closed";
    },
  ): Promise<{
    message: string;
    report_id: number;
    reply_id: number;
    status: string;
    email_sent: boolean;
    email_provider: string;
    email_error?: string | null;
    created_at: string;
  }> =>
    request(`/admin/question-reports/${id}/reply`, {
      method: "POST",
      token,
      body: payload,
    }),
};

export { ApiError };
