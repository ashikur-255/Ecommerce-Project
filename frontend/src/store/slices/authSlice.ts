import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosInstance } from "axios";

// ============================================================================
// API CONFIGURATION
// ============================================================================

const rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5085/api" : "https://ecommerce-backend-api-j6z4.onrender.com/api")
)
  .trim()
  .replace(/\/+$/, "");

const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

// Create axios instance with interceptors
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 65000, // 65 seconds timeout to handle Render free-tier cold starts
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "customer" | string;
  avatar?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface LoginDto {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface ForgotPasswordDto {
  email?: string;
  phone?: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface VerifyPhoneDto {
  code: string;
}

export interface ResendVerificationDto {
  email?: string;
  phone?: string;
  type: "email" | "phone";
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;

const storage = {
  getToken: (): string | null => localStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token: string): void => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  removeToken: (): void => localStorage.removeItem(STORAGE_KEYS.TOKEN),
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  setUser: (user: User): void => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
  removeUser: (): void => localStorage.removeItem(STORAGE_KEYS.USER),
  
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AuthState = {
  user: storage.getUser(),
  token: storage.getToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!storage.getToken() && !!storage.getUser(),
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse;
    
    // Handle validation errors
    if (data?.errors) {
      const firstError = Object.values(data.errors)[0]?.[0];
      if (firstError) return firstError;
    }
    
    // Handle custom error messages
    if (data?.message) {
      return data.message;
    }
    
    // Handle network errors
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (!error.response) {
      return "Network error. Please check your connection.";
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Invalid email or password.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "Resource not found.";
      case 409:
        return "Email already exists.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return error.response?.data?.message || "Something went wrong.";
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred.";
};

// ============================================================================
// AUTH THUNKS
// ============================================================================

/**
 * Login user with email or phone
 */
export const login = createAsyncThunk<
  AuthData,
  LoginDto,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    // Validate input
    if (!credentials.password) {
      return rejectWithValue("Password is required.");
    }
    if (!credentials.email && !credentials.phone) {
      return rejectWithValue("Email or phone is required.");
    }

    const response = await api.post<ApiResponse<AuthData>>(
      "/auth/login",
      credentials
    );

    // Check if login was successful
    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Login failed.");
    }

    const authData = response.data.data;
    
    // Store tokens
    storage.setToken(authData.token);
    storage.setUser(authData.user);
    
    // Set default auth header
    api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
    
    return authData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Register new user
 */
export const register = createAsyncThunk<
  AuthData,
  RegisterDto,
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    // Validate input
    if (!userData.name?.trim()) {
      return rejectWithValue("Name is required.");
    }
    if (!userData.password || userData.password.length < 6) {
      return rejectWithValue("Password must be at least 6 characters.");
    }
    if (!userData.email && !userData.phone) {
      return rejectWithValue("Please provide either email or phone number.");
    }

    const response = await api.post<ApiResponse<AuthData>>(
      "/auth/register",
      userData
    );

    // Handle response properly
    if (response.data.success && response.data.data) {
      const authData = response.data.data;
      if (authData.token) {
        storage.setToken(authData.token);
        storage.setUser(authData.user);
        api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
      }
      return authData;
    } else {
      return rejectWithValue(response.data.message || "Registration failed.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as ErrorResponse;
      if (data?.message) {
        if (data.message.includes("Email already exists")) {
          return rejectWithValue("This email is already registered. Please login.");
        }
        if (data.message.includes("Phone number already exists")) {
          return rejectWithValue("This phone number is already registered. Please login.");
        }
        return rejectWithValue(data.message);
      }
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Google Login
 */
export interface GoogleAuthDto {
  credential?: string;
  idToken?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  picture?: string;
}

export const googleLogin = createAsyncThunk<
  AuthData,
  GoogleAuthDto,
  { rejectValue: string }
>("auth/googleLogin", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<AuthData>>("/auth/google", data);
    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Google login failed.");
    }
    const authData = response.data.data;
    storage.setToken(authData.token);
    storage.setUser(authData.user);
    api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
    return authData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Forgot password - send reset link
 */
export const forgotPassword = createAsyncThunk<
  { message: string },
  ForgotPasswordDto,
  { rejectValue: string }
>("auth/forgotPassword", async (data, { rejectWithValue }) => {
  try {
    if (!data.email && !data.phone) {
      return rejectWithValue("Email or phone is required.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/forgot-password",
      data
    );

    return {
      message: response.data.message || "Password reset link sent to your email.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Reset password with token
 */
export const resetPassword = createAsyncThunk<
  { message: string },
  ResetPasswordDto,
  { rejectValue: string }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    if (!data.token) {
      return rejectWithValue("Reset token is required.");
    }
    if (!data.newPassword || data.newPassword.length < 6) {
      return rejectWithValue("Password must be at least 6 characters.");
    }
    if (data.newPassword !== data.confirmPassword) {
      return rejectWithValue("Passwords do not match.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/reset-password",
      data
    );

    return {
      message: response.data.message || "Password reset successfully.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Verify email with token
 */
export const verifyEmail = createAsyncThunk<
  { message: string },
  VerifyEmailDto,
  { rejectValue: string }
>("auth/verifyEmail", async (data, { rejectWithValue, getState }) => {
  try {
    if (!data.token) {
      return rejectWithValue("Verification token is required.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/verify-email",
      data
    );

    // Update user verification status if logged in
    const state = getState() as { auth: AuthState };
    if (state.auth.user) {
      const updatedUser = { ...state.auth.user, isEmailVerified: true };
      storage.setUser(updatedUser);
    }

    return {
      message: response.data.message || "Email verified successfully.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Verify phone with OTP
 */
export const verifyPhone = createAsyncThunk<
  { message: string },
  VerifyPhoneDto,
  { rejectValue: string }
>("auth/verifyPhone", async (data, { rejectWithValue, getState }) => {
  try {
    if (!data.code || data.code.length !== 6) {
      return rejectWithValue("Invalid OTP code.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/verify-phone",
      data
    );

    // Update user verification status if logged in
    const state = getState() as { auth: AuthState };
    if (state.auth.user) {
      const updatedUser = { ...state.auth.user, isPhoneVerified: true };
      storage.setUser(updatedUser);
    }

    return {
      message: response.data.message || "Phone verified successfully.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Resend verification (email or phone)
 */
export const resendVerification = createAsyncThunk<
  { message: string; verifyUrl?: string; emailSent?: boolean },
  ResendVerificationDto,
  { rejectValue: string }
>("auth/resendVerification", async (data, { rejectWithValue }) => {
  try {
    if (!data.email && !data.phone) {
      return rejectWithValue("Email or phone is required.");
    }
    if (!data.type) {
      return rejectWithValue("Verification type is required.");
    }

    const response = await api.post<ApiResponse<any>>(
      "/auth/resend-verification",
      data
    );

    const resData = response.data?.data;
    const verifyUrl = typeof resData === "object" ? resData?.verifyUrl : undefined;
    const emailSent = typeof resData === "object" ? resData?.emailSent : undefined;

    return {
      message: response.data.message || "Verification code sent successfully.",
      verifyUrl,
      emailSent,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// VERIFY PHONE PUBLIC (For new registrations without token)
// ============================================================================

export const verifyPhonePublic = createAsyncThunk<
  { message: string },
  { phone: string; code: string },
  { rejectValue: string }
>("auth/verifyPhonePublic", async (data, { rejectWithValue }) => {
  try {
    if (!data.phone) {
      return rejectWithValue("Phone number is required.");
    }
    if (!data.code || data.code.length !== 6) {
      return rejectWithValue("Invalid OTP code.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/verify-phone-public",
      data
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Verification failed.");
    }

    return {
      message: response.data.message || "Phone verified successfully.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Send phone verification OTP
 */
export const sendPhoneVerification = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("auth/sendPhoneVerification", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) {
      return rejectWithValue("User not authenticated.");
    }
    if (state.auth.user.isPhoneVerified) {
      return rejectWithValue("Phone already verified.");
    }

    const response = await api.post<ApiResponse<string>>(
      "/auth/send-phone-verification"
    );

    return {
      message: response.data.message || "OTP sent successfully.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Get current user profile
 */
export const fetchMe = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    const userData = response.data.data;
    
    storage.setUser(userData);
    return userData;
  } catch (error) {
    // If unauthorized, clear storage
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      storage.clearAll();
    }
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>("auth/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put<ApiResponse<User>>(
      "/auth/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const userData = response.data.data;
    storage.setUser(userData);
    return userData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// SLICE
// ============================================================================

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /**
     * Logout user - clear all auth data
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      storage.clearAll();
      delete api.defaults.headers.common["Authorization"];
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Manually set user (for profile updates)
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storage.setUser(action.payload);
    },

    /**
     * Set authentication state
     */
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // ============================================================
      // LOGIN
      // ============================================================
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // ============================================================
      // REGISTER
      // ============================================================
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload?.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })

      // ============================================================
      // GOOGLE LOGIN
      // ============================================================
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Google login failed";
      })

      // ============================================================
      // FORGOT PASSWORD
      // ============================================================
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send reset link";
      })

      // ============================================================
      // RESET PASSWORD
      // ============================================================
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to reset password";
      })

      // ============================================================
      // VERIFY EMAIL
      // ============================================================
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        if (state.user) {
          state.user.isEmailVerified = true;
          storage.setUser(state.user);
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify email";
      })

      // ============================================================
      // VERIFY PHONE
      // ============================================================
      .addCase(verifyPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhone.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        if (state.user) {
          state.user.isPhoneVerified = true;
          storage.setUser(state.user);
        }
      })
      .addCase(verifyPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify phone";
      })

      // ============================================================
      // VERIFY PHONE PUBLIC (UNAUTHENTICATED)
      // ============================================================
      .addCase(verifyPhonePublic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhonePublic.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        if (state.user) {
          state.user.isPhoneVerified = true;
          storage.setUser(state.user);
        }
      })
      .addCase(verifyPhonePublic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify phone";
      })

      // ============================================================
      // RESEND VERIFICATION
      // ============================================================
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to resend verification";
      })

      // ============================================================
      // SEND PHONE VERIFICATION
      // ============================================================
      .addCase(sendPhoneVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPhoneVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendPhoneVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send OTP";
      })

      // ============================================================
      // FETCH ME
      // ============================================================
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to fetch user";
        storage.clearAll();
      })

      // ============================================================
      // UPDATE PROFILE
      // ============================================================
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        storage.setUser(action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  logout,
  clearError,
  setUser,
  setAuthenticated,
} = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAdmin = (state: { auth: AuthState }) => 
  state.auth.user?.role === "admin";

export default authSlice.reducer;