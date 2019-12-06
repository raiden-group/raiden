import React from 'react';
import ReactDom from 'react-dom';
import { Route, HashRouter, Redirect, Link, Switch } from 'react-router-dom';
import './index.less';
// import AsyncLoad from 'components/AsyncLoad';
// import Loadable from 'react-loadable';
// const LoadingComponent = () => {
//   return <div>加载中...</div>
// }

// const Home =  (props) => {
//   return <AsyncLoad {...props} load={() => import(/*webpackChunkName: "home"*/ './container/home' )} />
// }

// const Abort = (props) => {
//   return <AsyncLoad {...props} load={() => import(/*webpackChunkName: "abort"*/ './container/abort' )} />
// };
// const Other = (props) => {
//   return <AsyncLoad {...props} load={() => import(/*webpackChunkName: "other"*/ './container/other' )} />
// };


// const Home = Loadable({
//   loader: () => 
//     import(
//       /* webpackChunkName: "home" */
//       './container/home' 
//     ),
//   loading: LoadingComponent
// });
// const Abort = Loadable({
//   loader: () => import(
//     /*webpackChunkName: "abort"*/ 
//     './container/abort'
//   ),
//   loading: LoadingComponent
// });
// const Other = Loadable({
//   loader: () => import(/*webpackChunkName: "other"*/ './container/other' ),
//   loading: LoadingComponent
// });

import Home from 'container/home';
import Abort from 'container/abort';
import Other from 'container/other';


class Homer extends React.Component {
  render() {
    return <div className={'wrap'}>
      <HashRouter>
        <div>
          <div className='nav'>
            <Link  to='/home' >首页111</Link>
            <Link  to='/abort' >关于我们</Link>
            <Link  to='/other' >其它</Link>
          </div>
          <Switch>
            <Route path='/home' component={Home}/>
            <Route path='/abort' component={Abort}/>
            <Route path='/other' component={Other}/>
            <Redirect from='*' to='/home' />
          </Switch>
        </div>
      </HashRouter>
    </div>
  }
}
ReactDom.render(<Homer/>, document.getElementById('stage'));