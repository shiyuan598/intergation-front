import { get, post, del } from "./fetchTool";

function getOrder(params: { [propName: string]: string | number }) {
    return get("/order/list", {
        ...params,
        name: encodeURIComponent(params.name)
    });
}

function getOrderApproved(driver: number, order: string, filter: string) {
    return get("/order/list", {
        driver,
        order,
        filter
    });
}

function addOrder(values: { [propName: string]: string | number }) {
    return post("/order/add", values);
}

function deleteOrder(id: number) {
    return del("/order/delete", {
        id
    });
}

function cancelOrder(id: number) {
    return post("/order/cancel", {
        id
    });
}

function startOrder(id: number) {
    return post("/order/start", {
        id
    });
}

function stopOrder(id: number) {
    return post("/order/stop", {
        id
    });
}

function approveOrder(values: { [propName: string]: string | number }) {
    return post("/order/update", values);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getOrder,
    getOrderApproved,
    addOrder,
    deleteOrder,
    cancelOrder,
    startOrder,
    stopOrder,
    approveOrder
};
