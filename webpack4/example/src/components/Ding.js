import React, {Component} from 'react';
import utils from 'utils';

export default class Ding extends Component {
  componentDidMount() {
    utils.getName('Ding');
  }
  render() {
    return <div>
      dingCompoent
    </div>
  }
}