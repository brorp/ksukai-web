import type { OptionKey, QuestionFlagStatus, User, UserRole } from "@/lib/types";

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
  exam_purpose: "ukai" | "cpns" | "pppk" | "other";
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

const normalizeUser = (raw: unknown): User => {
  const source = (raw ?? {}) as Record<string, unknown>;

  return {
    id: Number(source.id ?? 0),
    role: normalizeRole(source.role),
    name: String(source.name ?? "-"),
    email: String(source.email ?? "-"),
    education: String(source.education ?? "-"),
    schoolOrigin: String(source.school_origin ?? source.schoolOrigin ?? "-"),
    examPurpose: String(source.exam_purpose ?? source.examPurpose ?? "other"),
    address: String(source.address ?? "-"),
    phone: String(source.phone ?? "-"),
    targetScore: Number(source.target_score ?? source.targetScore ?? 0),
    isPremium: Boolean(source.is_premium ?? source.isPremium),
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
}

export interface Transaction {
  id: number;
  user_id: number;
  package_id: number;
  status: "pending" | "success" | "failed";
  payment_gateway_url: string;
  created_at?: string;
}

export const transactionApi = {
  getPackages: async (): Promise<ExamPackage[]> => {
    const raw = await request<ExamPackage[] | { data: ExamPackage[] }>("/packages");
    return Array.isArray(raw) ? raw : raw.data;
  },

  createTransaction: async (
    token: string,
    packageId: number,
  ): Promise<Transaction> => {
    const raw = await request<Transaction | { transaction: Transaction }>(
      "/transactions/create",
      {
        method: "POST",
        token,
        body: {
          package_id: packageId,
          packageId,
        },
      },
    );
    return "transaction" in raw ? raw.transaction : raw;
  },

  simulateWebhookSuccess: async (
    transactionId: number,
  ): Promise<{ message?: string }> =>
    request("/transactions/webhook", {
      method: "POST",
      body: {
        transaction_id: transactionId,
        transactionId,
        status: "success",
      },
    }),
};

export interface ExamQuestionPublic {
  questionId: number;
  order: number;
  questionText: string;
  options: Record<OptionKey, string>;
}

export interface ExamStartResponse {
  sessionId: number;
  startTime: string;
  durationMinutes: number;
  gracePeriodMinutes: number;
  questions: ExamQuestionPublic[];
}

interface ExamStartRaw {
  sessionId?: number;
  session_id?: number;
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
  status: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt?: string;
  submittedAt?: string;
  questions: ExamResultQuestion[];
}

export const examApi = {
  start: async (token: string): Promise<ExamStartResponse> => {
    const raw = await request<ExamStartRaw>("/exam/start", {
      method: "POST",
      token,
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

  result: async (token: string, sessionId: number): Promise<ExamResultResponse> =>
    request(`/exam/result/${sessionId}`, { token }),
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

export interface AdminQuestionPayload {
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
}

export const adminApi = {
  dashboardStats: async (token: string): Promise<DashboardStats> =>
    request("/admin/dashboard-stats", { token }),

  users: async (token: string): Promise<Array<Record<string, unknown>>> =>
    request("/admin/users", { token }),

  transactions: async (token: string): Promise<Transaction[]> =>
    request("/admin/transactions", { token }),

  examResults: async (
    token: string,
  ): Promise<Array<Record<string, unknown>>> => request("/admin/exam-results", { token }),

  activityLogs: async (token: string): Promise<ActivityLog[]> =>
    request("/admin/activity-logs", { token }),

  questions: async (token: string): Promise<AdminQuestion[]> =>
    request("/admin/questions", { token }),

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
    options?: { isActive?: boolean },
  ): Promise<{
    message?: string;
    imported_count?: number;
    is_active?: boolean;
    file_name?: string;
    question_ids?: number[];
  }> => {
    const formData = new FormData();
    formData.append("file", file);
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
};

export { ApiError };
