import React from "react";
import { project as projectApi } from "../../../api";

projectApi.list(1).then(v => {console.info(v);})

export default function App() {
    return <div>项目管理</div>;
}
