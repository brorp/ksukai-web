"use client";

import { useEffect, useState } from "react";
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
import { useScoresStore } from "@/lib/store/scores";
import { TestResult } from "@/lib/types";
import { Download, ArrowUpDown } from "lucide-react";

type SortKey = "username" | "score" | "completedAt";
type SortOrder = "asc" | "desc";

export default function ScoresTable() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("completedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const scoresStore = useScoresStore();

  useEffect(() => {
    scoresStore.loadResults();
    setResults(scoresStore.results);
    setFilteredResults(scoresStore.results);
  }, []);

  // Handle search filter
  useEffect(() => {
    const filtered = results.filter((result) =>
      result.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredResults(filtered);
  }, [searchTerm, results]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedResults = [...filteredResults].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortKey) {
      case "username":
        aValue = a.username;
        bValue = b.username;
        break;
      case "score":
        aValue = a.score;
        bValue = b.score;
        break;
      case "completedAt":
        aValue = new Date(a.completedAt).getTime();
        bValue = new Date(b.completedAt).getTime();
        break;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = [
      "Username",
      "Nama",
      "Nilai",
      "Jawaban Benar",
      "Total Soal",
      "Tanggal Selesai",
    ];
    const rows = sortedResults.map((result) => [
      result.username,
      result.username,
      result.score,
      result.correctAnswers,
      result.totalQuestions,
      new Date(result.completedAt).toLocaleDateString("id-ID"),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `scores-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.click();
  };

  const exportToPDF = () => {
    // Simple PDF-like export using text format
    let content = "LAPORAN HASIL UJIAN Apoteker\n";
    content += "================================\n\n";
    content += `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}\n`;
    content += `Total Peserta: ${sortedResults.length}\n`;
    content += `Rata-rata Nilai: ${Math.round(sortedResults.reduce((sum, r) => sum + r.score, 0) / sortedResults.length)}\n\n`;

    content += "DETAIL HASIL:\n";
    content += "--------------------------------\n";

    sortedResults.forEach((result) => {
      content += `\nUsername: ${result.username}\n`;
      content += `Nilai: ${result.score}\n`;
      content += `Jawaban Benar: ${result.correctAnswers}/${result.totalQuestions}\n`;
      content += `Tanggal Selesai: ${new Date(result.completedAt).toLocaleDateString("id-ID")}\n`;
      content += "--------------------------------\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `scores-${new Date().toISOString().split("T")[0]}.txt`,
    );
    link.click();
  };

  const SortButton = ({
    column,
    label,
  }: {
    column: SortKey;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-2 hover:text-blue-600 font-semibold cursor-pointer"
    >
      {label}
      {sortKey === column && <ArrowUpDown size={14} />}
    </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hasil Ujian Peserta</CardTitle>
          <CardDescription>Total: {results.length} hasil ujian</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Export Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Cari berdasarkan username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Laporan
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>
                    <SortButton column="username" label="Username" />
                  </TableHead>
                  <TableHead>
                    <SortButton column="score" label="Nilai" />
                  </TableHead>
                  <TableHead>Jawaban Benar</TableHead>
                  <TableHead>Total Soal</TableHead>
                  <TableHead>
                    <SortButton column="completedAt" label="Tanggal" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500 py-8"
                    >
                      Tidak ada data hasil ujian
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className=" text-sm font-semibold">
                        {result.username}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold text-lg ${
                            result.score >= 80
                              ? "text-green-600"
                              : result.score >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {result.score}
                        </span>
                      </TableCell>
                      <TableCell>{result.correctAnswers}</TableCell>
                      <TableCell>{result.totalQuestions}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(result.completedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Statistics */}
          {sortedResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    sortedResults.reduce((sum, r) => sum + r.score, 0) /
                      sortedResults.length,
                  )}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(...sortedResults.map((r) => r.score))}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Nilai Terendah</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.min(...sortedResults.map((r) => r.score))}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
