import React, { Component } from 'react';
import { Button } from 'antd';
import qs from 'qs';
import Ding from 'components/Ding';

export default class Home extends Component {
  componentDidMoun() {
    qs.parse('name=11&age=2222')
  }
  render() {
    return <div>
      other
      <Button type="primary">我是按钮</Button>
      <Ding/>
    </div>
  }
}