import { get, post, del } from "./fetchTool";

function list(pageNo: number, name: string = "", order = "", seq = "") {
    return get("/project/list", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function listAll(username: string) {
    return get("/project/list_all", {
        user_name: username
    });
}

function modules(projectId: number, pageNo: number, name: string = "", order = "", seq = "") {
    return get(`/project/${projectId}/module`, {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function modulesAll(projectId: number, type = "") {
    return get(`/project/${projectId}/module_all`, { type });
}

function checkNameNoExist(name:string) {
    return get("/project/check/noexist", {name})
}

function create(values: { [propName: string]: string | number }) {
    return post("/project/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/project/edit", values);
}

function remove(id: string) {
    return del("/project/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    listAll,
    modules,
    modulesAll,
    checkNameNoExist,
    create,
    edit,
    remove
};
