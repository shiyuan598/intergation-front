export const transformPhoneNumber = (mobile_phone: string) => {
    let res = mobile_phone.replace(/^(.{3})(.*)(.{4})$/, "$1-$2-$3");
    return res;
};

export const throttle = (fn: Function, delay: number = 1000) => {
    let timer: any = null;
    return (...args: any) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export const saveFile = (v: string, name: string) => {
    let blob = new Blob([v]);
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
};

// 拼接两个路径，正确处理路径间的斜线
export const joinPath = (pre: string, sub: string) => {
    return  `${pre.replace(/\/$/, '')}/${sub.replace(/^\//, '')}`;
}