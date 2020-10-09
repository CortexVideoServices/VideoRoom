import React from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import './styles/App.css';
import SignUpStart from './forms/SignUpStart';
import Login from './forms/Login';

function Welcome() {
  const [tabIndex, setTabIndex] = React.useState(0);
  return (
    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
      <TabList>
        <Tab>
          I have an
          <br />
          account
        </Tab>
        <Tab>
          I have not
          <br />
          an account
        </Tab>
        <Tab>
          I have a
          <br />
          call link
        </Tab>
      </TabList>
      <TabPanel>
        <Login />
      </TabPanel>
      <TabPanel>
        <SignUpStart />
      </TabPanel>
      <TabPanel />
    </Tabs>
  );
}

export default Welcome;
