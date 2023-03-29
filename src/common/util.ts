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
