"use client";

import ScientificCalculator from "./simple-calculator";
import LabValuesModal from "./lab-values-modal";

export default function TestSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-80 bg-white border-r border-gray-200 overflow-y-auto gap-4 p-4">
      <ScientificCalculator />
      <LabValuesModal />
    </aside>
  );
}
