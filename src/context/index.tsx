import { createContext } from "react";

export const ModalContext:
    | {
          modalShow?: boolean;
          setModalShow?: Function;
          curRow?: object;
          setCurRow?: Function;
      }
    | any = createContext(null);

export const DataContext:
    | {
          vehicleNum?: number;
          noticeNum?: number;
          orderNum?: number;
          setVehicleNum?: Function;
          setNoticeNum?: Function;
          setOrderNum?: Function;
          userNum?: number;
          setUserNum?: Function;
      }
    | any = createContext(null);

export const UserContext:
    | {
          userInfo: {
              username: string;
              role: number;
              token?: string;
          };
          setUserInfo: Function;
      }
    | any = createContext({});
