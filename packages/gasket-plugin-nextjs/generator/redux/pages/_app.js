import React from 'react';
import App from 'next/app';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import makeStore from '@gasket/redux/make-store';

class MyApp extends App {
  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={ store }>
        <Component { ...pageProps } />
      </Provider>
    );
  }
}

export default withRedux(makeStore)(MyApp);
