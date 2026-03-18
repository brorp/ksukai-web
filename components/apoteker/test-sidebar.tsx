"use client";

import { useState } from "react";

import ScientificCalculator from "./scientific-calculator";
import LabValuesModal from "./lab-values-modal";

export default function TestSidebar() {
  const [showCalculator, setShowCalculator] = useState(true);

  return (
    <aside className="hidden md:flex md:flex-col md:w-80 bg-white border-r border-gray-200 overflow-y-auto gap-4 p-4">
      <ScientificCalculator
        showCalculator={showCalculator}
        setShowCalculator={setShowCalculator}
      />
      <LabValuesModal />
    </aside>
  );
}
