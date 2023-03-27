import { get, post, del } from "./fetchTool";

function getTotal(orderId: number, vehicleNo: string) {
    return get("/fuel/total", {
        orderId,
        vehicleNo
    });
}

function addFuel(values: { [propName: string]: string | number }) {
    return post("/fuel/add", values);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    getTotal,
    addFuel
};
