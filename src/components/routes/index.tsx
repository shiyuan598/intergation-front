import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Order from '../../views/main/order/index';
import Version from '../../views/main/version/index';
import User from '../../views/main/user/index';

function RouteList() {
    return (
        <Switch>
            <Route path="/main/order" render={() => (<Order />)}></Route>
            <Route path="/main/version" render={() => (<Version />)}></Route>
            <Route path="/main/user" render={() => (<User />)}></Route>
            <Redirect from="/main" to="/main/order"></Redirect>
        </Switch>
    );
}

export default React.memo(RouteList);

