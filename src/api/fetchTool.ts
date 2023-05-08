declare global {
    interface Window {
        globalConfig?: any;
    }
}
const globalConfig = window.globalConfig;
const baseUrl = globalConfig.api;

const checkResponse = (response: Response) => {
    if (response.status === 500) {
        return Promise.reject("系统出错，请联系管理员！");
    }
    if (response.status === 504) {
        return Promise.reject("系统繁忙，请稍后重试！");
    }
    if (response.status === 401) {
        localStorage.setItem("userInfo", "{}");
        sessionStorage.setItem("mapReload", "");
        window.location.href = "/login";
        return Promise.reject("您没有权限或未登录！");
    }

    return Promise.resolve();
};
const getAuthorization = () => {
    let Authorization = "";
    try {
        let data = localStorage.getItem("userInfo");
        const userInfo = JSON.parse(data as string);
        Authorization = userInfo?.token;
    } catch (error) {
        Authorization = "";
    }
    return Authorization ? Authorization : "null";
};
export const get = (url: string, params?: { [propName: string]: string | number | boolean | number[] }, blob: boolean = false) => {
    url = baseUrl + url;
    if (params) {
        const paramStr = Object.keys(params)
            .map((key) => `${key}=${params[key]}`)
            .join("&");
        url = `${url}?${paramStr}`;
    }
    return fetch(url, {
        headers: {
            Authorization: getAuthorization()
        }
    }).then((v) => {
        return checkResponse(v).then(
            () => {
                if (blob) {
                    return v.blob();
                }
                return v.json();
            },
            (msg) => {
                return Promise.resolve({ code: 1, msg });
            }
        );
    });
};

export const post = (url: string, params?: { [propName: string]: string | number | object }) => {
    return fetch(baseUrl + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorization()
        },
        body: JSON.stringify(params)
    }).then((v) => {
        return checkResponse(v).then(
            () => {
                return v.json();
            },
            (msg) => {
                return Promise.resolve({ code: 1, msg });
            }
        );
    });
};

export const del = (url: string, params?: { [propName: string]: string | number }) => {
    return fetch(baseUrl + url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: getAuthorization()
        },
        body: JSON.stringify(params)
    }).then((v) => {
        return checkResponse(v).then(
            () => {
                return v.json();
            },
            (msg) => {
                return Promise.resolve({ code: 1, msg });
            }
        );
    });
};
