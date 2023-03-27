import { get } from "./fetchTool";

// 查询所属项目
function getProject() {
    return get("/dict/project");
}

// 查询所属模块
function getModule(pid = 0) {
    return get("/dict/module", { pid: pid });
}

// 查询车辆带挂
function getLoad() {
    return get("/dict/load");
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getProject,
    getModule,
    getLoad
};
