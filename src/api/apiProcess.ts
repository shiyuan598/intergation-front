import { get, post, del } from "./fetchTool";

function list(pageNo: number, name: string = "", order = "", seq = "") {
    return get("/data/api_process.json", {
        pageNo,
        name: encodeURIComponent(name),
        order,
        seq
    });
}

function add(values: { [propName: string]: string | number }) {
    return post("/process/api/add", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/process/api/update", values);
}

function remove(id: string) {
    return del("/process/api/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    edit,
    add,
    remove
};
