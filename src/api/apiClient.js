import axios from 'axios';

// Ensure API_BASE_URL ends with /api
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  me: async () => {
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    if (!user.email) {
      throw new Error('Not authenticated');
    }
    return user;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('current_user');
  },

  logout: () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
  },

  redirectToLogin: () => {
    window.location.href = '/login';
  },

  setUser: (user) => {
    localStorage.setItem('current_user', JSON.stringify(user));
  }
};

export const entities = {
  UserProfile: {
    filter: async (params) => {
      const user = await auth.me();
      const response = await apiClient.get(`/profiles/${user.email}`);
      return [response.data];
    },

    create: async (data) => {
      const user = await auth.me();
      const response = await apiClient.post('/profiles/calibrate', {
        user_id: user.email,
        email: user.email,
        answers: data,
        language: data.language
      });
      return response.data;
    },

    update: async (id, data) => {
      const user = await auth.me();
      const response = await apiClient.put(`/profiles/${user.email}`, data);
      return response.data;
    }
  },

  Problem: {
    filter: async (params) => {
      const queryParams = new URLSearchParams();
      if (params.is_active !== undefined) {
        queryParams.append('is_active', params.is_active);
      }
      const response = await apiClient.get(`/problems?${queryParams}`);
      return response.data;
    },

    create: async (data) => {
      const user = await auth.me();
      const response = await apiClient.post('/problems/generate', {
        ...data,
        user_id: user.email
      });
      return response.data;
    }
  },

  ArenaSession: {
    create: async (data) => {
      const user = await auth.me();
      const response = await apiClient.post('/arena/start', {
        user_id: user.email,
        problem_id: data.problem_id
      });
      return response.data;
    },

    update: async (id, data) => {
      if (data.status === 'abandoned') {
        const response = await apiClient.post('/arena/abandon', {
          session_id: id
        });
        return response.data;
      }
      return { id, ...data };
    }
  },

  Achievement: {
    create: async (data) => {
      return data;
    }
  },

  Artifact: {
    create: async (data) => {
      return data;
    }
  }
};

export const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      return {};
    }
  }
};

export const api = {
  profiles: {
    calibrate: async (answers, language) => {
      const user = await auth.me();
      const response = await apiClient.post('/profiles/calibrate', {
        user_id: user.email,
        email: user.email,
        answers,
        language
      });
      return response.data;
    },

    get: async (userId) => {
      const response = await apiClient.get(`/profiles/${userId}`);
      return response.data;
    },

    update: async (userId, data) => {
      const response = await apiClient.put(`/profiles/${userId}`, data);
      return response.data;
    },

    getLeaderboard: async () => {
      const response = await apiClient.get('/profiles');
      return response.data;
    }
  },

  problems: {
    generate: async (profile, customization = null) => {
      const user = await auth.me();
      const response = await apiClient.post('/problems/generate', {
        profile,
        customization,
        user_id: user.email
      });
      return response.data;
    },

    list: async (filters = {}) => {
      const user = await auth.me();
      const queryParams = new URLSearchParams();
      if (filters.difficulty_min) queryParams.append('difficulty_min', filters.difficulty_min);
      if (filters.difficulty_max) queryParams.append('difficulty_max', filters.difficulty_max);
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
      // Add user_id to filter personalized problems
      queryParams.append('user_id', user.email);

      const response = await apiClient.get(`/problems?${queryParams}`);
      return response.data;
    },

    get: async (problemId) => {
      const response = await apiClient.get(`/problems/${problemId}`);
      return response.data;
    }
  },

  arena: {
    start: async (problemId) => {
      const user = await auth.me();
      const response = await apiClient.post('/arena/start', {
        user_id: user.email,
        problem_id: problemId
      });
      return response.data;
    },

    submit: async (sessionId, solution, timeElapsed, metadata = null) => {
      const response = await apiClient.post('/arena/submit', {
        session_id: sessionId,
        solution,
        time_elapsed: timeElapsed,
        ...(metadata && { metadata })
      });
      return response.data;
    },

    abandon: async (sessionId) => {
      const response = await apiClient.post('/arena/abandon', {
        session_id: sessionId
      });
      return response.data;
    },

    getUserSessions: async (userId) => {
      const response = await apiClient.get(`/arena/user/${userId}`);
      return response.data;
    },

    // Real-time tracking endpoints
    initSession: async (sessionId, problemId, userId) => {
      const response = await apiClient.post('/arena/init-session', {
        session_id: sessionId,
        problem_id: problemId,
        user_id: userId
      });
      return response.data;
    },

    trackKeystroke: async (sessionId, keystrokeData) => {
      const response = await apiClient.post('/arena/track', {
        session_id: sessionId,
        keystroke_data: keystrokeData
      });
      return response.data;
    },

    getNextAction: async (sessionId) => {
      const response = await apiClient.get(`/arena/next-action/${sessionId}`);
      return response.data;
    },

    respondToIntervention: async (sessionId, responseType) => {
      const response = await apiClient.post('/arena/intervention-response', {
        session_id: sessionId,
        response_type: responseType
      });
      return response.data;
    },

    getMetrics: async (sessionId) => {
      const response = await apiClient.get(`/arena/metrics/${sessionId}`);
      return response.data;
    }
  },

  mentor: {
    generateQuestion: async (problemId, context = 'initial') => {
      const user = await auth.me();
      const response = await apiClient.post('/mentor/question', {
        user_id: user.email,
        problem_id: problemId,
        context
      });
      return response.data.question;
    }
  },

  user: {
    getAchievements: async (userId) => {
      const response = await apiClient.get(`/user/achievements/${userId}`);
      return response.data;
    },

    getArtifacts: async (userId) => {
      const response = await apiClient.get(`/user/artifacts/${userId}`);
      return response.data;
    }
  }
};

export default {
  auth,
  entities,
  integrations,
  api
};
