/* eslint-disable no-unused-vars */
import React from 'react';
import NextHead from 'next/head.js';

const Head = ({ title, description }) => (
  <NextHead>
    <meta charSet='UTF-8'/>
    <title>{title}</title>
    <meta name='description' content={ description }/>
    <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'/>
  </NextHead>
);

export default Head;
