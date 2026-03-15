import { create } from "zustand";
import { LegacyManagedUser } from "../legacy-admin-types";

interface UsersStore {
  users: LegacyManagedUser[];
  loadUsers: () => void;
  addUsers: (users: LegacyManagedUser[]) => void;
  generateUsers: (count: number) => void;
  deleteUser: (userId: string) => void;
  getApoteker: () => LegacyManagedUser[];
  getAdmins: () => LegacyManagedUser[];
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],

  loadUsers: () => {
    const usersJson = localStorage.getItem("users");
    const users = usersJson ? JSON.parse(usersJson) : [];
    set({
      users: users.map((user: LegacyManagedUser) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })),
    });
  },

  addUsers: (newUsers: LegacyManagedUser[]) => {
    const usersJson = localStorage.getItem("users");
    const existingUsers = usersJson ? JSON.parse(usersJson) : [];
    const allUsers = [...existingUsers, ...newUsers];
    localStorage.setItem("users", JSON.stringify(allUsers));
    set({ users: allUsers });
  },

  generateUsers: (count: number) => {
    const usersJson = localStorage.getItem("users");
    const existingUsers = usersJson ? JSON.parse(usersJson) : [];

    const newUsers: LegacyManagedUser[] = [];
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
