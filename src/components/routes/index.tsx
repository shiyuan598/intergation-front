import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Process from "../../views/main/process/index";
import Project from "../../views/main/project/index";
import Module from "../../views/main/project/module";
import Todo from "../../views/main/todo/index";
import User from "../../views/main/user/index";

function RouteList() {
    return (
        <Switch>
            <Route path="/main/process" render={() => <Process />}></Route>
            <Route path="/main/project" render={() => <Project />}></Route>
            <Route path="/main/module" render={() => <Module />}></Route>
            <Route path="/main/todo" render={() => <Todo />}></Route>
            <Route path="/main/user" render={() => <User />}></Route>
            <Redirect from="/main" to="/main/process"></Redirect>
        </Switch>
    );
}

export default React.memo(RouteList);
