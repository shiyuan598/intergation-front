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
          apiProcessNum?: number;
          setApiProcessNum?: Function;
          appProcessNum?: number;
          setAppProcessNum?: Function;
          projectNum?: number;
          setProjectNum?: Function;
          moduleNum?: number;
          setModuleNum?: Function;
          todoNum?: number;
          setTodoNum?: Function;
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
