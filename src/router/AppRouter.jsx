import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../components/HomePage";
import PromiseDetail from "../components/PromiseDetail";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/promise/:id" element={<PromiseDetail />} />
      {/* /write 경로를 제거하고 항상 /promise/:id 경로를 통해 접근하도록 함 */}
    </Routes>
  );
}

export default AppRouter;
