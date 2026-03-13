import { create } from "zustand";
import { User } from "../types";

interface UsersStore {
  users: User[];
  loadUsers: () => void;
  addUsers: (users: User[]) => void;
  generateUsers: (count: number) => void;
  deleteUser: (userId: string) => void;
  getApoteker: () => User[];
  getAdmins: () => User[];
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],

  loadUsers: () => {
    const usersJson = localStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    set({ users });
  },

  addUsers: (newUsers: User[]) => {
    const usersJson = localStorage.getItem("users");
    const existingUsers = usersJson ? JSON.parse(usersJson) : [];
    const allUsers = [...existingUsers, ...newUsers];
    localStorage.setItem("users", JSON.stringify(allUsers));
    set({ users: allUsers });
  },

  generateUsers: (count: number) => {
    const usersJson = localStorage.getItem("users");
    const existingUsers = usersJson ? JSON.parse(usersJson) : [];

    const newUsers: User[] = [];
    for (let i = 0; i < count; i++) {
      const username = `apoteker${String(existingUsers.length + i + 1).padStart(3, "0")}`;
      const password = `Pass${Math.random().toString(36).substr(2, 9)}`;

      newUsers.push({
        id: `apoteker_${Date.now()}_${i}`,
        username,
        password,
        name: `Apoteker ${existingUsers.length + i + 1}`,
        role: "apoteker",
        createdAt: new Date(),
      });
    }

    const allUsers = [...existingUsers, ...newUsers];
    localStorage.setItem("users", JSON.stringify(allUsers));
    set({ users: allUsers });
  },

  deleteUser: (userId: string) => {
    const users = get().users.filter((u) => u.id !== userId);
    localStorage.setItem("users", JSON.stringify(users));
    set({ users });
  },

  getApoteker: () => {
    return get().users.filter((u) => u.role === "apoteker");
  },

  getAdmins: () => {
    return get().users.filter((u) => u.role === "admin");
  },
}));
