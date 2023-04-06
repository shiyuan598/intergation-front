import React from "react";
import ApiList from "./api/index";
import AppList from "./appIntegration";
import { Tabs } from "antd";

export default function App() {
    return (
        <div>
            <Tabs defaultActiveKey="1" items={
                [{
                    key: "1",
                    label: "接口集成",
                    children: <ApiList />
                }, {
                    key: "2",
                    label: "应用集成",
                    children: <AppList />
                }]
            }></Tabs>
        </div>
    );
}
