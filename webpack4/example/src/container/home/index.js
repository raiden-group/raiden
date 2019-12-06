import React, { Component } from 'react';
import { Button } from 'antd';
import qs from 'qs'
import Ding from 'components/Ding';
import './index.less';

import img from 'img/logo.png';
import bigImg from 'img/big.jpeg';

import './index.less';
export default class Home extends Component {
  componentDidMoun() {
    qs.parse('name=11&age=2222')
  }
  render() {
    return <div className='home-wrap'>
        {/* <textarea/>   */}
        {/* home1133
        <Button type="primary">暗暗啊啊那</Button>
        <img src={img} />
        <img src={bigImg} />
        <div className="bg-img"> 
          <Ding/>
        </div> */}
        <div className='border image'></div>
        <div className="border"> </div>
    </div>
  }
}