import { post, del } from "./fetchTool";

function create(values: { [propName: string]: string | number }) {
    return post("/module/create", values);
}

function edit(values: { [propName: string]: string | number }) {
    return post("/module/edit", values);
}

function remove(id: string) {
    return del("/module/delete", {
        id
    });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    create,
    edit,
    remove
};
