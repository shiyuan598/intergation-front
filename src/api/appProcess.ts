import { get, post, del } from "./fetchTool";

function list(pageNo: number, user_id:number, name: string = "", order = "", seq = "") {
    return get("/app_process/list", {
        pageNo,
        user_id,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function getModulesInfo(id:number) {
    return get("/app_process/modules", {
        id
    });
}

function create(values: { [propName: string]: string | number }) {
    return post("/app_process/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/app_process/edit", values);
}

function update(values: { [propName: string]: string | number }) {
    return post("/app_process/update_module", values);
}

function remove(id: string) {
    return del("/app_process/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    getModulesInfo,
    edit,
    create,
    update,
    remove
};
