import React, { Component } from 'react';
export default class AsyncComponent extends Component {
  unmount = false
  constructor () {
    super()
    this.state = {
      Child: null
    }
  }
  componentWillUnmount () {
    this.unmount = true
  }
  async componentDidMount () {
    const { default: Child } = await this.props.load();
    if (this.unmount) return
    this.setState({
      Child
    })
  }
  render () {
    const { Child } = this.state;
    return (
      Child ? <Child {...this.props} /> : (this.props.placeholder || '加载中...')
    )
  }
}