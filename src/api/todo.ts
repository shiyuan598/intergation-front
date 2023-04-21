import { get, post } from "./fetchTool";

function list(user_id:number, pageNo: number, order = "", seq = "", state=0) {
    return get("/todo/list", {
        user_id,
        pageNo,
        order,
        seq,
        state
    });
}

function handle(values: { [propName: string]: string | number }) {
    return post("/todo/handle", values);
}

function prompt(values: { [propName: string]: string | number }) {
    return post("/todo/prompt", values);
}


// eslint-disable-next-line import/no-anonymous-default-export
export default {
    list,
    handle,
    prompt
};
