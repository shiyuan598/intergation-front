import { get, post, del } from "./fetchTool";

function list(pageNo: number, user_id:number, name: string = "", order = "", seq = "") {
    return get("/api_process/list", {
        pageNo,
        user_id,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function create(values: { [propName: string]: string | number }) {
    return post("/api_process/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/api_process/edit", values);
}

function update(values: { [propName: string]: string | number }) {
    return post("/api_process/update_module", values);
}

function remove(id: string) {
    return del("/api_process/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    edit,
    create,
    update,
    remove
};
