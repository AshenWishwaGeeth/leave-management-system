import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";
const TOKEN_KEY = "lms_token";
const USER_KEY = "lms_user";

const client = axios.create({
	baseURL: API_URL,
});

client.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_KEY);
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const saveSession = (token, user) => {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw);
	} catch (_) {
		return null;
	}
};

export const hasSession = () => Boolean(localStorage.getItem(TOKEN_KEY));

export const register = (data) => client.post("/auth/register", data);
export const login = (data) => client.post("/auth/login", data);
export const getMe = () => client.get("/auth/me");
export const getDashboardSummary = () => client.get("/dashboard/summary");

export const getEmployees = (params = {}) => client.get("/employees/", { params });
export const createEmployee = (data) => client.post("/employees/", data);
export const updateEmployee = (id, data) => client.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => client.delete(`/employees/${id}`);

export const getLeaves = (params = {}) => client.get("/leaves/", { params });
export const requestLeave = (data) => client.post("/leaves/", data);
export const updateLeaveStatus = (id, data) => client.put(`/leaves/${id}`, data);