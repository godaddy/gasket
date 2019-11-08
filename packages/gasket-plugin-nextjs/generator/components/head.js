/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import NextHead from 'next/head';

const Head = ({ title, description }) => (
  <NextHead>
    <meta charSet='UTF-8'/>
    <title>{title}</title>
    <meta name='description' content={ description }/>
    <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'/>
  </NextHead>
);

Head.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};

Head.defaultProps = {
  title: '{{{appName}}}',
  description: '{{{appDescription}}}'
};

export default Head;
