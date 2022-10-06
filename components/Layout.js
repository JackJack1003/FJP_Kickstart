import React from 'react';
import Header from './Header';
import { Container } from 'semantic-ui-react';
const Layout = (props) => {
  return (
    <Container>{props.children}</Container>
    //props.children is die binnekant van die component wat verander word op elke page
  );
};
export default Layout;
