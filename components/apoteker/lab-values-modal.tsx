"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestTubes, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const labValues = [
  { test: "Hemoglobin (Hb)", normal: "12-16 g/dL", category: "Blood" },
  { test: "Hematokrit (Hct)", normal: "36-46%", category: "Blood" },
  { test: "Leukosit (WBC)", normal: "4.5-11.0 x10³/μL", category: "Blood" },
  { test: "Trombosit", normal: "150-400 x10³/μL", category: "Blood" },
  { test: "Eritrosit (RBC)", normal: "4.2-5.4 x10⁶/μL", category: "Blood" },
  { test: "Glukosa Puasa", normal: "70-100 mg/dL", category: "Chemistry" },
  { test: "Glukosa 2 Jam PP", normal: "< 140 mg/dL", category: "Chemistry" },
  { test: "Kolesterol Total", normal: "< 200 mg/dL", category: "Chemistry" },
  { test: "LDL", normal: "< 130 mg/dL", category: "Chemistry" },
  {
    test: "HDL",
    normal: "> 40 mg/dL (L), > 50 mg/dL (P)",
    category: "Chemistry",
  },
  { test: "Trigliserida", normal: "< 150 mg/dL", category: "Chemistry" },
  { test: "Ureum", normal: "7-20 mg/dL", category: "Chemistry" },
  { test: "Kreatinin", normal: "0.7-1.3 mg/dL", category: "Chemistry" },
  { test: "Bilirubin Total", normal: "0.1-1.2 mg/dL", category: "Chemistry" },
  { test: "Bilirubin Direk", normal: "0.0-0.3 mg/dL", category: "Chemistry" },
  { test: "AST (SGOT)", normal: "10-40 U/L", category: "Chemistry" },
  { test: "ALT (SGPT)", normal: "7-56 U/L", category: "Chemistry" },
  { test: "Kalium (K)", normal: "3.5-5.0 mEq/L", category: "Electrolyte" },
  { test: "Natrium (Na)", normal: "135-145 mEq/L", category: "Electrolyte" },
  { test: "Klorida (Cl)", normal: "96-106 mEq/L", category: "Electrolyte" },
  { test: "Fosfor (P)", normal: "2.5-4.5 mg/dL", category: "Chemistry" },
  { test: "Kalsium (Ca)", normal: "8.5-10.2 mg/dL", category: "Chemistry" },
  { test: "Albumin", normal: "3.5-5.0 g/dL", category: "Chemistry" },
  { test: "Protein Total", normal: "6.0-8.3 g/dL", category: "Chemistry" },
  { test: "IMT (BMI)", normal: "18.5-24.9 kg/m²", category: "Vital" },
];

export default function LabValuesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Blood", "Chemistry", "Electrolyte", "Vital"];
  const filteredValues = selectedCategory
    ? labValues.filter((lv) => lv.category === selectedCategory)
    : labValues;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
      >
        <TestTubes size={18} />
        Nilai Lab Normal
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nilai Normal Laboratorium</DialogTitle>
            <DialogDescription>
              Referensi nilai normal untuk tes laboratorium umum
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setSelectedCategory(null)}
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
              >
                Semua
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Table */}
            <ScrollArea className="h-96">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Pemeriksaan</TableHead>
                    <TableHead>Nilai Normal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValues.map((value, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-sm">
                        {value.test}
                      </TableCell>
                      <TableCell className="text-sm ">{value.normal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-end">
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
