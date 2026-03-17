import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

export const getEmployees = () => axios.get(`${API_URL}/employees/`);
export const createEmployee = (data) => axios.post(`${API_URL}/employees/`, data);

export const getLeaves = () => axios.get(`${API_URL}/leaves/`);
export const requestLeave = (data) => axios.post(`${API_URL}/leaves/`, data);
export const updateLeaveStatus = (id, data) => axios.put(`${API_URL}/leaves/${id}`, data);