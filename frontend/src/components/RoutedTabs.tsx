import React, { PropsWithChildren, ReactNode } from 'react';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';

interface Props {
  className?: string;
}

interface TabProps extends Props {
  path: string | Array<string>;
  label: string | ReactNode;
}

export function RoutedTab({ path, label, children, ...props }: PropsWithChildren<TabProps>) {
  const match = useRouteMatch({
    path: path,
    exact: true,
  });
  const className = props.className + ' ' + (match ? 'selected' : '');
  return (
    <div className={className}>
      <Link to={typeof path === 'string' ? path : path[0]}>{label}</Link>
    </div>
  );
}

export function RoutedTabs({ children, ...props }: PropsWithChildren<Props>) {
  const func = () => {
    let key = 0;
    const result = [];
    if (children && typeof children === 'object' && 'length' in children) {
      for (const child of children as Array<any>) {
        const path = 'props' in child && child.props.path;
        const children = 'props' in child && child.props.children;
        if (children !== null) {
          result.push(
            <Route path={path} exact={true} key={key}>
              {children}
            </Route>
          );
          key++;
        }
      }
    }
    return result;
  };
  return (
    <>
      <div className={props.className}>{children}</div>
      <Switch>{func()}</Switch>
    </>
  );
}

export default RoutedTabs;
