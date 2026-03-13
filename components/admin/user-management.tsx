"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateUserSchema, type GenerateUserFormData } from "@/lib/schemas";
import { useUsersStore } from "@/lib/store/users";
import {
  Trash2,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  UserPlus,
  Search,
  CheckCircle2,
} from "lucide-react";
import { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");

  const usersStore = useUsersStore();

  const batchForm = useForm<GenerateUserFormData>({
    resolver: zodResolver(generateUserSchema),
    defaultValues: { count: 5 },
  });

  const [singleUser, setSingleUser] = useState({
    name: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    usersStore.loadUsers();
  }, []);

  useEffect(() => {
    setUsers(usersStore.users);
  }, [usersStore.users]);

  const onBatchSubmit = (data: GenerateUserFormData) => {
    usersStore.generateUsers(data.count);
    batchForm.reset();
  };

  const handleGeneratePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0; i < 8; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setSingleUser({ ...singleUser, password: retVal });
  };

  const handleAddSingleUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUser.name || !singleUser.username || !singleUser.password)
      return;

    usersStore.addUsers([
      {
        id: `apt_${Date.now()}`,
        name: singleUser.name,
        username: singleUser.username,
        password: singleUser.password,
        role: "apoteker",
        createdAt: new Date(),
      },
    ]);

    setIsAddModalOpen(false);
    setSingleUser({ name: "", username: "", password: "" });
  };

  const handleDelete = () => {
    if (deleteUserId) {
      usersStore.deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 border-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mass Generate Card */}
        <Card className="md:col-span-2 border shadow-sm rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-600" />
              Mass Generate Akun
            </CardTitle>
            <CardDescription>
              Buat akun apoteker otomatis dalam jumlah besar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...batchForm}>
              <form
                onSubmit={batchForm.handleSubmit(onBatchSubmit)}
                className="flex items-end gap-4"
              >
                <FormField
                  control={batchForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Jumlah Pengguna
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          className="h-10 rounded-lg bg-slate-50 focus:ring-blue-600"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-medium shadow-sm"
                >
                  <Plus size={18} className="mr-2" /> Generate
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Add Single User Trigger */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all p-6 border-none">
              <UserPlus size={28} />
              <div className="text-center">
                <p className="font-semibold text-sm uppercase">Tambah Satu</p>
                <p className="text-[10px] opacity-90 font-normal">
                  Input Manual
                </p>
              </div>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-xl p-8 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Input Apoteker
              </DialogTitle>
              <DialogDescription>
                Masukkan detail akun apoteker secara manual.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSingleUser} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Nama Lengkap
                </label>
                <Input
                  placeholder="apt. Nama..."
                  className="rounded-lg h-10 bg-slate-50"
                  value={singleUser.name}
                  onChange={(e) =>
                    setSingleUser({ ...singleUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Username
                </label>
                <Input
                  placeholder="apt001"
                  className="rounded-lg h-10 bg-slate-50"
                  value={singleUser.username}
                  onChange={(e) =>
                    setSingleUser({ ...singleUser, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="Password"
                    className="rounded-lg h-10 bg-slate-50 pr-10"
                    value={singleUser.password}
                    onChange={(e) =>
                      setSingleUser({ ...singleUser, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg font-semibold mt-2 shadow-sm"
              >
                Simpan Akun
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section */}
      <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="p-6 pb-4 border-b bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              Data Pengguna
              <span className="bg-blue-100 text-blue-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {users.length}
              </span>
            </CardTitle>
            <CardDescription>
              Manajemen akses portal CBT Apoteker
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            <Input
              placeholder="Cari..."
              className="pl-9 h-9 text-sm rounded-lg bg-slate-50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider pl-6 py-4">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Username
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Password
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Dibuat
                  </TableHead>
                  <TableHead className="w-16 pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground italic"
                    >
                      Tidak ada pengguna ditemukan...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
                            {user.name}
                            {user.role === "admin" && (
                              <CheckCircle2
                                size={12}
                                className="text-purple-500"
                              />
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground italic">
                          {user.username}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 min-w-22.5 text-center">
                            {visiblePasswords[user.id]
                              ? user.password
                              : "••••••••"}
                          </div>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                          >
                            {visiblePasswords[user.id] ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="pr-6">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold">
              Hapus Akun?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini permanen. Akun tersebut tidak akan bisa lagi
              mengakses portal CBT Apoteker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 mt-4 justify-end">
            <AlertDialogCancel className="rounded-lg h-9 text-sm">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-500 hover:bg-rose-600 rounded-lg h-9 text-sm shadow-sm"
            >
              Hapus Akun
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
