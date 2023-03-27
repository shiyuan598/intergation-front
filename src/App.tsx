import React, { useState } from 'react';
import { UserContext } from './context';
import Auth from "./Auth";

function App() {
  const [userInfo, setUserInfo] = useState({});
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }} >
      <Auth></Auth>
    </UserContext.Provider>
  );
}

export default App;
