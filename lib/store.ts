import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { UserProfile, authAPI, StudentDashboard } from "./api";

// ==========================================
// AUTH STORE
// ==========================================
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track if we've checked auth on mount
  error: string | null;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (token: string, userId: number, role: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  checkAuth: () => Promise<void>; // New: Check auth on app load
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: (token, userId, role) => {
        Cookies.set("access_token", token, { expires: 7 }); // 7 days
        set({ isAuthenticated: true, isInitialized: true });
      },

      logout: () => {
        Cookies.remove("access_token");
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },

      fetchUser: async () => {
        const token = Cookies.get("access_token");
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });
          const user = await authAPI.getProfile();
          set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
        } catch (error) {
          Cookies.remove("access_token");
          set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
      },

      // Check auth status on app initialization
      checkAuth: async () => {
        const { isInitialized } = get();
        
        // If already initialized, don't check again
        if (isInitialized) return;
        
        const token = Cookies.get("access_token");
        
        // No token = not authenticated
        if (!token) {
          set({ isAuthenticated: false, isInitialized: true, isLoading: false });
          return;
        }
        
        // Has token, verify it by fetching user
        try {
          set({ isLoading: true });
          const user = await authAPI.getProfile();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            isInitialized: true 
          });
        } catch (error) {
          // Token invalid, clear it
          Cookies.remove("access_token");
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            isInitialized: true 
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        // Don't persist isInitialized - we want to check on each page load
      }),
    }
  )
);

// ==========================================
// DASHBOARD STORE
// ==========================================
interface DashboardState {
  data: StudentDashboard | null;
  isLoading: boolean;
  error: string | null;
  
  setData: (data: StudentDashboard | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ==========================================
// SUBJECTS STORE
// ==========================================
interface SubjectsState {
  subjects: string[];
  selectedSubjects: string[];
  isLoading: boolean;
  
  setSubjects: (subjects: string[]) => void;
  toggleSubject: (subject: string) => void;
  setSelectedSubjects: (subjects: string[]) => void;
  clearSelection: () => void;
}

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  subjects: [],
  selectedSubjects: [],
  isLoading: false,

  setSubjects: (subjects) => set({ subjects }),
  
  toggleSubject: (subject) => {
    const { selectedSubjects } = get();
    if (selectedSubjects.includes(subject)) {
      set({ selectedSubjects: selectedSubjects.filter((s) => s !== subject) });
    } else {
      set({ selectedSubjects: [...selectedSubjects, subject] });
    }
  },
  
  setSelectedSubjects: (subjects) => set({ selectedSubjects: subjects }),
  clearSelection: () => set({ selectedSubjects: [] }),
}));

// ==========================================
// UI STORE (Theme, Modals, etc.)
// ==========================================
interface UIState {
  theme: "light" | "dark";
  isSidebarOpen: boolean;
  activeModal: string | null;
  
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      isSidebarOpen: true,
      activeModal: null,

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
