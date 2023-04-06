import { get, post, del } from "./fetchTool";

function list(pageNo: number, name: string = "", order = "", seq = "") {
    return get("/project/list", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function listAll() {
    return get("/project/list_all");
}

function modules(projectId: number, pageNo: number, name: string = "", order = "", seq = "") {
    return get(`/project/${projectId}/module`, {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function modulesAll(projectId: number, type:number=0) {
    return get(`/project/${projectId}/module_all/${type}`);
}

function create(values: { [propName: string]: string | number }) {
    return post("/project/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/project/update", values);
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
    edit,
    create,
    remove
};
