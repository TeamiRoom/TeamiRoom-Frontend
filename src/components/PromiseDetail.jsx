import React from "react";
import { useParams } from "react-router-dom";
import WriteForm from "./WriteForm";

function PromiseDetail() {
  const { id } = useParams();

  return (
    <div className="promise-detail">
      <WriteForm id={id} />
    </div>
  );
}

export default PromiseDetail;
